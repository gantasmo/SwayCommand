// The Doctor, first-run system check. Every check is independent, times out
// on its own, and never throws out of runAll(); the app must always reach the
// project picker even on a machine with nothing attached.
//
// Renderer-side checks (WebGL2, WebMIDI availability, audio input devices)
// are appended by the renderer; this file covers everything that needs OS
// access: USB device presence, companion app install state, DFU driver
// state, and Audima CDN reachability.

'use strict';

const { execFile } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { SWAY, AUDIMA } = require('../shared/constants');
const audima = require('./audima');

const TIMEOUT = 6000;

function run(cmd, args, timeout = TIMEOUT) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout, windowsHide: true, maxBuffer: 8 * 1024 * 1024 }, (err, stdout) => {
      resolve(err && !stdout ? null : String(stdout || ''));
    });
  });
}

const hex4 = (n) => n.toString(16).toUpperCase().padStart(4, '0');
const ID_NORMAL = `VID_${hex4(SWAY.VID)}&PID_${hex4(SWAY.PID_NORMAL)}`;
const ID_DFU = `VID_${hex4(SWAY.VID)}&PID_${hex4(SWAY.PID_DFU)}`;

// --- USB presence ------------------------------------------------------------

async function usbSnapshot() {
  if (process.platform === 'win32') {
    // pnputil ships on every Win10+; /enum-devices lists hardware IDs.
    const out =
      (await run('pnputil.exe', ['/enum-devices', '/connected'])) ||
      (await run('powershell.exe', [
        '-NoProfile',
        '-Command',
        'Get-PnpDevice -PresentOnly | ForEach-Object { $_.InstanceId + "|" + $_.Status }',
      ])) ||
      '';
    return {
      normal: out.toUpperCase().includes(ID_NORMAL),
      dfu: out.toUpperCase().includes(ID_DFU),
      raw: out,
    };
  }
  if (process.platform === 'darwin') {
    const out = (await run('system_profiler', ['SPUSBDataType'])) || '';
    const vid = `0x${hex4(SWAY.VID).toLowerCase()}`;
    const hasVid = out.toLowerCase().includes(vid);
    return {
      normal: hasVid && out.includes(SWAY.MIDI_PORT_NAME),
      dfu: hasVid && /STM32\s+BOOTLOADER/i.test(out),
      raw: out,
    };
  }
  // Linux
  const out = (await run('lsusb', [])) || '';
  const norm = `${hex4(SWAY.VID).toLowerCase()}:${hex4(SWAY.PID_NORMAL).toLowerCase()}`;
  const dfu = `${hex4(SWAY.VID).toLowerCase()}:${hex4(SWAY.PID_DFU).toLowerCase()}`;
  return { normal: out.includes(norm), dfu: out.includes(dfu), raw: out };
}

async function checkSway() {
  try {
    const usb = await usbSnapshot();
    if (usb.normal) {
      return {
        id: 'sway',
        label: 'Audima Sway',
        status: 'ok',
        detail: 'Connected (normal mode). MIDI is driverless on this OS, nothing to install.',
      };
    }
    if (usb.dfu) {
      return {
        id: 'sway',
        label: 'Audima Sway',
        status: 'warn',
        detail:
          'Sway detected in DFU (firmware-update) mode. If a firmware update is stuck for a missing driver, install the official STM32 WinUSB driver, otherwise power-cycle the Sway to return to normal mode.',
        fix:
          process.platform === 'win32'
            ? { id: 'install-dfu-driver', label: 'Install DFU driver (official, elevated)' }
            : null,
      };
    }
    return {
      id: 'sway',
      label: 'Audima Sway',
      status: 'info',
      detail:
        'Not detected. Plug it in over USB any time, SwayCommand hot-attaches automatically. Until then, mouse, keyboard, and any class-compliant MIDI controller all work.',
    };
  } catch (err) {
    return { id: 'sway', label: 'Audima Sway', status: 'info', detail: `USB scan unavailable (${err.message}); MIDI detection still works once the app is running.` };
  }
}

// --- Audima companion app ----------------------------------------------------

