<#
  Install-SwayCommand.ps1, one double-click to set up and start SwayCommand.

  Resolves the dependency graph in scripts/bootstrap/Steps.ps1, installs only
  what is actually missing, and launches the app. The graph runs on a worker
  runspace; the window renders from a synchronized state bag on a dispatcher
  timer. Nothing here assumes Node, pwsh 7, admin rights, or a warm cache.

  Normally started by "SwayCommand.bat".

    -Console      run headless (also the automatic fallback if WPF is unavailable)
    -NoLaunch     set everything up but stop short of starting the app
    -InstallRoot  where the private runtime and downloads live
#>
[CmdletBinding()]
param(
    [string]$RepoRoot,
    [string]$InstallRoot,
    [switch]$Console,
    [switch]$NoLaunch
)

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot

. (Join-Path $here 'Common.ps1')
. (Join-Path $here 'Graph.ps1')
. (Join-Path $here 'Steps.ps1')

Clear-HostileEnvironment

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $here '..\..')).ProviderPath
}
if ([string]::IsNullOrWhiteSpace($InstallRoot)) {
    $InstallRoot = Join-Path $env:LOCALAPPDATA 'SwayCommand'
}

# ---------------------------------------------------------------- console mode

function Invoke-ConsoleBootstrap {
    param([string]$RepoRoot, [string]$InstallRoot, [bool]$NoLaunch)

    $ctx = New-BootstrapContext -RepoRoot $RepoRoot -InstallRoot $InstallRoot
    Write-Host ''
    Write-Host '  SwayCommand, Install & Launch' -ForegroundColor White
    Write-Host "  $RepoRoot" -ForegroundColor DarkGray
    Write-Host ''

    $steps = New-SwayBootstrapGraph -Context $ctx
    Import-StepEstimates -Context $ctx -Steps $steps
    Invoke-DetectionPass -Context $ctx -Steps $steps | Out-Null

    foreach ($step in $steps) {
        if ($step.Optional -and -not $step.Selected) { continue }
        if ($step.State -eq 'satisfied') {
            Write-Host ("  ready    {0}  {1}" -f $step.Name.PadRight(28), $step.Detail) -ForegroundColor DarkGray
            continue
        }

        for ($attempt = 1; $attempt -le 2; $attempt++) {
            # Prerequisites may have appeared since detection.
            try {
                $recheck = & $step.Test $ctx
                if ($null -ne $recheck -and $recheck.Satisfied) {
                    $step.State = 'satisfied'
                    if ($recheck.ContainsKey('Detail')) { $step.Detail = [string]$recheck.Detail }
                    Write-Host ("  ready    {0}  {1}" -f $step.Name.PadRight(28), $step.Detail) -ForegroundColor DarkGray
                    break
                }
                if ($null -ne $recheck -and $recheck.ContainsKey('Variant')) {
                    $step.Variant = [string]$recheck.Variant
                    Set-StepEstimate -Context $ctx -Step $step
                }
            } catch { }

            Write-Host ("  working  {0}" -f $step.Name) -ForegroundColor White
            $step.Detail = ''
            if (Invoke-StepInstall -Context $ctx -Step $step) {
                Write-Host ("  done     {0}  {1}" -f $step.Name.PadRight(28), $step.Detail) -ForegroundColor Green
                break
            }
            Write-Host ("  failed   {0}" -f $step.Name) -ForegroundColor Red
            Write-Host ("           {0}" -f $step.Error) -ForegroundColor Red
            if ($attempt -eq 1) { Write-Host '           retrying once...' -ForegroundColor DarkGray }
        }

        if ($step.State -eq 'failed' -and -not $step.Optional) {
            Write-Host ''
            Write-Host "  Setup could not finish. Full log: $($ctx.LogFile)" -ForegroundColor Yellow
            return 1
        }
    }

    if ($NoLaunch) {
        Write-Host ''
        Write-Host '  Everything is ready.' -ForegroundColor Green
        return 0
    }
    Write-Host ''
    Write-Host '  Starting SwayCommand...' -ForegroundColor White
    Start-SwayCommand -Context $ctx | Out-Null
    return 0
}

