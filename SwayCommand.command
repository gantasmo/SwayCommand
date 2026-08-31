#!/usr/bin/env bash
# SwayCommand - macOS double-click launcher.
# Delegates to SwayCommand.sh in the same folder.
#
# If macOS refuses to run this file (e.g. after downloading as a zip),
# make it executable first from Terminal:
#   chmod +x SwayCommand.command SwayCommand.sh
cd "$(dirname "$0")"
exec bash ./SwayCommand.sh
