# Android Skills v0.0.11 Refresh Plan

## Active Milestone

Refresh this Android Skills Codex marketplace from upstream `android/skills`
`v0.0.5` to upstream tag `v0.0.11`.

## Decisions

- Use upstream tag `v0.0.11` (`2496da2`) as the sync source, not upstream
  `main`, because `main` currently contains commits after the release tag.
- Preserve the existing Android marketplace id `android-skills-codex`.
- Revise the Android plugin split from four to five plugins:
  `android-cli-tools`, `android-app-capabilities`,
  `android-build-and-release`, `android-ui-migration`, and
  `android-xr-glimmer`.
- Add `android-app-capabilities` for Android app-level integrations:
  `appfunctions`, `verified-email`, and `engage-sdk-integration`.
- Keep `android-cli-base` as the packaged name for upstream
  `devtools/android-cli`.
- Rename the packaged XR skill to upstream
  `display-glasses-with-jetpack-compose-glimmer`; do not keep the old
  `display-ai-glasses-with-jetpack-compose-glimmer` copy.
- Keep the release skills-only: no `.app.json`, `.mcp.json`, hooks, external
  authentication, logos, or product gating.

## Upstream Changes Since v0.0.5

- Added `device-ai/appfunctions`.
- Added `identity/verified-email`.
- Added `jetpack-compose/adaptive`.
- Added `jetpack-compose/theming/styles`.
- Added `play/engage-sdk-integration`.
- Added `profilers/perfetto-trace-analysis`.
- Added `testing/testing-setup`.
- Renamed XR skill path and frontmatter from
  `display-ai-glasses-with-jetpack-compose-glimmer` to
  `display-glasses-with-jetpack-compose-glimmer`.
- Updated `navigation-3`, `r8-analyzer`, `perfetto-sql`, and XR Glimmer
  references.
- Replaced the old Perfetto SQL `perfetto-stdlib-docs.md` reference with
  upstream `perfetto-stdlib.md`.

## Expected Package Shape

- Marketplace plugins: 5.
- Packaged Android skills: 17.
- Packaged Android reference files: 148.
- Plugin manifest version for this refresh: `0.0.11`.

## Validation Evidence

- Passed: `gh release view v0.0.11 --repo android/skills --json name,tagName,publishedAt,body`
  returned upstream release body `Manual release of main branch contents.` and
  `publishedAt` `2026-05-17T15:18:29Z`.
- Passed: `SOURCE_ROOT=/private/tmp/android-skills-upstream-v0011 scripts/sync-codex-plugins.sh`.
- Passed: `jq . .agents/plugins/marketplace.json`.
- Passed: `jq . plugins/*/.codex-plugin/plugin.json`.
- Passed: `scripts/validate-codex-plugins.sh`.
- Passed after Perfetto guardrail fix: `scripts/validate-codex-plugins.sh`.
- Passed: `find plugins -name SKILL.md | wc -l` returned `17`.
- Passed: `find plugins -path '*/references/*' -type f | wc -l` returned `148`.
- Passed: legacy root absence check for `android-cli`, `build`, `camera`,
  `device-ai`, `devtools`, `identity`, `jetpack-compose`, `navigation`,
  `performance`, `play`, `profilers`, `system`, `testing`, and `xr`.
- Passed: release-facing placeholder scan over `plugins`, `.agents`,
  `README.md`, and `docs` excluding packaged references returned no matches.
- Passed: `rg -n "^name: base$" plugins || true` returned no matches.
- Passed: `git diff --check`.
- Passed: `bash -n scripts/sync-codex-plugins.sh scripts/validate-codex-plugins.sh`.
- Passed: symlink scan over `plugins`, `.agents`, `scripts`, and `docs`
  returned no symlinks.
- Passed: SocratiCode `codebase_update` re-indexed the changed package.
- Passed: SocratiCode dependency graph reported 2 shell files, 0 edges, and
  0 circular dependency chains.
- Passed: read-only P0/P1 correctness and release-safety reviewer reported no
  P0/P1 findings after checking marketplace shape, `0.0.11` manifests, sync
  mappings, renamed XR skill, docs, workflow release notes, counts, and legacy
  root absence.
- Passed: security re-review reported no remaining P0/P1 security or
  release-safety findings. The previous High supply-chain finding is resolved
  for a skills-only marketplace package because both Perfetto paths now require
  current-thread approval and disclose the unpinned lazy-loaded binary behavior.

## Risks And Notes

- `PLAN.md` was missing at session start, despite `AGENTS.md` requiring it as
  the source of truth. This file restores the active milestone tracker.
- The local Codex runtime validation gap documented in `docs/release-process.md`
  remains unless a newer Codex build with plugin marketplace commands is used.
- Upstream `jetpack-compose/theming/styles` uses experimental Compose Styles
  APIs; public copy should avoid implying stable platform maturity.
- Security reviewer found that both Perfetto SQL paths instruct live download
  and execution of `trace_processor`. The packaged adaptation now adds a Codex
  security guardrail requiring explicit current-thread approval, disclosure of
  the lazy-loaded binary behavior, and a trusted local-copy alternative before
  download/chmod/execute.
