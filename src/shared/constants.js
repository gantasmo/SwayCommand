// Shared constants for SwayCommand, main process and build scripts.
// All Audima facts below were verified against official Audima artifacts
// (firmware USB descriptors, companion app binaries, Cubase/Ableton scripts)
// on 2026-08-19. See docs/RESEARCH.md for sources.

'use strict';

const SWAY = {
  // USB identity (from official firmware CM7.bin device descriptor; stable v1.0.0 to v1.3.0)
  VID: 0x0483,
  PID_NORMAL: 0x52a4, // composite CDC-ACM + class-compliant USB-MIDI
  PID_DFU: 0xdf11, // STM32 ROM bootloader (firmware-update mode)
  // Exact MIDI port name on Windows and macOS (Cubase script equals-match filter).
  // Linux/ALSA typically appends " MIDI 1" to the rawmidi port, so we substring-match too.
  MIDI_PORT_NAME: 'Audima Labs The Sway',
  MANUFACTURER: 'Audima Labs',
};

const AUDIMA = {
  // cdn.audima.com.au 403-blocks curl/python/Go User-Agents; any honest custom UA passes.
  USER_AGENT: 'SwayCommand/0.1 (Sway companion; +https://github.com/swaycommand)',
  HOME: 'https://audima.com.au/',
  DOWNLOADS_PAGE: 'https://audima.com.au/downloads/',
  // Tauri updater manifest: { version, platforms: { 'windows-x86_64': { url, signature }, ... } }
  LATEST_JSON: 'https://cdn.audima.com.au/software/latest.json',
  // minisign public key embedded in Audima's own app (verifies latest.json artifact signatures)
  MINISIGN_PUBKEY: 'RWSHmZALaQgTB08RzBn8ecTwgikkFPA5K01eHmEKTds/Th8QYzV6UlpX',
  // Pinned fallbacks if latest.json is unreachable (may lag behind latest)
  FALLBACK_APP_WIN: 'https://cdn.audima.com.au/software/v1.2.1/The.Sway_1.2.1_x64_en-US.msi',
  FALLBACK_APP_MAC_ARM: 'https://cdn.audima.com.au/software/v1.2.0/The.Sway_1.2.0_aarch64.dmg',
  FALLBACK_APP_MAC_X64: 'https://cdn.audima.com.au/software/v1.2.0/The.Sway_1.2.0_x64.dmg',
  // Windows DFU driver (WinUSB for VID_0483&PID_DF11), only needed for firmware updates
  DFU_DRIVER_ZIP: 'https://cdn.audima.com.au/software/Windows%20DFU%20Driver.zip',
  USER_MANUAL: 'https://cdn.audima.com.au/docs/Audima%20Labs%20The%20Sway%20User%20Manual.pdf',
  FIRMWARE_GUIDE: 'https://cdn.audima.com.au/docs/Audima%20Labs%20The%20Sway%20Firmware%20Update%20Guide.pdf',
  BASE_PROJECT: 'https://cdn.audima.com.au/software/Audima%20Labs%20The%20Sway%20V2.swayproj',
  // Where the companion app keeps its data (Tauri identifier com.audima.sway)
  APP_ID: 'com.audima.sway',
};

const APP = {
  NAME: 'SwayCommand',
  TAGLINE: 'Gesture VJ instrument for the Audima Labs Sway',
};

module.exports = { SWAY, AUDIMA, APP };
