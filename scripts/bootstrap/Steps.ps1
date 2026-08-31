# Steps.ps1, the SwayCommand dependency graph.
#
#   system ─┬─ repo ─┬─ node ── npm-deps ─┬─ electron-runtime ── launch
#           │        │                    └─ renderer ──────────┘
#           └─ dfu-driver (optional)
#
# Each node tests for the *artifact it is responsible for*, never for a proxy.
# `electron-runtime` looks for dist/electron.exe, not for node_modules/electron,
# because electron >= 43 ships no postinstall and npm will happily create the
# second without ever producing the first.

$script:NodeFallbackVersion = 'v22.19.0'
$script:NodeMinMajor = 18
$script:NodeDistIndex = 'https://nodejs.org/dist/index.json'
$script:DfuDriverZip = 'https://cdn.audima.com.au/software/Windows%20DFU%20Driver.zip'
$script:AudimaUserAgent = 'SwayCommand/0.1 (Sway companion; +https://github.com/swaycommand)'

function Get-WindowsNodeArch {
    switch ($env:PROCESSOR_ARCHITECTURE) {
        'AMD64' { return 'x64' }
        'ARM64' { return 'arm64' }
        'x86'   { if ($env:PROCESSOR_ARCHITEW6432 -eq 'AMD64') { return 'x64' } else { return 'x86' } }
        default { return 'x64' }
    }
}

function Get-ElectronArch {
    switch ($env:PROCESSOR_ARCHITECTURE) {
        'AMD64' { return 'x64' }
        'ARM64' { return 'arm64' }
        'x86'   { return 'ia32' }
        default { return 'x64' }
    }
}

function Get-NodeMajor {
    param([string]$NodeExe)
    if ([string]::IsNullOrWhiteSpace($NodeExe)) { return $null }
    if (-not (Test-Path -LiteralPath $NodeExe)) { return $null }
    try {
        $raw = & $NodeExe --version 2>$null | Select-Object -First 1
        if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
        $text = ([string]$raw).Trim().TrimStart('v').Split('.')[0]
        $major = 0
        if ([int]::TryParse($text, [ref]$major)) { return $major }
        return $null
    } catch {
        return $null
    }
}

function Set-ResolvedNode {
    # Pin the interpreter for the rest of the run by absolute path. This is why
    # a fresh machine needs only one double-click: nothing downstream depends on
    # the parent cmd.exe's PATH ever picking up an installer's changes.
    param($Context, [string]$NodeExe)
    $Context.NodeExe = $NodeExe
    $nodeDir = Split-Path -Parent $NodeExe
    # Covers both shapes: a portable zip and a system install both keep npm at
    # <dir-of-node.exe>\node_modules\npm.
    $candidates = @(
        (Join-Path $nodeDir 'node_modules\npm\bin\npm-cli.js')
    )
    $npmCli = $null
    foreach ($c in $candidates) {
        if (Test-Path -LiteralPath $c) { $npmCli = $c; break }
    }
    if ($null -eq $npmCli) {
        # System Node installs keep npm in the shared prefix rather than beside node.exe.
        $shared = Join-Path $env:APPDATA 'npm\node_modules\npm\bin\npm-cli.js'
        if (Test-Path -LiteralPath $shared) { $npmCli = $shared }
    }
    $Context.NpmCli = $npmCli
}

