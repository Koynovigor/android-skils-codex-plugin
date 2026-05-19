# Changelog

All notable changes for the Android Skills Codex marketplace are tracked here.

## v0.0.11 - 2026-05-17

Synchronizes the Codex marketplace packaging with upstream `android/skills`
`v0.0.11`, published on 2026-05-17.

### Upstream Alignment

- Upstream release tag: `android/skills` `v0.0.11`.
- Upstream release body: `Manual release of main branch contents.`
- Upstream `v0.0.5...v0.0.11` includes commits from 2026-05-13 through
  2026-05-17. Tags `v0.0.6` and `v0.0.7` point at the same upstream commit.
- Added seven upstream skills: `appfunctions`, `verified-email`, `adaptive`,
  `styles`, `engage-sdk-integration`, `perfetto-trace-analysis`, and
  `testing-setup`.
- Renamed the XR skill from `display-ai-glasses-with-jetpack-compose-glimmer`
  to `display-glasses-with-jetpack-compose-glimmer`.
- Refreshed `navigation-3`, `r8-analyzer`, `perfetto-sql`, and XR Glimmer
  guidance and references.
- Replaced the old Perfetto SQL `perfetto-stdlib-docs.md` reference with
  upstream `perfetto-stdlib.md`.

### Versioning And Update Policy

- Repository release tag: `v0.0.11`.
- Plugin manifest version for all bundled plugins: `0.0.11`.
- `latest` remains the moving stable release ref; use
  `codex plugin marketplace upgrade android-skills-codex` to refresh a `latest`
  install.
- Release tags such as `v0.0.11` are pinned channels; change the Git ref to move
  a pinned install to a newer release.

### Changed Plugins And Skills

- `android-cli-tools` `0.0.11`
  - Refreshed `android-cli-base` from upstream `devtools/android-cli` while
    preserving the packaged Codex skill name.
- `android-app-capabilities` `0.0.11`
  - Added new plugin for Android app-level integration workflows.
  - Added `appfunctions`.
  - Added `engage-sdk-integration`.
  - Added `verified-email`.
- `android-build-and-release` `0.0.11`
  - Refreshed `agp-9-upgrade`.
  - Refreshed `play-billing-library-version-upgrade`.
  - Refreshed `r8-analyzer`.
  - Refreshed `perfetto-sql`.
  - Added `perfetto-trace-analysis`.
  - Added `testing-setup`.
- `android-ui-migration` `0.0.11`
  - Added `adaptive`.
  - Added `styles` for the experimental Compose Styles API.
  - Refreshed `camera1-to-camerax`.
  - Refreshed `edge-to-edge`.
  - Refreshed `migrate-xml-views-to-jetpack-compose`.
  - Refreshed `navigation-3`.
- `android-xr-glimmer` `0.0.11`
  - Replaced `display-ai-glasses-with-jetpack-compose-glimmer` with upstream
    `display-glasses-with-jetpack-compose-glimmer`.

### Packaging

- Updated the sync script to copy all upstream roots needed by `v0.0.11`:
  `device-ai`, `devtools`, `identity`, `profilers`, and `testing`.
- Updated validator and release process expectations to 5 plugins, 17 packaged
  skills, and 148 packaged reference files.
- Updated marketplace metadata, install docs, release docs, and generated
  GitHub Release notes for the new plugin and skill split.

## v0.0.5 - 2026-05-12

Synchronizes the Codex marketplace packaging with upstream `android/skills`
`v0.0.5`, published on 2026-05-09.

### Upstream Alignment

- Upstream release tag: `android/skills` `v0.0.5`.
- Upstream release body: `Manual release of main branch contents.`
- Upstream `v0.0.4...v0.0.5` adds `devtools/android-cli` and
  `profilers/perfetto-sql`, removes the old `android-cli/base` path, and
  refreshes bundled skill metadata and references.

### Versioning And Update Policy

- Repository release tag: `v0.0.5`.
- Plugin manifest version for all bundled plugins: `0.0.5`.
- `latest` remains the moving stable release ref; use
  `codex plugin marketplace upgrade android-skills-codex` to refresh a `latest`
  install.
- Release tags such as `v0.0.5` are pinned channels; change the Git ref to move
  a pinned install to a newer release.

### Changed Plugins And Skills

- `android-cli-tools` `0.0.5`
  - Refreshed `android-cli-base` from upstream `devtools/android-cli` while
    preserving the packaged Codex skill name.
  - Added upstream Android CLI references for device interaction and journeys.
- `android-build-and-release` `0.0.5`
  - Refreshed `agp-9-upgrade`.
  - Refreshed `play-billing-library-version-upgrade`.
  - Refreshed `r8-analyzer`.
  - Added `perfetto-sql`.
- `android-ui-migration` `0.0.5`
  - Refreshed `camera1-to-camerax`.
  - Refreshed `edge-to-edge`.
  - Refreshed `migrate-xml-views-to-jetpack-compose`.
  - Refreshed `navigation-3`.
- `android-xr-glimmer` `0.0.5`
  - Refreshed `display-ai-glasses-with-jetpack-compose-glimmer`.

### Packaging

- Updated the sync script to source Android CLI from `devtools/android-cli`.
- Added `profilers/perfetto-sql` to the packaged marketplace output.
- Updated validator and release process expectations to 10 packaged skills and
  83 packaged reference files.
- Updated generated GitHub Release notes to list `perfetto-sql`.

## v0.0.4 - 2026-05-08

Initial public Codex marketplace release.

### Versioning And Update Policy

- Repository release tag: `v0.0.4`.
- Plugin manifest version for all bundled plugins: `0.0.4`.
- `latest` is the moving stable release ref; use `codex plugin marketplace upgrade android-skills-codex` to refresh a `latest` install.
- Release tags such as `v0.0.4` are pinned channels; change the Git ref to move a pinned install to a newer release.

### Changed Plugins And Skills

- `android-cli-tools` `0.0.4`
  - Added `android-cli-base`.
- `android-build-and-release` `0.0.4`
  - Added `agp-9-upgrade`.
  - Added `play-billing-library-version-upgrade`.
  - Added `r8-analyzer`.
- `android-ui-migration` `0.0.4`
  - Added `camera1-to-camerax`.
  - Added `edge-to-edge`.
  - Added `migrate-xml-views-to-jetpack-compose`.
  - Added `navigation-3`.
- `android-xr-glimmer` `0.0.4`
  - Added `display-ai-glasses-with-jetpack-compose-glimmer`.

### Packaging

- Added `.agents/plugins/marketplace.json`.
- Added four Codex plugin manifests under `plugins/*/.codex-plugin/plugin.json`.
- Added neutral SVG plugin icons under `plugins/*/assets/icon.svg`.
- Added plugin sync and validation scripts.
- Added install and release process documentation.
- Removed legacy Android Skills root directories from the release layout.
