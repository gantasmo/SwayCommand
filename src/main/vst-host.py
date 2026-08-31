"""SwayCommand VST3 sidecar, one-shot commands over stdin/stdout JSON.

Hosts VST3 plugins through pedalboard (Spotify), the same library theDAW's MIX
chain uses, so a plugin dialled in there sounds the same here. SwayCommand has
no native audio host of its own: a track's VST chain is RENDERED through this
script to a wet file and played back as a wet/dry mix (src/main/vsthost.js
spawns it; src/renderer/audio/transport.js plays the result).

    python vst-host.py <command>   with a JSON job on stdin, JSON reply on stdout

Commands
  probe    -> { ok, version, python }
  scan     { dirs?: [..] }                       -> { plugins: [{ name, path, vendor, category }] }
  params   { path }                              -> { name, params: [{ name, raw, text }] }
  render   { input, output, tail?, plugins: [{ path, params?: {name: raw}, rawState?: b64 }] }
           -> { ok, output, seconds }
  editor   { path, rawState? }                   -> { rawState: b64, params: [...] }
           (opens the plugin's native editor, blocks until it is closed)

Only the last line of stdout is the reply; anything the plugin prints goes to
stderr. Errors come back as { error } with exit code 1.
"""

from __future__ import annotations

import base64
import json
import os
import platform
import sys
import traceback
from pathlib import Path


def _out(obj, code=0):
    sys.stdout.write(json.dumps(obj) + "\n")
    sys.stdout.flush()
    sys.exit(code)


def _job():
    raw = sys.stdin.read()
    return json.loads(raw) if raw.strip() else {}


def _pb():
    import pedalboard  # heavy; imported lazily so probe can explain a missing install

    return pedalboard


# pedalboard's own effects ride along as "builtin:<Class>" so a machine with
# no VST3 installed still has a chain to render, and the path is exercised.
BUILTINS = [
    "Reverb", "Delay", "Chorus", "Phaser", "Distortion", "Compressor", "Limiter",
    "Gain", "HighpassFilter", "LowpassFilter", "LadderFilter", "Bitcrush", "Clipping",
    "NoiseGate", "PitchShift", "Invert", "MP3Compressor", "GSMFullRateCompressor",
]


def _builtin_params(plugin):
    rows = []
    for name in dir(plugin):
        if name.startswith("_"):
            continue
        try:
            val = getattr(plugin, name)
        except Exception:
            continue
        if isinstance(val, bool) or not isinstance(val, (int, float)):
            # enum-like attributes (e.g. LadderFilter.mode) are skipped
            continue
        rows.append({"name": name, "raw": float(val), "text": f"{val:g}"})
    return rows


def _load(pb, path):
    if isinstance(path, str) and path.startswith("builtin:"):
        cls = getattr(pb, path.split(":", 1)[1], None)
        if cls is None:
            raise ValueError(f"unknown builtin {path}")
        return cls()
    try:
        return pb.load_plugin(path)
    except Exception:
        names = None
        try:
            names = pb.VST3Plugin.get_plugin_names_for_file(path)
        except Exception:
            pass
        if names:
            return pb.load_plugin(path, plugin_name=names[0])
        raise


def _param_rows(plugin):
    rows = []
    if not hasattr(plugin, "parameters"):
        return _builtin_params(plugin)
    try:
        items = plugin.parameters.items()
    except Exception:
        return rows
    for name, prm in items:
        raw = None
        text = ""
        try:
            raw = float(prm.raw_value)
        except Exception:
            try:
                raw = float(prm)
            except Exception:
                raw = None
        try:
            text = str(prm.string_value)
        except Exception:
            try:
                text = str(prm)
            except Exception:
                text = ""
        rows.append({"name": str(name), "raw": raw, "text": text[:48]})
    return rows


def _apply(plugin, params, raw_state):
    if not hasattr(plugin, "parameters"):
        for name, raw in (params or {}).items():
            try:
                setattr(plugin, name, float(raw))
            except Exception:
                pass
        return
    if raw_state:
        try:
            plugin.raw_state = base64.b64decode(raw_state)
        except Exception:
            pass
    for name, raw in (params or {}).items():
        try:
            prm = plugin.parameters[name]
            prm.raw_value = float(raw)
        except Exception:
            try:
                plugin.parameters[name] = float(raw)
            except Exception:
                pass


def _default_dirs():
    system = platform.system()
    dirs = []
    if system == "Windows":
        common = os.environ.get("COMMONPROGRAMFILES", r"C:\Program Files\Common Files")
        common86 = os.environ.get("COMMONPROGRAMFILES(X86)", r"C:\Program Files (x86)\Common Files")
        dirs += [Path(common) / "VST3", Path(common86) / "VST3"]
    elif system == "Darwin":
        dirs += [Path("/Library/Audio/Plug-Ins/VST3"), Path.home() / "Library/Audio/Plug-Ins/VST3"]
    else:
        dirs += [Path("/usr/lib/vst3"), Path("/usr/local/lib/vst3"), Path.home() / ".vst3"]
    return [d for d in dirs if d.is_dir()]


