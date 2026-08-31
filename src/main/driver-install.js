// Windows DFU driver installation. Uses Audima's official driver package
// (ST-signed WinUSB INF for the STM32 bootloader, VID_0483&PID_DF11) and
// stages it with pnputil under a user-approved UAC elevation. Only ever
// invoked from an explicit Doctor "Fix" click, never silently.

'use strict';

const { execFile } = require('node:child_process');
const audima = require('./audima');

function runPS(command, timeout = 180000) {
  return new Promise((resolve, reject) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-Command', command],
      { windowsHide: true, timeout },
      (err, stdout, stderr) => (err ? reject(new Error(stderr || err.message)) : resolve(String(stdout || '')))
    );
  });
}

async function installDfuDriver(progress) {
  if (process.platform !== 'win32') {
    return { ok: true, detail: 'No driver needed on this OS, DFU uses built-in class drivers.' };
  }
  try {
    if (progress) progress({ phase: 'download', pct: 0 });
    const infPath = await audima.downloadDfuDriver(progress);

    if (progress) progress({ phase: 'install', pct: 100 });
    // Elevate just the pnputil call; Windows shows the standard UAC prompt.
    // -Wait + -PassThru lets us read the exit code of the elevated process.
    const cmd =
      `$p = Start-Process -FilePath pnputil.exe -ArgumentList '/add-driver','"${infPath}"','/install' ` +
      `-Verb RunAs -Wait -PassThru; exit $p.ExitCode`;
    await runPS(cmd);

    return {
      ok: true,
      detail:
        'Official STM32 DFU driver installed. If the Sway is currently in DFU mode, unplug and reconnect it, then retry the firmware update.',
    };
  } catch (err) {
    const cancelled = /canceled|cancelled|1223/i.test(String(err.message));
    return {
      ok: false,
      detail: cancelled
        ? 'Elevation was declined, the driver was not installed. You can run this fix again any time.'
        : `Driver install failed: ${err.message}. You can install manually from audima.com.au/downloads (Windows DFU Driver).`,
    };
  }
}

module.exports = { installDfuDriver };
