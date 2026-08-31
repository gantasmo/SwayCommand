# Graph.ps1 — the dependency graph, its resolver, and the run loop.
#
# Every prerequisite is a node with a Test (is it already satisfied?) and an
# Install (make it so). Nodes declare what they Require; the resolver
# topologically sorts them, the detection pass prunes the ones already
# satisfied, and only what is genuinely missing ends up in the plan. That is
# what keeps a second launch from redoing a first launch's work.

function New-BootstrapStep {
    param(
        [Parameter(Mandatory = $true)][string]$Id,
        [Parameter(Mandatory = $true)][string]$Name,
        [string]$Description = '',
        [string[]]$Requires = @(),
        [switch]$Optional,
        [bool]$DefaultSelected = $true,
        [Parameter(Mandatory = $true)][scriptblock]$Test,
        [scriptblock]$Install,
        [double]$EstimateSeconds = 10,
        [double]$DownloadBytes = 0,
        # First-run estimates per variant (see $step.Variant below). A step whose
        # cost depends on what it finds — a warm download cache versus a cold one —
        # cannot be described by a single number.
        [hashtable]$VariantEstimates = @{}
    )
    $step = [hashtable]::Synchronized(@{})
    $step.Id              = $Id
    $step.Name            = $Name
    $step.Description     = $Description
    $step.Requires        = $Requires
    $step.Optional        = [bool]$Optional
    $step.Selected        = $DefaultSelected
    $step.Test            = $Test
    $step.Install         = $Install
    $step.EstimateSeconds = $EstimateSeconds
    $step.DownloadBytes   = $DownloadBytes
    $step.VariantEstimates = $VariantEstimates
    # Which shape of work this step turned out to face, decided by its Test.
    # Timings are recorded per variant so a cached run never contaminates the
    # estimate for a downloading one, or the reverse.
    $step.Variant         = ''
    # runtime
    $step.State           = 'pending'   # pending | satisfied | running | done | skipped | failed
    $step.Progress        = 0.0
    $step.Detail          = ''
    $step.Error           = $null
    $step.Remediation     = $null
    $step.RemediationUrl  = $null
    $step.DurationSeconds = 0.0
    $step.SecondsRemaining = $null
    return $step
}

function Resolve-StepOrder {
    <#
      Depth-first topological sort. A cycle or a dangling Requires is a bug in
      the graph definition, not a user-facing condition, so both throw loudly.
    #>
    param([Parameter(Mandatory = $true)]$Steps)
    $byId = @{}
    foreach ($s in $Steps) { $byId[$s.Id] = $s }

    $ordered = New-Object System.Collections.ArrayList
    $mark = @{}   # id -> 'temp' | 'done'

    $visit = {
        param($id, $trail)
        if ($mark[$id] -eq 'done') { return }
        if ($mark[$id] -eq 'temp') {
            throw "Dependency cycle in the bootstrap graph: $($trail -join ' -> ') -> $id"
        }
        if (-not $byId.ContainsKey($id)) {
            throw "Bootstrap step '$($trail[-1])' requires unknown step '$id'"
        }
        $mark[$id] = 'temp'
        foreach ($dep in $byId[$id].Requires) {
            & $visit $dep ($trail + @($id))
        }
        $mark[$id] = 'done'
        [void]$ordered.Add($byId[$id])
    }

    foreach ($s in $Steps) { & $visit $s.Id @() }
    return $ordered.ToArray()
}