function Show-SetupPopup {
    # The window normally runs hidden, so a failure before it appears would
    # otherwise be silent. WScript.Shell is present on every Windows install and
    # needs nothing loaded, which is exactly what a last-resort path wants.
    param([string]$Message)
    try {
        (New-Object -ComObject WScript.Shell).Popup($Message, 0, 'SwayCommand Setup', 16) | Out-Null
    } catch {
        Write-Host $Message
    }
}

if ($Console) {
    exit (Invoke-ConsoleBootstrap -RepoRoot $RepoRoot -InstallRoot $InstallRoot -NoLaunch $NoLaunch)
}

try {
    . (Join-Path $here 'Ui.ps1')
} catch {
    Write-Warning "The setup window could not be created ($($_.Exception.Message)). Continuing without it."
    exit (Invoke-ConsoleBootstrap -RepoRoot $RepoRoot -InstallRoot $InstallRoot -NoLaunch $NoLaunch)
}

# ------------------------------------------------------------------ shared bag

$Sync = [hashtable]::Synchronized(@{})
$Sync.RepoRoot      = $RepoRoot
$Sync.InstallRoot   = $InstallRoot
$Sync.BootstrapDir  = $here
$Sync.NoLaunch      = [bool]$NoLaunch
$Sync.Phase         = 'detect'      # detect | plan | install | failed | launch | done | fatal
$Sync.Steps         = @()
$Sync.StepsVersion  = 0
$Sync.DetectProgress = 0.0
$Sync.PlanDecision  = $null         # install | cancel | relocate
$Sync.FailureAction = $null         # retry | skip | quit
$Sync.FailedStepId  = $null
$Sync.InstallStartedAt = $null
$Sync.LogFile       = $null
$Sync.FatalError    = $null
$Sync.RequestClose  = $false
$Sync.Cancelled     = $false

# ---------------------------------------------------------------------- worker
# The graph is built *inside* the worker runspace: a scriptblock is bound to the
# session state that created it, so Test/Install must be created and invoked on
# the same thread. The UI only ever reads the resulting synchronized hashtables.