function Invoke-Npm {
    # Always `node npm-cli.js`, never `npm.cmd`. Invoking the shim needs a shell
    # and inherits its quoting rules; going straight to the CLI script does not.
    param($Context, [string[]]$NpmArgs, [scriptblock]$OnLine, [scriptblock]$OnPoll, [int]$TimeoutSeconds = 1800)
    if ([string]::IsNullOrWhiteSpace($Context.NpmCli)) {
        throw 'npm could not be located next to the resolved Node.js installation.'
    }
    $argv = @($Context.NpmCli) + $NpmArgs
    return Invoke-TrackedProcess -Context $Context -FilePath $Context.NodeExe -Arguments $argv `
        -WorkingDirectory $Context.RepoRoot -OnLine $OnLine -OnPoll $OnPoll -TimeoutSeconds $TimeoutSeconds
}

function Get-LockfileHash {
    param($Context)
    $lock = Join-Path $Context.RepoRoot 'package-lock.json'
    if (Test-Path -LiteralPath $lock) { return Get-Sha256 -Path $lock }
    return Get-Sha256 -Path (Join-Path $Context.RepoRoot 'package.json')
}

function Get-ExpectedPackageCount {
    <#
      How many directories `npm install` should leave directly under
      node_modules. The lockfile over-counts: it lists nested trees and
      platform-specific optional packages that will never be installed here. So
      the lockfile figure is only the first-run guess, after one successful
      install we use the count this machine actually produced, and the progress
      bar becomes exact from the second run onwards.
    #>
    param($Context)
    $measured = Get-StepRecord -Context $Context -Id 'npm-deps' -Field 'packageCount'
    if ($null -ne $measured -and [int]$measured -gt 0) { return [int]$measured }
    try {
        $lock = Join-Path $Context.RepoRoot 'package-lock.json'
        if (-not (Test-Path -LiteralPath $lock)) { return 0 }
        $obj = ConvertFrom-Json (Get-Content -LiteralPath $lock -Raw -Encoding utf8)
        if ($null -eq $obj.packages) { return 0 }
        $top = 0
        foreach ($p in $obj.packages.PSObject.Properties) {
            if ($p.Name -match '^node_modules/(@[^/]+/)?[^/]+$') { $top++ }
        }
        return $top
    } catch {
        return 0
    }
}

function Get-InstalledPackageCount {
    # Real progress for `npm install`: npm emits no machine-readable progress,
    # but the tree it is building is observable, and package-lock.json says
    # exactly how big it will be.
    param($Context)
    $nm = Join-Path $Context.RepoRoot 'node_modules'
    if (-not (Test-Path -LiteralPath $nm)) { return 0 }
    try {
        $count = 0
        foreach ($dir in [System.IO.Directory]::GetDirectories($nm)) {
            $leaf = Split-Path -Leaf $dir
            if ($leaf.StartsWith('.')) { continue }
            if ($leaf.StartsWith('@')) {
                $count += [System.IO.Directory]::GetDirectories($dir).Count
            } else {
                $count++
            }
        }
        return $count
    } catch {
        return 0
    }
}

# --- graph -------------------------------------------------------------------

function New-SwayBootstrapGraph {
    param([Parameter(Mandatory = $true)]$Context)

    $steps = New-Object System.Collections.ArrayList

    # --- system ---------------------------------------------------------------
    [void]$steps.Add((New-BootstrapStep -Id 'system' -Name 'System' `
        -Description 'Windows version, architecture and free disk space' `
        -EstimateSeconds 1 `
        -Test {
            param($ctx)
            $os = [System.Environment]::OSVersion.Version
            $arch = Get-WindowsNodeArch
            $free = Get-FreeDiskGb -Path $ctx.InstallRoot
            $detail = 'Windows {0}.{1}.{2} · {3}' -f $os.Major, $os.Minor, $os.Build, $arch
            if ($null -ne $free) {
                $detail = '{0} · {1} GB free' -f $detail, $free
                if ($free -lt 2) {
                    return @{ Satisfied = $false; Detail = "Only $free GB free, SwayCommand needs about 1.5 GB" }
                }
            }
            return @{ Satisfied = $true; Detail = $detail }
        } `
        -Install {
            param($ctx, $report)
            throw 'Not enough free disk space. Free up about 1.5 GB and run this again.'
        }))

    # --- repo -----------------------------------------------------------------
    [void]$steps.Add((New-BootstrapStep -Id 'repo' -Name 'Project files' `
        -Description 'A complete checkout of the SwayCommand source' `
        -Requires @('system') -EstimateSeconds 1 `
        -Test {
            param($ctx)
            $required = @('package.json', 'src\main\main.js', 'scripts\build-renderer.js')
            $missing = @()
            foreach ($rel in $required) {
                if (-not (Test-Path -LiteralPath (Join-Path $ctx.RepoRoot $rel))) { $missing += $rel }
            }
            if ($missing.Count -gt 0) {
                return @{ Satisfied = $false; Detail = "Missing: $($missing -join ', ')" }
            }
            return @{ Satisfied = $true; Detail = $ctx.RepoRoot }
        } `
        -Install {
            param($ctx, $report)
            throw "This folder is not a complete copy of SwayCommand. Re-download or re-clone the project, then run this again."
        }))

    # --- node -----------------------------------------------------------------
    [void]$steps.Add((New-BootstrapStep -Id 'node' -Name 'Node.js runtime' `
        -Description "Node.js $script:NodeMinMajor or newer, used to build and start the app" `
        -Requires @('repo') -EstimateSeconds 45 -DownloadBytes 31MB `
        -VariantEstimates @{ cached = 12; download = 45 } `
        -Test {
            param($ctx)
            # A private copy we installed earlier wins over PATH: it is the one
            # we know the version of, and it survives PATH changes.
            $remembered = Get-StepRecord -Context $ctx -Id 'node' -Field 'exePath'
            foreach ($candidate in @($remembered, (Test-CommandPath -Name 'node'))) {
                if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
                $major = Get-NodeMajor -NodeExe $candidate
                if ($null -ne $major -and $major -ge $script:NodeMinMajor) {
                    Set-ResolvedNode -Context $ctx -NodeExe $candidate
                    if ([string]::IsNullOrWhiteSpace($ctx.NpmCli)) { continue }
                    $scope = 'system'
                    if ($candidate -like "$($ctx.ToolchainDir)*") { $scope = 'private copy' }
                    return @{ Satisfied = $true; Detail = "v$major ($scope)" }
                }
            }
            $variant = 'download'
            foreach ($z in @(Get-ChildItem -LiteralPath $ctx.CacheDir -Filter 'node-v*-win-*.zip' -ErrorAction SilentlyContinue)) {
                if ($z.Length -gt 10MB) { $variant = 'cached'; break }
            }
            return @{
                Satisfied = $false
                Detail    = 'Not found, a private copy will be installed just for SwayCommand'
                Variant   = $variant
            }
        } `
        -Install {
            param($ctx, $report)
            $arch = Get-WindowsNodeArch
            $version = $script:NodeFallbackVersion

            $report.Invoke(@{ Progress = 0.02; Detail = 'Looking up the current Node.js LTS release' })
            try {
                $req = [System.Net.HttpWebRequest]::Create($script:NodeDistIndex)
                $req.UserAgent = 'SwayCommand-Bootstrap/1.0'
                $req.Timeout = 15000
                $resp = $req.GetResponse()
                $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
                $index = ConvertFrom-Json $reader.ReadToEnd()
                $reader.Close(); $resp.Close()
                foreach ($entry in $index) {
                    if ($entry.lts -eq $false) { continue }
                    $major = [int]($entry.version.TrimStart('v').Split('.')[0])
                    if ($major -ge $script:NodeMinMajor) { $version = $entry.version; break }
                }
            } catch {
                Write-BootstrapLog -Context $ctx -Level warn -Message "Node dist index unreachable, pinning $version"
            }

            # A portable zip needs no administrator, touches no system PATH, and
            # cannot collide with a Node the user installed for something else.
            $name = "node-$version-win-$arch"
            $zipUrl = "https://nodejs.org/dist/$version/$name.zip"
            $zipPath = Join-Path $ctx.CacheDir "$name.zip"
            $target = Join-Path $ctx.ToolchainDir $name
            $nodeExe = Join-Path $target 'node.exe'

            if (-not (Test-Path -LiteralPath $nodeExe)) {
                if (-not (Test-Path -LiteralPath $zipPath)) {
                    Invoke-TrackedDownload -Uri $zipUrl -Destination $zipPath -Report $report `
                        -ProgressFloor 0.05 -ProgressCeiling 0.75 -Label 'Downloading Node.js' | Out-Null
                } else {
                    $report.Invoke(@{ Progress = 0.75; Detail = 'Using the cached Node.js download' })
                }
                $report.Invoke(@{ Progress = 0.78; Detail = 'Extracting Node.js'; SecondsRemaining = $null })
                if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target -Recurse -Force }
                Expand-TrackedZip -ZipPath $zipPath -Destination $ctx.ToolchainDir -Report $report `
                    -ProgressFloor 0.78 -ProgressCeiling 0.98
            }

            if (-not (Test-Path -LiteralPath $nodeExe)) {
                throw "Node.js was downloaded but node.exe is not where it was expected ($nodeExe)."
            }
            $major = Get-NodeMajor -NodeExe $nodeExe
            if ($null -eq $major -or $major -lt $script:NodeMinMajor) {
                throw "The downloaded Node.js did not run correctly."
            }
            Set-ResolvedNode -Context $ctx -NodeExe $nodeExe
            Set-StepRecord -Context $ctx -Id 'node' -Values @{ exePath = $nodeExe; version = $version }
            Save-BootstrapState -Context $ctx
            $report.Invoke(@{ Progress = 1.0; Detail = "Node.js $version ready (private copy)" })
        }))

    # --- npm dependencies -----------------------------------------------------
    [void]$steps.Add((New-BootstrapStep -Id 'npm-deps' -Name 'Project dependencies' `
        -Description 'The npm packages listed in package-lock.json' `
        -Requires @('node') -EstimateSeconds 40 `
        -Test {
            param($ctx)
            $nm = Join-Path $ctx.RepoRoot 'node_modules'
            if (-not (Test-Path -LiteralPath $nm)) {
                return @{ Satisfied = $false; Detail = 'Not installed yet' }
            }
            # Content-addressed, so a fresh clone's mtimes are irrelevant and a
            # lockfile-only dependency bump is still noticed.
            # npm writes node_modules/.package-lock.json only after a reify
            # finishes, so its presence (not a directory count) is the
            # trustworthy "the install completed" marker.
            if (-not (Test-Path -LiteralPath (Join-Path $nm '.package-lock.json'))) {
                return @{ Satisfied = $false; Detail = 'A previous install did not finish' }
            }
            $current = Get-LockfileHash -Context $ctx
            $recorded = Get-StepRecord -Context $ctx -Id 'npm-deps' -Field 'lockHash'
            if ($recorded -ne $current) {
                return @{ Satisfied = $false; Detail = 'package-lock.json changed since the last install' }
            }
            return @{ Satisfied = $true; Detail = "$(Get-InstalledPackageCount -Context $ctx) packages installed" }
        } `
        -Install {
            param($ctx, $report)
            $expected = Get-ExpectedPackageCount -Context $ctx
            $report.Invoke(@{ Progress = 0.01; Detail = 'Resolving packages' })

            $poll = {
                if ($expected -le 0) { return }
                $installed = Get-InstalledPackageCount -Context $ctx
                $fraction = [math]::Min(0.97, $installed / [double]$expected)
                $report.Invoke(@{
                    Progress = $fraction
                    Detail   = "$installed of $expected packages"
                })
            }.GetNewClosure()

            $result = Invoke-Npm -Context $ctx -NpmArgs @('install', '--no-audit', '--no-fund') -OnPoll $poll
            if ($result.ExitCode -ne 0) {
                throw "npm install exited with code $($result.ExitCode). The full output is in the log."
            }
            $installed = Get-InstalledPackageCount -Context $ctx
            Set-StepRecord -Context $ctx -Id 'npm-deps' -Values @{
                lockHash     = (Get-LockfileHash -Context $ctx)
                packageCount = $installed
            }
            Save-BootstrapState -Context $ctx
            $report.Invoke(@{ Progress = 1.0; Detail = "$installed packages installed" })
        }))

    # --- electron runtime -----------------------------------------------------
    [void]$steps.Add((New-BootstrapStep -Id 'electron-runtime' -Name 'Electron runtime' `
        -Description 'The browser runtime SwayCommand renders in (about 235 MB)' `
        -Requires @('npm-deps') -EstimateSeconds 150 -DownloadBytes 110MB `
        -VariantEstimates @{ cached = 8; download = 150 } `
        -Test {
            param($ctx)
            $exe = Join-Path $ctx.RepoRoot 'node_modules\electron\dist\electron.exe'
            if (Test-Path -LiteralPath $exe) {
                $size = [math]::Round((Get-Item -LiteralPath $exe).Length / 1MB)
                return @{ Satisfied = $true; Detail = "Installed ($size MB)" }
            }

            # Unpacking a zip we already hold and fetching 110 MB are different
            # jobs. Say which one this will be so the estimate can be honest
            # before a single byte moves.
            $variant = 'download'
            $pkg = Join-Path $ctx.RepoRoot 'node_modules\electron\package.json'
            if (Test-Path -LiteralPath $pkg) {
                try {
                    $version = (ConvertFrom-Json (Get-Content -LiteralPath $pkg -Raw -Encoding utf8)).version
                    $cached = Join-Path $ctx.CacheDir "electron-v$version-win32-$(Get-ElectronArch).zip"
                    if ((Test-Path -LiteralPath $cached) -and (Get-Item -LiteralPath $cached).Length -gt 50MB) {
                        $variant = 'cached'
                    }
                } catch { }
                $detail = 'Package present but the runtime binary was never downloaded'
                if ($variant -eq 'cached') { $detail = 'Will be restored from the local cache, no download needed' }
                # The defect this whole node exists for: npm reports success, the
                # package folder is present, and the runtime is simply not there.
                return @{ Satisfied = $false; Detail = $detail; Variant = $variant }
            }
            return @{ Satisfied = $false; Detail = 'Not installed yet'; Variant = $variant }
        } `
        -Install {
            param($ctx, $report)
            $electronDir = Join-Path $ctx.RepoRoot 'node_modules\electron'
            $distDir = Join-Path $electronDir 'dist'
            $version = (ConvertFrom-Json (Get-Content -LiteralPath (Join-Path $electronDir 'package.json') -Raw -Encoding utf8)).version
            $arch = Get-ElectronArch
            $zipName = "electron-v$version-win32-$arch.zip"
            $cachedZip = Join-Path $ctx.CacheDir $zipName

            # The npm package ships the release's SHA-256 manifest, so the
            # download can be verified without a second network round trip.
            $expectedHash = $null
            try {
                $sums = ConvertFrom-Json (Get-Content -LiteralPath (Join-Path $electronDir 'checksums.json') -Raw -Encoding utf8)
                if ($sums.PSObject.Properties.Name -contains $zipName) {
                    $expectedHash = ([string]$sums.$zipName).Trim().ToLowerInvariant()
                }
            } catch { }

            $haveValidZip = $false
            if (Test-Path -LiteralPath $cachedZip) {
                $report.Invoke(@{ Progress = 0.05; Detail = 'Verifying the cached Electron download' })
                if ($null -eq $expectedHash) {
                    $haveValidZip = $true
                } elseif ((Get-Sha256 -Path $cachedZip) -eq $expectedHash) {
                    $haveValidZip = $true
                } else {
                    Remove-Item -LiteralPath $cachedZip -Force -ErrorAction SilentlyContinue
                }
            }

            $usedFallback = $false
            if (-not $haveValidZip) {
                $mirror = 'https://github.com/electron/electron/releases/download'
                if (-not [string]::IsNullOrWhiteSpace($env:ELECTRON_MIRROR)) { $mirror = $env:ELECTRON_MIRROR.TrimEnd('/') }
                $url = "$mirror/v$version/$zipName"
                try {
                    Invoke-TrackedDownload -Uri $url -Destination $cachedZip -Report $report `
                        -ProgressFloor 0.05 -ProgressCeiling 0.72 -Label 'Downloading Electron' | Out-Null
                    if ($null -ne $expectedHash) {
                        $report.Invoke(@{ Progress = 0.74; Detail = 'Verifying download'; SecondsRemaining = $null })
                        $actual = Get-Sha256 -Path $cachedZip
                        if ($actual -ne $expectedHash) {
                            Remove-Item -LiteralPath $cachedZip -Force -ErrorAction SilentlyContinue
                            throw "The Electron download did not match its published checksum."
                        }
                    }
                } catch {
                    # Never dead-end: hand off to Electron's own installer, which
                    # knows about proxies and mirrors we may not.
                    Write-BootstrapLog -Context $ctx -Level warn -Message "Direct Electron download failed: $($_.Exception.Message). Falling back to install.js."
                    $report.Invoke(@{ Progress = 0.3; Detail = "Retrying with Electron's own installer"; SecondsRemaining = $null })
                    $env:ELECTRON_CACHE = $ctx.CacheDir
                    $installJs = Join-Path $electronDir 'install.js'
                    $res = Invoke-TrackedProcess -Context $ctx -FilePath $ctx.NodeExe -Arguments @($installJs) -TimeoutSeconds 1800
                    if ($res.ExitCode -ne 0) {
                        throw "Could not download the Electron runtime (exit code $($res.ExitCode)). Check your internet connection or proxy settings."
                    }
                    $usedFallback = $true
                }
            } else {
                $report.Invoke(@{ Progress = 0.72; Detail = 'Using the cached Electron download' })
            }

            if (-not $usedFallback) {
                $report.Invoke(@{ Progress = 0.76; Detail = 'Installing the Electron runtime'; SecondsRemaining = $null })
                if (Test-Path -LiteralPath $distDir) { Remove-Item -LiteralPath $distDir -Recurse -Force }
                Expand-TrackedZip -ZipPath $cachedZip -Destination $distDir -Report $report `
                    -ProgressFloor 0.76 -ProgressCeiling 0.98
                Set-Content -LiteralPath (Join-Path $electronDir 'path.txt') -Value 'electron.exe' -NoNewline -Encoding ascii
            }

            $exe = Join-Path $distDir 'electron.exe'
            if (-not (Test-Path -LiteralPath $exe)) {
                throw 'The Electron runtime did not unpack correctly.'
            }
            Set-StepRecord -Context $ctx -Id 'electron-runtime' -Values @{ version = $version; arch = $arch }
            Save-BootstrapState -Context $ctx
            $report.Invoke(@{ Progress = 1.0; Detail = "Electron $version ready" })
        }))

    # --- renderer bundle ------------------------------------------------------
    [void]$steps.Add((New-BootstrapStep -Id 'renderer' -Name 'Interface build' `
        -Description "Bundles the app's interface and scenes" `
        -Requires @('npm-deps') -EstimateSeconds 8 `
        -Test {
            param($ctx)
            $bundle = Join-Path $ctx.RepoRoot 'dist\renderer.bundle.js'
            if (-not (Test-Path -LiteralPath $bundle)) {
                return @{ Satisfied = $false; Detail = 'Not built yet' }
            }
            $bundleTime = (Get-Item -LiteralPath $bundle).LastWriteTimeUtc
            $newest = $bundleTime
            foreach ($root in @((Join-Path $ctx.RepoRoot 'src\renderer'), (Join-Path $ctx.RepoRoot 'src\shared'))) {
                if (-not (Test-Path -LiteralPath $root)) { continue }
                foreach ($f in [System.IO.Directory]::EnumerateFiles($root, '*.js', 'AllDirectories')) {
                    $t = [System.IO.File]::GetLastWriteTimeUtc($f)
                    if ($t -gt $newest) { $newest = $t }
                }
            }
            $builder = Join-Path $ctx.RepoRoot 'scripts\build-renderer.js'
            if (Test-Path -LiteralPath $builder) {
                $t = [System.IO.File]::GetLastWriteTimeUtc($builder)
                if ($t -gt $newest) { $newest = $t }
            }
            if ($newest -gt $bundleTime) {
                return @{ Satisfied = $false; Detail = 'Sources changed since the last build' }
            }
            return @{ Satisfied = $true; Detail = 'Up to date' }
        } `
        -Install {
            param($ctx, $report)
            $report.Invoke(@{ Progress = 0.2; Detail = 'Bundling' })
            $builder = Join-Path $ctx.RepoRoot 'scripts\build-renderer.js'
            $res = Invoke-TrackedProcess -Context $ctx -FilePath $ctx.NodeExe -Arguments @($builder) -TimeoutSeconds 600
            if ($res.ExitCode -ne 0) {
                throw "The interface build failed (exit code $($res.ExitCode)). The full output is in the log."
            }
            $report.Invoke(@{ Progress = 1.0; Detail = 'Built' })
        }))

    # --- optional: DFU driver -------------------------------------------------
    [void]$steps.Add((New-BootstrapStep -Id 'dfu-driver' -Name 'Sway firmware-update driver' `
        -Description 'Official STM32 WinUSB driver. Only needed to update Sway firmware, playing needs no driver. Asks for administrator approval.' `
        -Requires @('system') -Optional -DefaultSelected $false -EstimateSeconds 25 `
        -Test {
            param($ctx)
            try {
                $out = & pnputil.exe /enum-drivers 2>$null | Out-String
                if ($out -match 'stm32bootloader\.inf') {
                    return @{ Satisfied = $true; Detail = 'Already staged' }
                }
                return @{ Satisfied = $false; Detail = 'Not installed' }
            } catch {
                return @{ Satisfied = $false; Detail = 'Not installed' }
            }
        } `
        -Install {
            param($ctx, $report)
            $zip = Join-Path $ctx.CacheDir 'audima-dfu-driver.zip'
            $outDir = Join-Path $ctx.CacheDir 'audima-dfu-driver'
            if (-not (Test-Path -LiteralPath $zip)) {
                Invoke-TrackedDownload -Uri $script:DfuDriverZip -Destination $zip -Report $report `
                    -UserAgent $script:AudimaUserAgent -ProgressFloor 0.05 -ProgressCeiling 0.55 `
                    -Label 'Downloading driver' | Out-Null
            } else {
                $report.Invoke(@{ Progress = 0.55; Detail = 'Using the cached driver package' })
            }
            $report.Invoke(@{ Progress = 0.6; Detail = 'Unpacking'; SecondsRemaining = $null })
            if (Test-Path -LiteralPath $outDir) { Remove-Item -LiteralPath $outDir -Recurse -Force }
            Expand-TrackedZip -ZipPath $zip -Destination $outDir -ProgressFloor 0.6 -ProgressCeiling 0.7 -Report $report

            $inf = $null
            foreach ($f in [System.IO.Directory]::EnumerateFiles($outDir, '*.inf', 'AllDirectories')) {
                if ((Split-Path -Leaf $f) -match '^stm32bootloader\.inf$') { $inf = $f; break }
            }
            if ($null -eq $inf) { throw 'STM32Bootloader.inf was not found in the driver package.' }

            $report.Invoke(@{ Progress = 0.8; Detail = 'Waiting for administrator approval' })
            $cmd = "`$p = Start-Process -FilePath pnputil.exe -ArgumentList '/add-driver','`"$inf`"','/install' -Verb RunAs -Wait -PassThru; exit `$p.ExitCode"
            $res = Invoke-TrackedProcess -Context $ctx -FilePath 'powershell.exe' `
                -Arguments @('-NoProfile', '-NonInteractive', '-Command', $cmd) -TimeoutSeconds 300
            if ($res.ExitCode -ne 0) {
                throw 'The driver was not installed, administrator approval was declined or pnputil reported an error. SwayCommand still plays normally without it.'
            }
            $report.Invoke(@{ Progress = 1.0; Detail = 'Driver staged' })
        }))

    return (Resolve-StepOrder -Steps $steps.ToArray())
}

function Start-SwayCommand {
    <#
      Launches the app with an environment we control. Returns the Process.
      This is the payoff for pinning NodeExe: nothing here consults PATH.
    #>
    param([Parameter(Mandatory = $true)]$Context)
    $electron = Join-Path $Context.RepoRoot 'node_modules\electron\dist\electron.exe'
    if (-not (Test-Path -LiteralPath $electron)) {
        throw 'The Electron runtime is missing, so SwayCommand cannot start.'
    }
    Clear-HostileEnvironment
    Write-BootstrapLog -Context $Context -Message "launching: $electron ."
    return Start-Process -FilePath $electron -ArgumentList @('.') `
        -WorkingDirectory $Context.RepoRoot -PassThru
}