function Invoke-DetectionPass {
    <#
      Runs every Test in dependency order. A step whose prerequisite is missing
      cannot be probed meaningfully (you cannot ask npm for its version before
      Node exists), so it is left 'pending' and assumed to need work.
      A Test that throws is treated as "not satisfied" — never as a crash.
    #>
    param(
        [Parameter(Mandatory = $true)]$Context,
        [Parameter(Mandatory = $true)]$Steps,
        [scriptblock]$Report
    )
    $satisfied = @{}
    $index = 0
    foreach ($step in $Steps) {
        $index++
        if ($null -ne $Report) {
            $Report.Invoke(@{ Progress = $index / [double]$Steps.Count; Detail = $step.Name })
        }

        $blocked = $false
        foreach ($dep in $step.Requires) {
            if (-not $satisfied.ContainsKey($dep) -or -not $satisfied[$dep]) { $blocked = $true }
        }
        if ($blocked) {
            $step.State = 'pending'
            $step.Detail = 'Waiting on a prerequisite'
            $satisfied[$step.Id] = $false
            continue
        }

        try {
            $result = & $step.Test $Context
            if ($null -eq $result) { $result = @{ Satisfied = $false } }
            if ($result.Satisfied) {
                $step.State = 'satisfied'
                $step.Progress = 1.0
                $satisfied[$step.Id] = $true
            } else {
                $step.State = 'pending'
                $satisfied[$step.Id] = $false
            }
            if ($result.ContainsKey('Detail')) { $step.Detail = [string]$result.Detail }
            if ($result.ContainsKey('Variant')) { $step.Variant = [string]$result.Variant }
            Set-StepEstimate -Context $Context -Step $step
        } catch {
            Write-BootstrapLog -Context $Context -Level warn -Message "Test for '$($step.Id)' failed: $($_.Exception.Message)"
            $step.State = 'pending'
            $step.Detail = 'Could not verify — will install'
            $satisfied[$step.Id] = $false
        }
    }
    return $Steps
}

function Get-PlannedSteps {
    # Everything still needing work, minus optional items the user unchecked.
    param($Steps)
    return @($Steps | Where-Object {
        $_.State -eq 'pending' -and (-not $_.Optional -or $_.Selected)
    })
}

function Get-RemainingSeconds {
    <#
      The estimate shown to the user. Two things make it honest rather than
      decorative:

        1. Per-step estimates are the measured duration of that step on THIS
           machine when we have one (state file), and a calibrated default only
           on first run.
        2. Everything still outstanding is scaled by how wrong we have been so
           far this run, so a slow disk or a slow link corrects the whole tail
           rather than only the step you are watching.

      A step that can report genuine remaining time (a download knows its byte
      count and its current rate) overrides the model for its own share.
    #>
    param($Steps)
    $planned = @($Steps | Where-Object { $_.State -in @('pending', 'running', 'done', 'failed') -and (-not $_.Optional -or $_.Selected) })
    if ($planned.Count -eq 0) { return 0 }

    $estDone = 0.0
    $actualDone = 0.0
    foreach ($s in @($planned | Where-Object { $_.State -eq 'done' })) {
        $estDone += [double]$s.EstimateSeconds
        $actualDone += [double]$s.DurationSeconds
    }

    $correction = 1.0
    if ($estDone -gt 3 -and $actualDone -gt 0) {
        $correction = $actualDone / $estDone
        if ($correction -lt 0.5) { $correction = 0.5 }
        if ($correction -gt 3.0) { $correction = 3.0 }
    }

    $remaining = 0.0
    foreach ($s in $planned) {
        if ($s.State -eq 'done' -or $s.State -eq 'failed') { continue }
        if ($s.State -eq 'running') {
            if ($null -ne $s.SecondsRemaining) {
                # Measured, not modelled — trust it as-is.
                $remaining += [double]$s.SecondsRemaining
            } else {
                $left = [double]$s.EstimateSeconds * (1.0 - [double]$s.Progress)
                # Never let a long-running step's estimate collapse to zero
                # while it is still visibly working.
                if ($left -lt 1) { $left = 1 }
                $remaining += $left * $correction
            }
        } else {
            $remaining += [double]$s.EstimateSeconds * $correction
        }
    }
    return $remaining
}