$workerScript = {
    try {
        . (Join-Path $Sync.BootstrapDir 'Common.ps1')
        . (Join-Path $Sync.BootstrapDir 'Graph.ps1')
        . (Join-Path $Sync.BootstrapDir 'Steps.ps1')
        Clear-HostileEnvironment

        $ctx = $null
        while ($true) {
            $ctx = New-BootstrapContext -RepoRoot $Sync.RepoRoot -InstallRoot $Sync.InstallRoot
            $Sync.LogFile = $ctx.LogFile
            Write-BootstrapLog -Context $ctx -Message "bootstrap start, repo=$($ctx.RepoRoot) installRoot=$($ctx.InstallRoot)"

            $steps = New-SwayBootstrapGraph -Context $ctx
            Import-StepEstimates -Context $ctx -Steps $steps
            $Sync.Steps = $steps
            $Sync.StepsVersion = $Sync.StepsVersion + 1

            $Sync.Phase = 'detect'
            $Sync.DetectProgress = 0.0
            Invoke-DetectionPass -Context $ctx -Steps $steps -Report {
                param($u)
                $Sync.DetectProgress = [double]$u.Progress
            } | Out-Null

            if (Get-PlannedSteps -Steps $steps | Select-Object -First 1) {
                $Sync.Phase = 'plan'
                while ($null -eq $Sync.PlanDecision) {
                    if ($Sync.Cancelled) { return }
                    Start-Sleep -Milliseconds 80
                }
                $decision = $Sync.PlanDecision
                $Sync.PlanDecision = $null
                if ($decision -eq 'cancel') { $Sync.RequestClose = $true; return }
                if ($decision -eq 'relocate') { continue }   # rebuild against the new folder
            }
            break
        }

        # --- install ------------------------------------------------------------
        $Sync.InstallStartedAt = Get-Date
        $Sync.Phase = 'install'

        foreach ($step in $Sync.Steps) {
            if ($Sync.Cancelled) { return }
            if ($step.Optional -and -not $step.Selected) { continue }
            if ($step.State -eq 'satisfied' -or $step.State -eq 'done') { continue }

            while ($true) {
                if ($Sync.Cancelled) { return }

                # Re-probe: this step may have been unprobeable during detection
                # because its prerequisite did not exist yet.
                try {
                    $recheck = & $step.Test $ctx
                    if ($null -ne $recheck -and $recheck.Satisfied) {
                        $step.State = 'satisfied'
                        if ($recheck.ContainsKey('Detail')) { $step.Detail = [string]$recheck.Detail }
                        break
                    }
                    # First honest look at this step: during detection its
                    # prerequisite did not exist, so its variant was unknowable.
                    if ($null -ne $recheck -and $recheck.ContainsKey('Variant')) {
                        $step.Variant = [string]$recheck.Variant
                        Set-StepEstimate -Context $ctx -Step $step
                    }
                } catch { }

                if (Invoke-StepInstall -Context $ctx -Step $step) { break }

                $Sync.FailedStepId = $step.Id
                $Sync.Phase = 'failed'
                $Sync.FailureAction = $null
                while ($null -eq $Sync.FailureAction) {
                    if ($Sync.Cancelled) { return }
                    Start-Sleep -Milliseconds 80
                }
                $action = $Sync.FailureAction
                $Sync.FailureAction = $null
                $Sync.FailedStepId = $null
                $Sync.Phase = 'install'

                if ($action -eq 'quit') { $Sync.RequestClose = $true; return }
                if ($action -eq 'skip') {
                    $step.State = 'skipped'
                    $step.Detail = 'Skipped, you can install this later'
                    break
                }
                # retry: fall through and go round again
                $step.State = 'pending'
            }
        }

        # --- launch -------------------------------------------------------------
        if ($Sync.NoLaunch) {
            $Sync.Phase = 'done'
            Start-Sleep -Seconds 2
            $Sync.RequestClose = $true
            return
        }

        $Sync.Phase = 'launch'
        try {
            Start-SwayCommand -Context $ctx | Out-Null
            $Sync.Phase = 'done'
            Start-Sleep -Milliseconds 2200
            $Sync.RequestClose = $true
        } catch {
            $Sync.FatalError = "SwayCommand could not be started: $($_.Exception.Message)"
            $Sync.Phase = 'fatal'
        }
    } catch {
        $Sync.FatalError = $_.Exception.Message
        $Sync.Phase = 'fatal'
        try { Write-BootstrapLog -Context $ctx -Level error -Message $_.ScriptStackTrace } catch { }
    }
}

$runspace = [runspacefactory]::CreateRunspace()
$runspace.ApartmentState = 'MTA'
$runspace.ThreadOptions = 'ReuseThread'
$runspace.Open()
$runspace.SessionStateProxy.SetVariable('Sync', $Sync)
$worker = [powershell]::Create()
$worker.Runspace = $runspace
[void]$worker.AddScript($workerScript)
[void]$worker.BeginInvoke()

# -------------------------------------------------------------------------- UI

try {
    $ui = New-BootstrapWindow
} catch {
    Show-SetupPopup "The setup window could not be created:`n`n$($_.Exception.Message)`n`nFalling back to a console run."
    $Sync.Cancelled = $true
    try { $worker.Stop(); $worker.Dispose(); $runspace.Close() } catch { }
    exit (Invoke-ConsoleBootstrap -RepoRoot $RepoRoot -InstallRoot $InstallRoot -NoLaunch $NoLaunch)
}

$rows = @{}
$renderedVersion = -1

$ui.CloseButton.Add_Click({ $Sync.Cancelled = $true; $ui.Window.Close() })
$ui.Window.Add_Closing({ $Sync.Cancelled = $true })

