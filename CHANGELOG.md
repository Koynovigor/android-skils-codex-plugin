# Changelog

All notable changes for the Android Skills Codex marketplace are tracked here.

## v0.0.4 - 2026-05-08

Initial public Codex marketplace release.

### Versioning And Update Policy

- Repository release tag: `v0.0.4`.
- Plugin manifest version for all bundled plugins: `0.0.4`.
- `main` is the rolling stable channel; use `codex plugin marketplace upgrade android-skills-codex` to refresh a `main` install.
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
