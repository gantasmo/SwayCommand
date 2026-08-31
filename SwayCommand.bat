@echo off
rem SwayCommand - double-click installer and launcher (Windows).
rem
rem Hands off to scripts\bootstrap\Install-SwayCommand.ps1, which resolves the
rem dependency graph, installs only what is missing, and starts the app. This
rem file stays deliberately thin: everything that can fail lives in the
rem PowerShell side, where it has a window to report into.
rem
rem   set SWAYCOMMAND_SETUP_CONSOLE=1   run visibly in this console instead
rem
setlocal
cd /d "%~dp0"

rem Any Electron-hosted terminal (VS Code's above all) exports
rem ELECTRON_RUN_AS_NODE=1. Inherited, it makes require('electron') return a
rem path string instead of the API object and the app dies on startup. Clear the
rem whole family here so nothing downstream inherits them.
rem See docs\INSTALLER-DIAGNOSIS.md.
set "ELECTRON_RUN_AS_NODE="
set "ELECTRON_NO_ATTACH_CONSOLE="
set "ELECTRON_OVERRIDE_DIST_PATH="
set "ELECTRON_NO_ASAR="
set "NODE_OPTIONS="

set "PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%PS%" set "PS=powershell.exe"

set "BOOTSTRAP=%~dp0scripts\bootstrap\Install-SwayCommand.ps1"
if not exist "%BOOTSTRAP%" (
    echo.
    echo   This copy of SwayCommand is incomplete: scripts\bootstrap is missing.
    echo   Re-download or re-clone the project, then run this again.
    echo.
    pause
    exit /b 1
)

if defined SWAYCOMMAND_SETUP_CONSOLE (
    "%PS%" -NoProfile -ExecutionPolicy Bypass -STA -File "%BOOTSTRAP%" -Console
    if errorlevel 1 (
        echo.
        echo   Setup did not finish. The messages above say why.
        echo.
        pause
    )
    exit /b %errorlevel%
)

rem Launch the window and let this console go straight away. The setup window
rem owns all progress and error reporting from here on.
start "" "%PS%" -NoProfile -ExecutionPolicy Bypass -STA -WindowStyle Hidden -File "%BOOTSTRAP%"
exit
