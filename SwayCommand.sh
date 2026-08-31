#!/usr/bin/env bash
# SwayCommand.sh - from-source bootstrap (macOS / Linux)
#
# Checks for Node.js >= 18, installs npm dependencies when needed, then
# launches the app with 'npm run start'.
#
# Run from a terminal:   ./SwayCommand.sh
# macOS double-click:    "SwayCommand.command"
set -euo pipefail

MIN_NODE_MAJOR=18
NODE_DOWNLOAD_URL="https://nodejs.org/en/download"

# Any Electron-hosted terminal exports ELECTRON_RUN_AS_NODE=1. Inherited, it
# makes require('electron') return a path string instead of the API object and
# the app dies on startup. See docs/INSTALLER-DIAGNOSIS.md.
unset ELECTRON_RUN_AS_NODE ELECTRON_NO_ATTACH_CONSOLE ELECTRON_OVERRIDE_DIST_PATH ELECTRON_NO_ASAR NODE_OPTIONS 2>/dev/null || true

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ok()   { printf '[OK]   %s\n' "$*"; }
fix()  { printf '[FIX]  %s\n' "$*"; }
fail() { printf '[FAIL] %s\n' "$*" >&2; }

open_url() {
  if command -v open >/dev/null 2>&1; then
    open "$1" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$1" >/dev/null 2>&1 || true
  fi
}

node_major() {
  node --version 2>/dev/null | sed -e 's/^v//' -e 's/\..*$//'
}

print_install_hints() {
  echo
  echo "Install Node.js ${MIN_NODE_MAJOR}+ and then run this script again:"
  local os id="" id_like=""
  os="$(uname -s)"
  if [ "$os" = "Darwin" ]; then
    echo "  macOS:  brew install node"
    echo "          (no Homebrew? Use the LTS installer: ${NODE_DOWNLOAD_URL})"
  else
    if [ -r /etc/os-release ]; then
      id="$(. /etc/os-release; echo "${ID:-}")"
      id_like="$(. /etc/os-release; echo "${ID_LIKE:-}")"
    fi
    case " $id $id_like " in
      *debian*|*ubuntu*)
        echo "  Debian/Ubuntu:  sudo apt-get update && sudo apt-get install -y nodejs npm"
        echo "                  (for the current LTS use NodeSource: https://github.com/nodesource/distributions)"
        ;;
      *fedora*|*rhel*|*centos*)
        echo "  Fedora:  sudo dnf install -y nodejs npm"
        ;;
      *)
        echo "  Debian/Ubuntu:  sudo apt-get install -y nodejs npm   (or NodeSource for the current LTS)"
        echo "  Fedora:         sudo dnf install -y nodejs npm"
        echo "  Other:          ${NODE_DOWNLOAD_URL}"
        ;;
    esac
  fi
  echo
  echo "Download page: ${NODE_DOWNLOAD_URL}"
  echo
}

echo
echo "SwayCommand - Install & Launch"
echo "Folder: $SCRIPT_DIR"
echo

# --- Step (a): Node.js >= 18 on PATH ---
major=""
if command -v node >/dev/null 2>&1; then
  major="$(node_major || true)"
fi

if [ -n "$major" ] && [ "$major" -ge "$MIN_NODE_MAJOR" ] 2>/dev/null; then
  ok "Node.js $(node --version) found (need >= ${MIN_NODE_MAJOR})."
else
  if [ -z "$major" ]; then
    fail "Node.js was not found on PATH."
  else
    fail "Node.js v${major} is too old (need >= ${MIN_NODE_MAJOR})."
  fi
  print_install_hints
  open_url "$NODE_DOWNLOAD_URL"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  fail "npm was not found on PATH even though Node.js is present."
  print_install_hints
  exit 1
fi

# --- Step (b): install dependencies when missing or stale ---
if [ ! -f package.json ]; then
  fail "package.json was not found in $SCRIPT_DIR - is this a complete copy of the repo?"
  exit 1
fi

need_install=0
if [ ! -d node_modules ] || [ ! -f node_modules/.package-lock.json ]; then
  # npm writes node_modules/.package-lock.json only when a reify completes, so
  # its absence means the last install did not finish.
  need_install=1
  fix "Dependencies are missing or incomplete - installing (first run may take a few minutes)..."
elif [ -f package-lock.json ] && [ package-lock.json -nt node_modules/.package-lock.json ]; then
  need_install=1
  fix "package-lock.json changed - refreshing dependencies..."
else
  ok "Dependencies are already installed."
fi

if [ "$need_install" -eq 1 ]; then
  if ! npm install --no-audit --no-fund; then
    fail "npm install failed. See the output above for details."
    exit 1
  fi
  ok "Dependencies installed."
fi

# --- Step (b2): the Electron runtime itself ---
# electron >= 43 publishes no postinstall hook, so `npm install` creates
# node_modules/electron without ever downloading the ~200 MB runtime and still
# exits 0. Left alone, the download ambushes the user at launch time with no
# progress and no explanation. Do it here, where it can be announced.
electron_binary() {
  [ -f node_modules/electron/path.txt ] || return 1
  printf 'node_modules/electron/dist/%s' "$(cat node_modules/electron/path.txt)"
}

if [ -d node_modules/electron ]; then
  bin="$(electron_binary || true)"
  if [ -z "$bin" ] || [ ! -e "$bin" ]; then
    fix "The Electron runtime was not downloaded by npm - fetching it now (about 200 MB, one time)..."
    # Keep the download in Electron's own cache so wiping node_modules never
    # costs a second download.
    export ELECTRON_CACHE="${ELECTRON_CACHE:-$HOME/.cache/electron}"
    if ! node node_modules/electron/install.js; then
      fail "Could not download the Electron runtime. Check your internet connection or proxy settings, then run this again."
      exit 1
    fi
    ok "Electron runtime installed."
  else
    ok "Electron runtime is present."
  fi
fi

# --- Step (c): launch ---
ok "Starting SwayCommand (npm run start)..."
exec npm run start
