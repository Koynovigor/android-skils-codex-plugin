# Changelog

All notable changes for the Codex Dev Forge marketplace are tracked here.

## Unreleased

Merges the Android Skills upstream `v0.0.11` refresh into the current
`codex-dev-forge` development plugin catalog.

### Marketplace

- Keeps the marketplace id `codex-dev-forge` and display name
  `Codex Dev Forge`.
- Keeps `agent-skills` and `adverse-review` as general development plugins.
- Expands the Android plugin split to:
  `android-cli-tools`, `android-app-capabilities`,
  `android-build-and-release`, `android-ui-migration`, and
  `android-xr-glimmer`.
- Updates all bundled plugin manifests to version `0.2.0`.
- Keeps the generated release artifact named
  `codex-dev-forge-marketplace.zip`.

### Added Plugins And Skills

- `agent-skills`, packaged from `../agent-skills`, adds 22 lifecycle
  engineering skills, shared references, and `code-reviewer`,
  `security-auditor`, and `test-engineer` persona prompts. The Codex package
  maps upstream workflow guidance to Codex tools and uses risk-based specialist
  review guidance for large, release, and security-sensitive work.
- `adverse-review`, packaged from `../adverse`, adds adversarial
  multi-perspective review for non-trivial PRs, release gates,
  security-sensitive changes, large refactors, and critical-vulnerability
  checks. It includes native Codex subagent orchestration guidance, a
  single-agent degraded path when subagents are declined or unavailable, a
  read-only CLI fallback, private review artifacts, uncommitted diff review
  with reviewable untracked text files, strict reviewer JSON validation, and
  deterministic report synthesis.
- `android-app-capabilities` adds Android app-level integration workflows:
  `appfunctions`, `engage-sdk-integration`, and `verified-email`.

### Android Upstream Alignment

- Upstream release tag: `android/skills` `v0.0.11`, published on 2026-05-17.
- Upstream release body: `Manual release of main branch contents.`
- Upstream `v0.0.5...v0.0.11` includes commits from 2026-05-13 through
  2026-05-17. Tags `v0.0.6` and `v0.0.7` point at the same upstream commit.
- Added seven upstream Android skills: `appfunctions`, `verified-email`,
  `adaptive`, `styles`, `engage-sdk-integration`,
  `perfetto-trace-analysis`, and `testing-setup`.
- Renamed the XR skill from `display-ai-glasses-with-jetpack-compose-glimmer`
  to `display-glasses-with-jetpack-compose-glimmer`.
- Refreshed `navigation-3`, `r8-analyzer`, `perfetto-sql`, and XR Glimmer
  guidance and references.
- Replaced the old Perfetto SQL `perfetto-stdlib-docs.md` reference with
  upstream `perfetto-stdlib.md`.

### Packaging

- Updated the sync script to copy all upstream Android roots needed by
  `v0.0.11`: `device-ai`, `devtools`, `identity`, `profilers`, and
  `testing`.
- Updates validator expectations to 7 plugins, 40 packaged skills, and 153
  packaged reference files.
- Updates install docs, release docs, and release workflow text for the
  combined `codex-dev-forge` catalog.
- Adds migration guidance for users moving from the old
  `android-skills-codex` marketplace id to `codex-dev-forge`.
- Keeps the release skills-only: no active `.app.json`, `.mcp.json`, hooks,
  external authentication, or product gating are included.

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
