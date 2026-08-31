# install-launch.ps1 - SUPERSEDED. Nothing invokes this any more.
#
# "SwayCommand.bat" now calls scripts\bootstrap\Install-SwayCommand.ps1.
# This script is kept only for reference; it cannot successfully start the app,
# for the reasons written up in docs\INSTALLER-DIAGNOSIS.md. In short: it treats
# the presence of node_modules as proof that dependencies are installed, but
# electron >= 43 ships no postinstall hook, so npm leaves the runtime binary
# undownloaded and this script reports success and then launches nothing.
#
# ---- original header ----
# Checks for Node.js >= 18 (installs it via winget when possible), installs
# npm dependencies when needed, then launches the app with 'npm run start'.
#
# Compatible with Windows PowerShell 5.1. Does not require admin (the winget
# Node.js installer may show a User Account Control prompt of its own).

$ErrorActionPreference = 'Stop'
$MinNodeMajor = 18
$NodeDownloadUrl = 'https://nodejs.org/en/download'

function Write-Ok   { param([string]$Message) Write-Host "[OK]   $Message" -ForegroundColor Green }
function Write-Fix  { param([string]$Message) Write-Host "[FIX]  $Message" -ForegroundColor Yellow }
function Write-Fail { param([string]$Message) Write-Host "[FAIL] $Message" -ForegroundColor Red }

function Get-NodeMajorVersion {
    # Returns the installed Node.js major version as [int], or $null if
    # node is missing from PATH or its version cannot be read.
    $cmd = Get-Command node -ErrorAction SilentlyContinue
    if ($null -eq $cmd) { return $null }
    try {
        $raw = & node --version | Select-Object -First 1
    } catch {
        return $null
    }
    if ([string]::IsNullOrWhiteSpace([string]$raw)) { return $null }
    $majorText = ([string]$raw).Trim().TrimStart('v').Split('.')[0]
    $major = 0
    if ([int]::TryParse($majorText, [ref]$major)) { return $major }
    return $null
}

function Update-SessionPath {
    # Pull in PATH changes made by installers without opening a new terminal.
    $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath    = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = $machinePath + ';' + $userPath
}

function Open-NodeDownloadPage {
    try { Start-Process $NodeDownloadUrl } catch { }
}

# --- Locate repo root (parent of this script's folder; safe with spaces) ---
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot

Write-Host ''
Write-Host 'SwayCommand - Install & Launch' -ForegroundColor Cyan
Write-Host "Folder: $repoRoot"
Write-Host ''

# --- Step (a): Node.js >= 18 on PATH ---
$major = Get-NodeMajorVersion
if ($null -ne $major -and $major -ge $MinNodeMajor) {
    Write-Ok "Node.js v$major found (need >= $MinNodeMajor)."
} else {
    if ($null -eq $major) {
        Write-Fix 'Node.js was not found on PATH.'
    } else {
        Write-Fix "Node.js v$major is too old (need >= $MinNodeMajor)."
    }

    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($null -ne $winget) {
        Write-Fix 'Installing Node.js LTS via winget (a User Account Control prompt may appear)...'
        & winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -ne 0) {
            Write-Fail "winget could not install Node.js (exit code $LASTEXITCODE)."
            Write-Host "Install Node.js LTS manually from $NodeDownloadUrl, then run this again."
            Open-NodeDownloadPage
            exit 1
        }
        Update-SessionPath
        $major = Get-NodeMajorVersion
        if ($null -ne $major -and $major -ge $MinNodeMajor) {
            Write-Ok "Node.js v$major installed and detected."
        } else {
            Write-Fail 'Node.js was installed but is not detected in this window yet.'
            Write-Host "Close this window, then double-click 'SwayCommand.bat' again."
            exit 1
        }
    } else {
        Write-Fail 'winget is not available, so Node.js cannot be installed automatically.'
        Write-Host ''
        Write-Host "  1. Download the Node.js LTS installer:  $NodeDownloadUrl"
        Write-Host '  2. Run the installer (the default options are fine).'
        Write-Host "  3. Double-click 'SwayCommand.bat' again."
        Write-Host ''
        Open-NodeDownloadPage
        exit 1
    }
}

# npm ships with Node.js, but verify it made it onto PATH.
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($null -eq $npm) {
    Write-Fail 'npm was not found on PATH even though Node.js is present.'
    Write-Host "Reinstall Node.js from $NodeDownloadUrl (npm is included with it)."
    exit 1
}

# --- Step (b): install dependencies when missing or stale ---
$packageJson = Join-Path $repoRoot 'package.json'
$nodeModules = Join-Path $repoRoot 'node_modules'

if (-not (Test-Path -LiteralPath $packageJson)) {
    Write-Fail "package.json was not found in $repoRoot - is this a complete copy of the repo?"
    exit 1
}

$needInstall = $false
if (-not (Test-Path -LiteralPath $nodeModules)) {
    $needInstall = $true
    Write-Fix 'node_modules is missing - installing dependencies (first run may take a few minutes)...'
} else {
    $pkgTime = (Get-Item -LiteralPath $packageJson).LastWriteTimeUtc
    $nmTime  = (Get-Item -LiteralPath $nodeModules).LastWriteTimeUtc
    if ($pkgTime -gt $nmTime) {
        $needInstall = $true
        Write-Fix 'package.json is newer than node_modules - refreshing dependencies...'
    } else {
        Write-Ok 'Dependencies are already installed.'
    }
}

if ($needInstall) {
    & npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "npm install failed (exit code $LASTEXITCODE). See the output above for details."
        exit 1
    }
    Write-Ok 'Dependencies installed.'
}

# --- Step (c): launch ---
Write-Ok 'Starting SwayCommand (npm run start)...'
& npm run start
if ($LASTEXITCODE -ne 0) {
    Write-Fail "SwayCommand exited with an error (exit code $LASTEXITCODE)."
    exit 1
}
exit 0