async function checkCompanion() {
  try {
    let installed = false;
    let where = '';
    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
      const candidates = [
        path.join(appData, AUDIMA.APP_ID),
        path.join(localAppData, 'The Sway'),
        path.join(process.env.ProgramFiles || 'C:\\Program Files', 'The Sway'),
      ];
      where = candidates.find((p) => fs.existsSync(p)) || '';
      installed = !!where;
      if (!installed) {
        const reg = await run('powershell.exe', [
          '-NoProfile',
          '-Command',
          `Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like '*Sway*' } | Select-Object -ExpandProperty DisplayName`,
        ]);
        installed = !!(reg && reg.trim());
        if (installed) where = 'registry';
      }
    } else if (process.platform === 'darwin') {
      where = ['/Applications/The Sway.app', path.join(os.homedir(), 'Applications', 'The Sway.app')].find((p) =>
        fs.existsSync(p)
      ) || '';
      installed = !!where;
    } else {
      // Audima ships no Linux build of the companion app.
      return {
        id: 'companion',
        label: 'Audima Sway Software',
        status: 'info',
        detail: 'Audima ships no Linux build of the companion app. Not required to play, only for editing device presets and firmware updates (use Windows/macOS for those).',
      };
    }

    if (installed) {
      return { id: 'companion', label: 'Audima Sway Software', status: 'ok', detail: 'Installed. Use it to edit on-device presets and update firmware.' };
    }
    return {
      id: 'companion',
      label: 'Audima Sway Software',
      status: 'info',
      detail:
        'Not installed. Optional, SwayCommand plays without it. It is only needed to edit the Sway\u2019s on-device presets or update firmware.',
      fix: { id: 'fetch-companion', label: 'Download from Audima (signature-verified)' },
    };
  } catch (err) {
    return { id: 'companion', label: 'Audima Sway Software', status: 'info', detail: `Could not determine (${err.message}).` };
  }
}

// --- DFU driver (Windows only) -------------------------------------------------

async function checkDfuDriver() {
  if (process.platform !== 'win32') {
    return {
      id: 'dfu-driver',
      label: 'Firmware-update driver',
      status: 'ok',
      detail: 'Not needed on this OS, DFU works with built-in class drivers.',
    };
  }
  try {
    const out = (await run('pnputil.exe', ['/enum-drivers'])) || '';
    const present = /stm32bootloader\.inf/i.test(out);
    if (present) {
      return { id: 'dfu-driver', label: 'Firmware-update driver', status: 'ok', detail: 'Official STM32 WinUSB driver is staged. Firmware updates will just work.' };
    }
    return {
      id: 'dfu-driver',
      label: 'Firmware-update driver',
      status: 'info',
      detail:
        'Not installed. Normal play needs no driver; this is only used when updating Sway firmware. Install now or later, SwayCommand fetches Audima\u2019s official package.',
      fix: { id: 'install-dfu-driver', label: 'Install DFU driver (official, elevated)' },
    };
  } catch (err) {
    return { id: 'dfu-driver', label: 'Firmware-update driver', status: 'info', detail: `Could not determine (${err.message}).` };
  }
}

// --- Audima CDN reachability ---------------------------------------------------

async function checkNetwork() {
  try {
    const latest = await audima.fetchLatest(5000);
    return {
      id: 'network',
      label: 'Audima update channel',
      status: 'ok',
      detail: `cdn.audima.com.au reachable, latest Sway Software is v${latest.version}.`,
    };
  } catch (err) {
    return {
      id: 'network',
      label: 'Audima update channel',
      status: 'warn',
      detail: `Audima CDN unreachable (${err.message}). Playing works fully offline; download fixes are unavailable until you\u2019re online.`,
      fix: { id: 'open-downloads-page', label: 'Open audima.com.au/downloads in browser' },
    };
  }
}

// --- OS summary ------------------------------------------------------------------

function checkPlatform() {
  const names = { win32: 'Windows', darwin: 'macOS', linux: 'Linux' };
  return {
    id: 'platform',
    label: 'System',
    status: 'ok',
    detail: `${names[process.platform] || process.platform} ${os.release()} (${process.arch}), ${Math.round(os.totalmem() / 1e9)} GB RAM.`,
  };
}

async function runAll() {
  const checks = await Promise.allSettled([
    Promise.resolve(checkPlatform()),
    checkSway(),
    checkCompanion(),
    checkDfuDriver(),
    checkNetwork(),
  ]);
  return checks.map((c, i) =>
    c.status === 'fulfilled'
      ? c.value
      : { id: `check-${i}`, label: 'Check', status: 'info', detail: String(c.reason) }
  );
}

module.exports = { runAll };
