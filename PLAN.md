# Codex Dev Forge Android v0.0.11 Merge Plan

## Active Milestone

Resolve PR #4 merge conflicts by bringing the Android Skills upstream
`v0.0.11` refresh from `dev` into the current `main`-line Codex Dev Forge
marketplace.

## Decisions

- Keep the marketplace id and display name from `main`:
  `codex-dev-forge` / `Codex Dev Forge`.
- Keep the general development plugins from `main`: `agent-skills` and
  `adverse-review`.
- Keep the Android upstream `v0.0.11` refresh from `dev`, including the new
  `android-app-capabilities` plugin and the renamed XR skill
  `display-glasses-with-jetpack-compose-glimmer`.
- Final marketplace split after the merge:
  `android-cli-tools`, `android-app-capabilities`,
  `android-build-and-release`, `android-ui-migration`,
  `android-xr-glimmer`, `agent-skills`, and `adverse-review`.
- Update all bundled plugin manifests to the Codex Dev Forge release version
  `0.2.0`.
- Keep the release skills-only: no `.app.json`, `.mcp.json`, active hooks,
  external authentication, logos, or product gating.

## Expected Package Shape

- Marketplace plugins: 7.
- Packaged skills: 40.
- Packaged reference files: 153.

## Validation Evidence

- Passed before conflict resolution: SocratiCode `codebase_status` reported a
  green index, active watcher, 718 indexed chunks, and code graph availability.
- Passed before conflict resolution: official OpenAI Codex plugin docs MCP
  confirmed `.codex-plugin/plugin.json` as the required plugin manifest,
  `.agents/plugins/marketplace.json` as the repo marketplace location, plugin
  root layout rules, and required marketplace entry fields.
- Passed after conflict resolution: `jq . .agents/plugins/marketplace.json`.
- Passed after conflict resolution: `jq . plugins/*/.codex-plugin/plugin.json`.
- Passed after conflict resolution: `scripts/validate-codex-plugins.sh`.
- Passed after conflict resolution: `find plugins -name SKILL.md | wc -l`
  returned `40`.
- Passed after conflict resolution:
  `find plugins -path '*/references/*' -type f | wc -l` returned `153`.
- Passed after conflict resolution: legacy Android root absence check for
  `android-cli`, `build`, `camera`, `device-ai`, `devtools`, `identity`,
  `jetpack-compose`, `navigation`, `performance`, `play`, `profilers`,
  `system`, `testing`, and `xr`.
- Passed after conflict resolution: release-facing placeholder scan over
  `plugins`, `.agents`, `README.md`, and `docs` excluding packaged references
  returned no matches.
- Passed after conflict resolution: `rg -n "^name: base$" plugins` returned no
  matches.
- Passed after conflict resolution: `git diff --check`.
- Passed after conflict resolution: `git diff --cached --check`.
- Passed after conflict resolution:
  `bash -n scripts/sync-codex-plugins.sh scripts/validate-codex-plugins.sh`.
- Passed after conflict resolution: SocratiCode `codebase_update` indexed the
  changed tree, adding 84 files and updating 7 files.
- Passed after conflict resolution: SocratiCode graph stats reported 28 files,
  29 edges, and 0 circular dependency chains.
- Passed after conflict resolution: local P0/P1 review of staged marketplace,
  release workflow, docs, plugin manifest versions, validator guards, and
  package counts found no release-blocking issue.
- Passed after version bump to `0.2.0`: all seven
  `plugins/*/.codex-plugin/plugin.json` files report version `0.2.0`.
- Passed after version bump to `0.2.0`:
  `jq . plugins/*/.codex-plugin/plugin.json >/dev/null`.
- Passed after version bump to `0.2.0`: `scripts/validate-codex-plugins.sh`.
- Passed after version bump to `0.2.0`: scan of plugin manifests,
  `CHANGELOG.md`, `PLAN.md`, `docs`, `README.md`, and release workflow found
  `0.2.0` in the expected active version locations and no stale `0.1.0`
  references.
- Passed after version bump to `0.2.0`: `git diff --check`.

## Risks And Notes

- The GitHub connector failed to load PR #4 metadata with `KeyError: 'number'`,
  so PR context was read with `gh pr view`.
- PR #4 is `dev` into `main` and GitHub reported merge state `DIRTY`.
- The merge conflict is semantic, not just textual: `main` renamed the
  marketplace and added general plugins while `dev` refreshed Android Skills.
  The correct resolution is the combined Codex Dev Forge catalog.
- Local Codex CLI runtime validation remains blocked until a Codex build with
  plugin marketplace commands is available, as documented in
  `docs/release-process.md`.
- A dedicated subagent reviewer pass was not run because the active tool policy
  only permits subagents when the user explicitly asks for them. A local P0/P1
  review was performed instead.
- Local `origin` was updated from the moved repository URL
  `Koynovigor/android-skils-codex-plugin.git` to
  `Koynovigor/codex-dev-forge.git`.
- Pushing the merge commit is blocked by GitHub auth scope: the active `gh`
  token has `gist`, `read:org`, and `repo`, but GitHub rejects updates touching
  `.github/workflows/create-release.yml` unless the token also has `workflow`.