function Get-OverallProgress {
    param($Steps)
    $planned = @($Steps | Where-Object { $_.State -in @('pending', 'running', 'done', 'failed', 'skipped') -and (-not $_.Optional -or $_.Selected) })
    $total = 0.0
    $complete = 0.0
    foreach ($s in $planned) {
        $w = [double]$s.EstimateSeconds
        if ($w -le 0) { $w = 1 }
        $total += $w
        if ($s.State -eq 'done' -or $s.State -eq 'skipped') { $complete += $w }
        elseif ($s.State -eq 'running') { $complete += $w * [double]$s.Progress }
    }
    if ($total -le 0) { return 1.0 }
    return [math]::Min(1.0, $complete / $total)
}

function Invoke-StepInstall {
    <#
      Runs one step's Install with a reporter bound to it, times it, and folds
      the measurement back into the state file. Returns $true on success.
      Failure is data, not an exception: the caller decides whether to retry,
      skip, or stop.
    #>
    param(
        [Parameter(Mandatory = $true)]$Context,
        [Parameter(Mandatory = $true)]$Step
    )
    $Step.State = 'running'
    $Step.Progress = 0.0
    $Step.Error = $null
    $Step.SecondsRemaining = $null
    $started = Get-Date

    # Bound to this step so an Install block can just call $report.Invoke(...).
    $report = {
        param($update)
        if ($null -eq $update) { return }
        if ($update.ContainsKey('Progress')) {
            $p = [double]$update.Progress
            if ($p -lt 0) { $p = 0 }
            if ($p -gt 1) { $p = 1 }
            $Step.Progress = $p
        }
        if ($update.ContainsKey('Detail')) { $Step.Detail = [string]$update.Detail }
        if ($update.ContainsKey('SecondsRemaining')) { $Step.SecondsRemaining = $update.SecondsRemaining }
    }.GetNewClosure()

    try {
        if ($null -eq $Step.Install) {
            throw "Step '$($Step.Id)' has nothing to install but was not satisfied."
        }
        & $Step.Install $Context $report
        $Step.State = 'done'
        $Step.Progress = 1.0
        $Step.SecondsRemaining = $null
        $Step.DurationSeconds = ((Get-Date) - $started).TotalSeconds
        Update-StepTiming -Context $Context -Id (Get-StepTimingKey -Step $Step) -Seconds $Step.DurationSeconds
        Save-BootstrapState -Context $Context
        Write-BootstrapLog -Context $Context -Message ("step '{0}' done in {1:0.0}s" -f $Step.Id, $Step.DurationSeconds)
        return $true
    } catch {
        $Step.State = 'failed'
        $Step.SecondsRemaining = $null
        $Step.Error = $_.Exception.Message
        $Step.DurationSeconds = ((Get-Date) - $started).TotalSeconds
        Write-BootstrapLog -Context $Context -Level error -Message ("step '{0}' failed: {1}" -f $Step.Id, $_.Exception.Message)
        Write-BootstrapLog -Context $Context -Level error -Message ($_.ScriptStackTrace)
        return $false
    }
}

function Get-StepTimingKey {
    param($Step)
    if ([string]::IsNullOrWhiteSpace($Step.Variant)) { return $Step.Id }
    return '{0}#{1}' -f $Step.Id, $Step.Variant
}

function Set-StepEstimate {
    <#
      Settles on the best available number for this step, in increasing order of
      authority: the declared default, the declared default for the variant the
      Test found, then this machine's measured history for that exact variant.
    #>
    param($Context, $Step)
    if ($null -ne $Step.VariantEstimates -and -not [string]::IsNullOrWhiteSpace($Step.Variant)) {
        if ($Step.VariantEstimates.ContainsKey($Step.Variant)) {
            $Step.EstimateSeconds = [double]$Step.VariantEstimates[$Step.Variant]
        }
    }
    $measured = Get-StepTiming -Context $Context -Id (Get-StepTimingKey -Step $Step)
    if ($null -ne $measured -and $measured -gt 0.5) { $Step.EstimateSeconds = $measured }
}

function Import-StepEstimates {
    # Baseline pass before detection has run; refined per step as each Test
    # reports which variant of the work it is facing.
    param($Context, $Steps)
    foreach ($step in $Steps) { Set-StepEstimate -Context $Context -Step $step }
}
