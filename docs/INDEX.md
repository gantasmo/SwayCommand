# Documentation map

Reference documentation for SwayCommand v0.1.x. Terminology used throughout is defined in [OVERVIEW.md](OVERVIEW.md).

Every document listed here also ships inside the application and is readable in the documentation modal, opened with the `D` key or the DOCS button in the top bar. The modal's sidebar lists the documents in the order set by `DOC_ORDER` in `src/main/main.js`.

## Reading order

For operating the application:

1. [OVERVIEW.md](OVERVIEW.md), system overview, the cockpit, terminology, component map
2. [INSTALLATION.md](INSTALLATION.md), packaged and from-source installation
3. [DOCTOR.md](DOCTOR.md), the startup system check and its fix actions
4. [STUDIO.md](STUDIO.md), the drawers, the kit, and control assignments
5. [TROUBLESHOOTING.md](TROUBLESHOOTING.md), known issues and resolutions

For working with the code:

1. [ARCHITECTURE.md](ARCHITECTURE.md), process model, module inventory, IPC surface, security model
2. [ENGINE.md](ENGINE.md), render pipeline, effects rack, Auto-VJ scheduler, ColorMaster
3. [SCENE_CONTRACT.md](SCENE_CONTRACT.md), scene module interface; required reading before adding a scene
4. [PROJECTS.md](PROJECTS.md), the `.sway` project format, templates, and the timeline model
5. [MIDI.md](MIDI.md) and [AUDIO.md](AUDIO.md), input subsystems and the assignment router
6. [BUILD.md](BUILD.md), build scripts and packaging
7. [ENVIRONMENT.md](ENVIRONMENT.md), environment variables, settings file, network endpoints

For the Sway itself:

1. [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md), USB identity, MIDI map, driver matrix, CDN interface
2. [RESEARCH.md](RESEARCH.md), the underlying research record with citations

## Document inventory

| Document | Scope | Primary audience |
|---|---|---|
| [../README.md](../README.md) | Feature summary, requirements, controls | Everyone |
| [OVERVIEW.md](OVERVIEW.md) | System overview, the cockpit, terminology | Everyone |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Process model, IPC, security | Developers |
| [INSTALLATION.md](INSTALLATION.md) | Install, uninstall, bootstrap scripts | Users, packagers |
| [DOCTOR.md](DOCTOR.md) | System checks and fixes | Users, support |
| [STUDIO.md](STUDIO.md) | Drawers (synth, rack, kit), the sample pool, control assignments | Users |
| [SYNTH.md](SYNTH.md) | Wavetable synth, presets, modulation | Users, developers |
| [MIDI.md](MIDI.md) | MIDI subsystem and the assignment router | Users, developers |
| [AUDIO.md](AUDIO.md) | Audio-analysis subsystem and the timeline transport | Developers |
| [ENGINE.md](ENGINE.md) | Render pipeline and effects rack | Developers |
| [PROJECTS.md](PROJECTS.md) | The `.sway` project format, templates, timeline | Users, scene authors |
| [SCENE_CONTRACT.md](SCENE_CONTRACT.md) | Scene module interface | Scene authors |
| [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md) | Sway hardware interface | Developers, integrators |
| [BUILD.md](BUILD.md) | Build and packaging | Developers, packagers |
| [ANDROID.md](ANDROID.md) | The Android module, the MIDI relay, power over USB | Developers |
| [ENVIRONMENT.md](ENVIRONMENT.md) | Environment variables, settings, endpoints | Developers, support |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Known issues | Users, support |
| [RESEARCH.md](RESEARCH.md) | Research record, citations | Everyone |