def cmd_probe(_job):
    try:
        pb = _pb()
        _out({"ok": True, "version": getattr(pb, "__version__", "?"), "python": sys.version.split()[0]})
    except Exception as e:  # pedalboard missing
        _out({"ok": False, "error": str(e), "python": sys.version.split()[0]})


def cmd_scan(job):
    dirs = _default_dirs()
    for d in job.get("dirs") or []:
        p = Path(d)
        if p.is_dir():
            dirs.append(p)
    seen = set()
    plugins = []
    for d in dirs:
        try:
            items = list(d.rglob("*.vst3"))
        except Exception:
            continue
        for item in items:
            # A .vst3 is a bundle directory on every platform; a bare file too.
            try:
                ap = str(item.resolve())
            except Exception:
                continue
            if ap in seen:
                continue
            # Skip the .vst3 entries nested INSIDE a bundle (Contents/x86_64-win/x.vst3).
            if any(part.lower().endswith(".vst3") for part in item.parent.parts):
                continue
            seen.add(ap)
            vendor = ""
            category = "unknown"
            mi = item / "Contents" / "moduleinfo.json"
            if mi.is_file():
                try:
                    info = json.loads(mi.read_text(encoding="utf-8"))
                    cls = info.get("Classes") or info.get("classes") or []
                    for c in cls:
                        cat = str(c.get("Category") or c.get("category") or "")
                        if cat == "Audio Module Class":
                            vendor = str(c.get("Vendor") or c.get("vendor") or vendor)
                            sub = str(c.get("Sub Categories") or c.get("subCategories") or "")
                            category = "instrument" if "Instrument" in sub else "effect" if "Fx" in sub else category
                            break
                    if not vendor:
                        vendor = str(info.get("Factory Info", {}).get("Vendor", ""))
                except Exception:
                    pass
            plugins.append({"name": item.stem, "path": ap, "vendor": vendor, "category": category})
    plugins.sort(key=lambda p: p["name"].lower())
    try:
        pb = _pb()
        for name in BUILTINS:
            if hasattr(pb, name):
                plugins.append({"name": f"{name} (pedalboard)", "path": f"builtin:{name}", "vendor": "pedalboard", "category": "effect"})
    except Exception:
        pass
    _out({"plugins": plugins})


def cmd_params(job):
    pb = _pb()
    plugin = _load(pb, job["path"])
    _apply(plugin, job.get("params"), job.get("rawState"))
    _out({"name": getattr(plugin, "name", Path(job["path"]).stem), "params": _param_rows(plugin)})


def cmd_render(job):
    import numpy as np

    pb = _pb()
    from pedalboard.io import AudioFile

    src = job["input"]
    dst = job["output"]
    tail = float(job.get("tail", 3.0))
    with AudioFile(src) as f:
        audio = f.read(f.frames)  # channels x frames, float32
        sr = f.samplerate
    if audio.ndim == 1:
        audio = audio[np.newaxis, :]
    if tail > 0:
        pad = np.zeros((audio.shape[0], int(sr * tail)), dtype=audio.dtype)
        audio = np.concatenate([audio, pad], axis=1)
    board = []
    for entry in job.get("plugins") or []:
        plugin = _load(pb, entry["path"])
        _apply(plugin, entry.get("params"), entry.get("rawState"))
        board.append(plugin)
    out = audio
    for plugin in board:
        out = plugin(out, sr)
    out = np.clip(out, -1.0, 1.0).astype("float32")
    Path(dst).parent.mkdir(parents=True, exist_ok=True)
    with AudioFile(dst, "w", samplerate=sr, num_channels=out.shape[0]) as f:
        f.write(out)
    _out({"ok": True, "output": dst, "seconds": out.shape[1] / sr, "sampleRate": sr})


def cmd_editor(job):
    pb = _pb()
    plugin = _load(pb, job["path"])
    _apply(plugin, job.get("params"), job.get("rawState"))
    if not hasattr(plugin, "show_editor"):
        _out({"error": "this effect has no window of its own; set its values in the track panel", "params": _param_rows(plugin)}, 1)
    try:
        plugin.show_editor()  # blocks on this thread until the window closes
    except Exception as e:
        _out({"error": f"editor: {e}", "params": _param_rows(plugin)}, 1)
    state = None
    try:
        state = base64.b64encode(bytes(plugin.raw_state)).decode("ascii")
    except Exception:
        state = None
    _out({"rawState": state, "params": _param_rows(plugin)})


COMMANDS = {
    "probe": cmd_probe,
    "scan": cmd_scan,
    "params": cmd_params,
    "render": cmd_render,
    "editor": cmd_editor,
}


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    fn = COMMANDS.get(cmd)
    if not fn:
        _out({"error": f"unknown command {cmd!r}"}, 2)
    try:
        fn(_job())
    except SystemExit:
        raise
    except Exception as e:
        sys.stderr.write(traceback.format_exc())
        _out({"error": str(e)}, 1)


if __name__ == "__main__":
    main()
