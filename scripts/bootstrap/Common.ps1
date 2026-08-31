# Common.ps1, shared plumbing for the SwayCommand bootstrapper.
#
# Windows PowerShell 5.1 compatible on purpose: this code has to run on a
# machine where nothing is installed yet, so it may not assume Node, pwsh 7,
# or any module outside the box. No ternaries, no ??, no && / ||.

[Net.ServicePointManager]::SecurityProtocol =
    [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls11

# Environment variables that break a child Electron/Node process if inherited.
# ELECTRON_RUN_AS_NODE is the important one: every Electron-hosted terminal
# (VS Code's integrated terminal above all) exports it, and with it set
# require('electron') hands back a path string instead of the API object, so
# src/main/main.js dies on `app.commandLine`. See docs/INSTALLER-DIAGNOSIS.md.
$script:HostileEnvNames = @(
    'ELECTRON_RUN_AS_NODE'
    'ELECTRON_NO_ATTACH_CONSOLE'
    'ELECTRON_OVERRIDE_DIST_PATH'
    'ELECTRON_NO_ASAR'
    'NODE_OPTIONS'
)

function Clear-HostileEnvironment {
    # Scrubs this process's own environment. Children inherit from us, so doing
    # it once here is enough to keep every spawned npm/node/electron clean.
    foreach ($name in $script:HostileEnvNames) {
        if (Test-Path -LiteralPath "Env:\$name") { Remove-Item -LiteralPath "Env:\$name" -Force }
    }
    foreach ($item in @(Get-ChildItem Env: | Where-Object { $_.Name -like 'VSCODE_*' })) {
        Remove-Item -LiteralPath "Env:\$($item.Name)" -Force -ErrorAction SilentlyContinue
    }
}

function New-BootstrapContext {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [string]$InstallRoot
    )
    if ([string]::IsNullOrWhiteSpace($InstallRoot)) {
        $InstallRoot = Join-Path $env:LOCALAPPDATA 'SwayCommand'
    }
    $ctx = [pscustomobject]@{
        RepoRoot     = $RepoRoot
        InstallRoot  = $InstallRoot
        ToolchainDir = Join-Path $InstallRoot 'toolchain'
        CacheDir     = Join-Path $InstallRoot 'cache'
        LogDir       = Join-Path $InstallRoot 'logs'
        StateFile    = Join-Path $InstallRoot 'bootstrap-state.json'
        LogFile      = $null
        # Filled in by steps as they resolve tools, so later steps never have to
        # depend on PATH having been refreshed mid-run.
        NodeExe      = $null
        NpmCli       = $null
        State        = $null
    }
    foreach ($dir in @($ctx.InstallRoot, $ctx.ToolchainDir, $ctx.CacheDir, $ctx.LogDir)) {
        if (-not (Test-Path -LiteralPath $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    $ctx.LogFile = Join-Path $ctx.LogDir ('bootstrap-{0:yyyyMMdd-HHmmss}.log' -f (Get-Date))
    $ctx.State = Read-BootstrapState -Path $ctx.StateFile
    return $ctx
}

function Write-BootstrapLog {
    param(
        [Parameter(Mandatory = $true)]$Context,
        [string]$Message,
        [ValidateSet('info', 'warn', 'error')][string]$Level = 'info'
    )
    $line = '{0:HH:mm:ss} [{1}] {2}' -f (Get-Date), $Level.ToUpper(), $Message
    try { Add-Content -LiteralPath $Context.LogFile -Value $line -Encoding utf8 } catch { }
}

# --- state -------------------------------------------------------------------
# The state file is what stops the bootstrapper redoing work. Everything in it
# is content-addressed (hashes, versions, absolute paths) rather than
# timestamp-based, because a fresh `git clone` writes arbitrary mtimes.

function Read-BootstrapState {
    param([string]$Path)
    $empty = @{ steps = @{}; timings = @{} }
    if (-not (Test-Path -LiteralPath $Path)) { return $empty }
    try {
        $raw = Get-Content -LiteralPath $Path -Raw -Encoding utf8
        if ([string]::IsNullOrWhiteSpace($raw)) { return $empty }
        $obj = ConvertFrom-Json $raw
        $state = @{ steps = @{}; timings = @{} }
        if ($obj.PSObject.Properties.Name -contains 'steps' -and $null -ne $obj.steps) {
            foreach ($p in $obj.steps.PSObject.Properties) { $state.steps[$p.Name] = $p.Value }
        }
        if ($obj.PSObject.Properties.Name -contains 'timings' -and $null -ne $obj.timings) {
            foreach ($p in $obj.timings.PSObject.Properties) { $state.timings[$p.Name] = [double]$p.Value }
        }
        return $state
    } catch {
        return $empty
    }
}

function Save-BootstrapState {
    param([Parameter(Mandatory = $true)]$Context)
    try {
        $json = ConvertTo-Json $Context.State -Depth 8
        Set-Content -LiteralPath $Context.StateFile -Value $json -Encoding utf8
    } catch {
        Write-BootstrapLog -Context $Context -Level warn -Message "Could not persist state: $($_.Exception.Message)"
    }
}

function Set-StepRecord {
    param($Context, [string]$Id, [hashtable]$Values)
    if (-not $Context.State.steps.ContainsKey($Id)) { $Context.State.steps[$Id] = @{} }
    $record = @{}
    $existing = $Context.State.steps[$Id]
    if ($existing -is [hashtable]) {
        foreach ($k in $existing.Keys) { $record[$k] = $existing[$k] }
    } elseif ($null -ne $existing) {
        foreach ($p in $existing.PSObject.Properties) { $record[$p.Name] = $p.Value }
    }
    foreach ($k in $Values.Keys) { $record[$k] = $Values[$k] }
    $Context.State.steps[$Id] = $record
}

function Get-StepRecord {
    param($Context, [string]$Id, [string]$Field)
    if (-not $Context.State.steps.ContainsKey($Id)) { return $null }
    $record = $Context.State.steps[$Id]
    if ($record -is [hashtable]) {
        if ($record.ContainsKey($Field)) { return $record[$Field] }
        return $null
    }
    if ($null -ne $record -and ($record.PSObject.Properties.Name -contains $Field)) {
        return $record.$Field
    }
    return $null
}

# Rolling record of how long each step actually took on THIS machine, so the
# second run's time estimate is measured rather than guessed.
function Update-StepTiming {
    param($Context, [string]$Id, [double]$Seconds)
    if ($Seconds -le 0) { return }
    if ($Context.State.timings.ContainsKey($Id)) {
        # Exponential moving average; recent runs dominate but one freak result
        # (a stalled download) cannot poison the estimate permanently.
        $Context.State.timings[$Id] = (0.6 * [double]$Context.State.timings[$Id]) + (0.4 * $Seconds)
    } else {
        $Context.State.timings[$Id] = $Seconds
    }
}

function Get-StepTiming {
    param($Context, [string]$Id)
    if ($Context.State.timings.ContainsKey($Id)) { return [double]$Context.State.timings[$Id] }
    return $null
}

# --- hashing -----------------------------------------------------------------

function Get-Sha256 {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    try {
        return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
    } catch {
        return $null
    }
}

# --- download ----------------------------------------------------------------

function Format-Bytes {
    param([double]$Bytes)
    if ($Bytes -ge 1073741824) { return ('{0:0.0} GB' -f ($Bytes / 1073741824)) }
    if ($Bytes -ge 1048576) { return ('{0:0} MB' -f ($Bytes / 1048576)) }
    if ($Bytes -ge 1024) { return ('{0:0} KB' -f ($Bytes / 1024)) }
    return ('{0:0} B' -f $Bytes)
}

function Invoke-TrackedDownload {
    <#
      Streams a URL to disk, reporting true byte progress and a smoothed
      transfer rate. Downloads to a .part file and moves it into place only on
      success, so an interrupted run can never leave a corrupt artifact that a
      later run mistakes for a finished one.

      Report is invoked as Report.Invoke(@{ Progress; Detail; SecondsRemaining }).
    #>
    param(
        [Parameter(Mandatory = $true)][string]$Uri,
        [Parameter(Mandatory = $true)][string]$Destination,
        [scriptblock]$Report,
        [string]$UserAgent = 'SwayCommand-Bootstrap/1.0',
        [double]$ProgressFloor = 0.0,
        [double]$ProgressCeiling = 1.0,
        [string]$Label = 'Downloading'
    )
    $partFile = "$Destination.part"
    $parent = Split-Path -Parent $Destination
    if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    if (Test-Path -LiteralPath $partFile) { Remove-Item -LiteralPath $partFile -Force }

    $request = [System.Net.HttpWebRequest]::Create($Uri)
    $request.UserAgent = $UserAgent
    $request.Timeout = 60000
    $request.ReadWriteTimeout = 120000
    $request.AllowAutoRedirect = $true
    # Honour the machine's configured proxy, including authenticated ones.
    try {
        $proxy = [System.Net.WebRequest]::GetSystemWebProxy()
        $proxy.Credentials = [System.Net.CredentialCache]::DefaultCredentials
        $request.Proxy = $proxy
    } catch { }

    $response = $null
    $stream = $null
    $output = $null
    try {
        $response = $request.GetResponse()
        $total = [double]$response.ContentLength
        $stream = $response.GetResponseStream()
        $output = [System.IO.File]::Create($partFile)

        $buffer = New-Object byte[] 262144
        $read = 0
        $done = [double]0
        $started = Get-Date
        $lastReport = $started
        $lastBytes = [double]0
        $rate = [double]0

        while (($read = $stream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $output.Write($buffer, 0, $read)
            $done += $read
            $now = Get-Date
            $sinceReport = ($now - $lastReport).TotalSeconds
            if ($sinceReport -ge 0.25) {
                $instant = ($done - $lastBytes) / $sinceReport
                if ($rate -le 0) { $rate = $instant } else { $rate = (0.7 * $rate) + (0.3 * $instant) }
                $lastReport = $now
                $lastBytes = $done
                if ($null -ne $Report) {
                    $fraction = 0.0
                    $secondsLeft = $null
                    $detail = '{0} {1}' -f $Label, (Format-Bytes $done)
                    if ($total -gt 0) {
                        $fraction = $done / $total
                        $detail = '{0} of {1}' -f (Format-Bytes $done), (Format-Bytes $total)
                        if ($rate -gt 0) { $secondsLeft = ($total - $done) / $rate }
                    }
                    if ($rate -gt 0) { $detail = '{0}  ·  {1}/s' -f $detail, (Format-Bytes $rate) }
                    $span = $ProgressCeiling - $ProgressFloor
                    $Report.Invoke(@{
                        Progress        = $ProgressFloor + ($fraction * $span)
                        Detail          = $detail
                        SecondsRemaining = $secondsLeft
                    })
                }
            }
        }
        $output.Close(); $output = $null
        $stream.Close(); $stream = $null
        $response.Close(); $response = $null

        if (Test-Path -LiteralPath $Destination) { Remove-Item -LiteralPath $Destination -Force }
        Move-Item -LiteralPath $partFile -Destination $Destination -Force
        return $Destination
    } finally {
        if ($null -ne $output) { $output.Dispose() }
        if ($null -ne $stream) { $stream.Dispose() }
        if ($null -ne $response) { $response.Dispose() }
        if (Test-Path -LiteralPath $partFile) { Remove-Item -LiteralPath $partFile -Force -ErrorAction SilentlyContinue }
    }
}

function Expand-TrackedZip {
    <#
      Extracts entry-by-entry so the UI keeps moving through a 200 MB unzip
      instead of freezing on one opaque Expand-Archive call.
    #>
    param(
        [Parameter(Mandatory = $true)][string]$ZipPath,
        [Parameter(Mandatory = $true)][string]$Destination,
        [scriptblock]$Report,
        [double]$ProgressFloor = 0.0,
        [double]$ProgressCeiling = 1.0
    )
    Add-Type -AssemblyName System.IO.Compression.FileSystem -ErrorAction SilentlyContinue
    if (-not (Test-Path -LiteralPath $Destination)) {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }
    $archive = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
    try {
        $entries = $archive.Entries
        $count = $entries.Count
        $index = 0
        $span = $ProgressCeiling - $ProgressFloor
        $fullDest = (Resolve-Path -LiteralPath $Destination).ProviderPath
        foreach ($entry in $entries) {
            $index++
            $target = Join-Path $Destination $entry.FullName
            # Refuse path traversal out of the destination (zip-slip).
            $normalized = [System.IO.Path]::GetFullPath($target)
            if (-not $normalized.StartsWith($fullDest, [StringComparison]::OrdinalIgnoreCase)) { continue }
            if ([string]::IsNullOrEmpty($entry.Name)) {
                if (-not (Test-Path -LiteralPath $normalized)) {
                    New-Item -ItemType Directory -Path $normalized -Force | Out-Null
                }
                continue
            }
            $dir = Split-Path -Parent $normalized
            if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
            [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $normalized, $true)
            if ($null -ne $Report -and ($index % 25 -eq 0 -or $index -eq $count)) {
                $Report.Invoke(@{
                    Progress = $ProgressFloor + (($index / [double]$count) * $span)
                    Detail   = ('Extracting {0} of {1} files' -f $index, $count)
                })
            }
        }
    } finally {
        $archive.Dispose()
    }
}

# --- child processes ---------------------------------------------------------

function ConvertTo-QuotedArgument {
    # Start-Process joins ArgumentList with spaces and quotes nothing, so a path
    # like C:\Program Files\... arrives at the child as two arguments. Quote
    # anything with whitespace ourselves, escaping embedded quotes the way the
    # Windows command-line parser expects.
    param([string]$Value)
    if ([string]::IsNullOrEmpty($Value)) { return '""' }
    if ($Value -notmatch '[\s"]') { return $Value }
    $escaped = $Value -replace '(\\*)"', '$1$1\"'
    $escaped = $escaped -replace '(\\+)$', '$1$1'
    return '"' + $escaped + '"'
}

function Invoke-TrackedProcess {
    <#
      Runs a console tool, streaming its output to the log and (optionally) to
      a line callback so a step can turn tool chatter into progress. Returns
      @{ ExitCode; Output }. Never throws on a non-zero exit, callers decide.
    #>
    param(
        [Parameter(Mandatory = $true)]$Context,
        [Parameter(Mandatory = $true)][string]$FilePath,
        [string[]]$Arguments = @(),
        [string]$WorkingDirectory,
        [scriptblock]$OnLine,
        [int]$TimeoutSeconds = 1800,
        [scriptblock]$OnPoll
    )
    if ([string]::IsNullOrWhiteSpace($WorkingDirectory)) { $WorkingDirectory = $Context.RepoRoot }
    $stdout = [System.IO.Path]::GetTempFileName()
    $stderr = [System.IO.Path]::GetTempFileName()
    $collected = New-Object System.Text.StringBuilder

    Write-BootstrapLog -Context $Context -Message ("exec: {0} {1}" -f $FilePath, ($Arguments -join ' '))

    $startArgs = @{
        FilePath               = $FilePath
        WorkingDirectory       = $WorkingDirectory
        RedirectStandardOutput = $stdout
        RedirectStandardError  = $stderr
        NoNewWindow            = $true
        PassThru               = $true
    }
    if ($Arguments.Count -gt 0) {
        $startArgs['ArgumentList'] = @($Arguments | ForEach-Object { ConvertTo-QuotedArgument -Value $_ })
    }

    $proc = Start-Process @startArgs
    # Touching Handle forces the Process object to cache the OS handle. Without
    # it, .ExitCode reads back empty once the child has gone.
    try { $null = $proc.Handle } catch { }
    $offsets = @{ out = [long]0; err = [long]0 }
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    $drain = {
        param($path, $key)
        try {
            $fs = [System.IO.File]::Open($path, 'Open', 'Read', 'ReadWrite')
            try {
                if ($fs.Length -gt $offsets[$key]) {
                    $fs.Seek($offsets[$key], 'Begin') | Out-Null
                    $reader = New-Object System.IO.StreamReader($fs)
                    $chunk = $reader.ReadToEnd()
                    $offsets[$key] = $fs.Length
                    foreach ($line in ($chunk -split "`r?`n")) {
                        if ([string]::IsNullOrWhiteSpace($line)) { continue }
                        [void]$collected.AppendLine($line)
                        Write-BootstrapLog -Context $Context -Message ("  | " + $line)
                        if ($null -ne $OnLine) { $OnLine.Invoke($line) }
                    }
                }
            } finally { $fs.Dispose() }
        } catch { }
    }

    while (-not $proc.HasExited) {
        Start-Sleep -Milliseconds 200
        & $drain $stdout 'out'
        & $drain $stderr 'err'
        if ($null -ne $OnPoll) { $OnPoll.Invoke() }
        if ((Get-Date) -gt $deadline) {
            try { $proc.Kill() } catch { }
            Write-BootstrapLog -Context $Context -Level error -Message "Timed out after $TimeoutSeconds s: $FilePath"
            break
        }
    }
    $proc.WaitForExit()
    & $drain $stdout 'out'
    & $drain $stderr 'err'
    Remove-Item -LiteralPath $stdout, $stderr -Force -ErrorAction SilentlyContinue

    $exitCode = -1
    try { if ($null -ne $proc.ExitCode) { $exitCode = [int]$proc.ExitCode } } catch { }
    return @{ ExitCode = $exitCode; Output = $collected.ToString() }
}

function Test-CommandPath {
    param([string]$Name)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($null -eq $cmd) { return $null }
    if ($null -ne $cmd.Source -and $cmd.Source -ne '') { return $cmd.Source }
    return $cmd.Name
}

function Get-FreeDiskGb {
    param([string]$Path)
    try {
        $root = [System.IO.Path]::GetPathRoot((Resolve-Path -LiteralPath $Path).ProviderPath)
        $drive = Get-PSDrive -Name $root.TrimEnd(':', '\') -ErrorAction Stop
        return [math]::Round($drive.Free / 1GB, 1)
    } catch {
        return $null
    }
}

function Format-Duration {
    param([double]$Seconds)
    if ($null -eq $Seconds -or $Seconds -lt 0) { return '--' }
    $s = [int][math]::Round($Seconds)
    if ($s -lt 60) { return ('{0}s' -f $s) }
    $m = [int][math]::Floor($s / 60)
    $rem = $s % 60
    if ($m -lt 60) { return ('{0}m {1:00}s' -f $m, $rem) }
    $h = [int][math]::Floor($m / 60)
    return ('{0}h {1:00}m' -f $h, ($m % 60))
}