$ui.ActionButton.Add_Click({
    if ($Sync.Phase -eq 'plan') {
        foreach ($step in $Sync.Steps) {
            if ($step.Optional -and $rows.ContainsKey($step.Id) -and $null -ne $rows[$step.Id].Check) {
                $step.Selected = [bool]$rows[$step.Id].Check.IsChecked
            }
        }
        $Sync.PlanDecision = 'install'
    }
})
$ui.SecondaryButton.Add_Click({
    if ($Sync.Phase -eq 'plan') { $Sync.PlanDecision = 'cancel' }
    $Sync.Cancelled = $true
    $ui.Window.Close()
})
$ui.ChangeLocationButton.Add_Click({
    $picked = Select-InstallFolder -Current $Sync.InstallRoot
    if ($null -ne $picked) {
        $Sync.InstallRoot = Join-Path $picked 'SwayCommand'
        $Sync.PlanDecision = 'relocate'
    }
})
$ui.RetryButton.Add_Click({ $Sync.FailureAction = 'retry' })
$ui.SkipButton.Add_Click({ $Sync.FailureAction = 'skip' })
$ui.LogButton.Add_Click({
    if (-not [string]::IsNullOrWhiteSpace($Sync.LogFile) -and (Test-Path -LiteralPath $Sync.LogFile)) {
        Start-Process notepad.exe -ArgumentList $Sync.LogFile
    }
})

function Set-Fill {
    param($Ui, [double]$Fraction)
    if ($Fraction -lt 0) { $Fraction = 0 }
    if ($Fraction -gt 1) { $Fraction = 1 }
    $w = $Ui.TrackBorder.ActualWidth
    if ($w -gt 0) { $Ui.FillBorder.Width = $w * $Fraction }
}

$timer = New-Object System.Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromMilliseconds(100)
$timer.Add_Tick({
    if ($Sync.RequestClose) { $timer.Stop(); $ui.Window.Close(); return }

    # (Re)build rows whenever the worker publishes a new graph.
    if ($Sync.StepsVersion -ne $renderedVersion -and @($Sync.Steps).Count -gt 0) {
        $script:renderedVersion = $Sync.StepsVersion
        $ui.StepList.Children.Clear()
        $rows.Clear()
        foreach ($step in $Sync.Steps) {
            $row = New-StepRow -Step $step
            $rows[$step.Id] = $row
            $ui.StepList.Children.Add($row.Root) | Out-Null
        }
    }

    foreach ($step in $Sync.Steps) {
        if (-not $rows.ContainsKey($step.Id)) { continue }
        $row = $rows[$step.Id]
        $p = Get-StepPresentation -Step $step
        $row.Glyph.Text = [string]$p.Glyph
        $row.Status.Text = [string]$p.Status
        $detail = [string]$step.Detail
        if ([string]::IsNullOrWhiteSpace($detail)) { $detail = [string]$step.Description }
        $row.Detail.Text = $detail
        $dim = '#EDEDEF'
        if ($p.Dim) { $dim = '#8A8A92' }
        $row.Name.Foreground = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.ColorConverter]::ConvertFromString($dim))
        if ($null -ne $row.Check) { $row.Check.IsEnabled = ($Sync.Phase -eq 'plan') }
    }

    switch ($Sync.Phase) {
        'detect' {
            $ui.Headline.Text = 'Checking your system'
            $ui.Subhead.Text = 'Working out what is already installed.'
            Set-Fill -Ui $ui -Fraction $Sync.DetectProgress
            $ui.ElapsedText.Text = ''
            $ui.RemainingText.Text = ''
        }
        'plan' {
            $planned = @(Get-PlannedSteps -Steps $Sync.Steps)
            $seconds = Get-RemainingSeconds -Steps $Sync.Steps
            $bytes = 0
            foreach ($s in $planned) {
                # A step that will restore from cache downloads nothing; saying
                # otherwise would be the one number here the user could catch out.
                if ($s.Variant -eq 'cached') { continue }
                $bytes += [double]$s.DownloadBytes
            }
            $ui.Headline.Text = 'Ready to set up SwayCommand'
            $summary = '{0} {1} to install · about {2}' -f $planned.Count,
                $(if ($planned.Count -eq 1) { 'item' } else { 'items' }), (Format-Duration $seconds)
            if ($bytes -gt 0) { $summary = '{0} · {1} to download' -f $summary, (Format-Bytes $bytes) }
            $ui.Subhead.Text = $summary
            $ui.ActionButton.Visibility = 'Visible'
            $ui.SecondaryButton.Visibility = 'Visible'
            $ui.ActionButton.Content = 'Install and launch'
            $ui.LocationPanel.Visibility = 'Visible'
            $ui.LocationText.Text = "Runtime folder: $($Sync.InstallRoot)"
            $ui.ElapsedText.Text = ''
            $ui.RemainingText.Text = ''
            Set-Fill -Ui $ui -Fraction 0
        }
        'install' {
            $ui.ActionButton.Visibility = 'Collapsed'
            $ui.SecondaryButton.Visibility = 'Collapsed'
            $ui.LocationPanel.Visibility = 'Collapsed'
            $ui.FailureCard.Visibility = 'Collapsed'
            $ui.ListScroller.Visibility = 'Visible'
            $current = @($Sync.Steps | Where-Object { $_.State -eq 'running' }) | Select-Object -First 1
            $ui.Headline.Text = 'Setting up SwayCommand'
            if ($null -ne $current) { $ui.Subhead.Text = $current.Name } else { $ui.Subhead.Text = 'Preparing' }
            Set-Fill -Ui $ui -Fraction (Get-OverallProgress -Steps $Sync.Steps)
            if ($null -ne $Sync.InstallStartedAt) {
                $elapsed = ((Get-Date) - $Sync.InstallStartedAt).TotalSeconds
                $ui.ElapsedText.Text = 'Elapsed ' + (Format-Duration $elapsed)
                $ui.RemainingText.Text = 'About ' + (Format-Duration (Get-RemainingSeconds -Steps $Sync.Steps)) + ' left'
            }
        }
        'failed' {
            $step = @($Sync.Steps | Where-Object { $_.Id -eq $Sync.FailedStepId }) | Select-Object -First 1
            $ui.ListScroller.Visibility = 'Collapsed'
            $ui.FailureCard.Visibility = 'Visible'
            $ui.Headline.Text = 'That step did not finish'
            $ui.Subhead.Text = 'Nothing is broken, you can try again or carry on without it.'
            if ($null -ne $step) {
                $ui.FailureTitle.Text = $step.Name
                $ui.FailureBody.Text = [string]$step.Error
                $ui.SkipButton.Visibility = $(if ($step.Optional) { 'Visible' } else { 'Collapsed' })
            }
            $ui.ElapsedText.Text = ''
            $ui.RemainingText.Text = ''
        }
        'launch' {
            $ui.FailureCard.Visibility = 'Collapsed'
            $ui.ListScroller.Visibility = 'Visible'
            $ui.Headline.Text = 'Starting SwayCommand'
            $ui.Subhead.Text = 'The window will open in a moment.'
            Set-Fill -Ui $ui -Fraction 1
            $ui.RemainingText.Text = ''
        }
        'done' {
            $ui.Headline.Text = 'SwayCommand is running'
            $ui.Subhead.Text = 'You can close this window.'
            Set-Fill -Ui $ui -Fraction 1
        }
        'fatal' {
            $ui.ListScroller.Visibility = 'Collapsed'
            $ui.FailureCard.Visibility = 'Visible'
            $ui.Headline.Text = 'Setup stopped'
            $ui.Subhead.Text = 'The details below should say why.'
            $ui.FailureTitle.Text = 'Something unexpected happened'
            $ui.FailureBody.Text = [string]$Sync.FatalError
            $ui.RetryButton.Visibility = 'Collapsed'
            $ui.SkipButton.Visibility = 'Collapsed'
        }
    }
})
$timer.Start()

try {
    [void]$ui.Window.ShowDialog()
} catch {
    Show-SetupPopup "The setup window stopped unexpectedly:`n`n$($_.Exception.Message)`n`nLog: $($Sync.LogFile)"
}

# ---------------------------------------------------------------------- teardown
$Sync.Cancelled = $true
$timer.Stop()
try { $worker.Stop() } catch { }
try { $worker.Dispose() } catch { }
try { $runspace.Close() } catch { }

if ($Sync.Phase -eq 'fatal') {
    Show-SetupPopup "Setup stopped.`n`n$($Sync.FatalError)`n`nLog: $($Sync.LogFile)"
    exit 1
}
exit 0
