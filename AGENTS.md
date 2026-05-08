# AGENTS.md

## Scope

This is the durable repo-level rule set for the Android Skills Codex marketplace project.

Keep this file short and reusable. Put task-specific detail, milestone sequencing, current status,
and release decisions in `PLAN.md`.

This repository packages Android Skills as Codex plugins and a Codex marketplace. It is not an
Android application project.

## Source Of Truth

- `PLAN.md` is the execution plan and milestone tracker. Follow it before making code, docs,
  workflow, marketplace, or plugin-structure changes.
- At the start of every substantive session, reread this file and `PLAN.md` before edits.
- Do not ask the user for next steps when the current milestone can continue from repository
  context.
- Ask the user only for real blockers: contradictory requirements, missing credentials/services,
  unavailable required Codex/GitHub tooling, unclear release ownership, or user-owned changes that
  make continuing unsafe.
- Keep `PLAN.md` current when reality changes: update milestone status, decisions, validation
  evidence, discovered risks, and changed scope.
- If `PLAN.md` conflicts with OpenAI Codex plugin documentation, stop broad implementation work,
  re-check official OpenAI docs, update the plan, and explain the mismatch.

## Mandatory SocratiCode MCP

- SocratiCode MCP is mandatory for substantial repository work.
- After reading this file and `PLAN.md`, use SocratiCode MCP before broad codebase exploration,
  dependency/impact analysis, file moves, skill regrouping, release workflow changes, or deleting
  generated/plugin packaging paths.
- Use SocratiCode for indexed project discovery, semantic/codebase search, dependency graph
  checks, circular dependency checks, and symbol or call-flow orientation when those tools are
  available.
- Use exact file tools such as `rg`, `find`, `sed`, and `git` for precise path checks, literal
  strings, JSON keys, workflow names, and validation commands.
- If SocratiCode is unavailable, unhealthy, unindexed, or missing the specific tool needed for the
  task, record that in `PLAN.md` or the handoff and continue with exact local tools. Do not skip the
  intent of the SocratiCode check silently.

## OpenAI Codex Plugin Rules

- Before changing `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, marketplace
  install docs, or plugin release behavior, consult current official OpenAI docs via the OpenAI
  docs MCP.
- Use `.codex-plugin/plugin.json` as the required plugin manifest path.
- Keep only `plugin.json` inside `.codex-plugin/`.
- Keep `skills/`, `assets/`, `.mcp.json`, `.app.json`, and `hooks/` at plugin root when they are
  used.
- Marketplace metadata belongs in `.agents/plugins/marketplace.json`.
- Every marketplace entry must include `name`, `source`, `policy.installation`,
  `policy.authentication`, and `category`.
- Manifest and marketplace paths should be relative, start with `./`, and stay inside the
  marketplace or plugin root.
- Do not add `.mcp.json`, `.app.json`, hooks, external authentication, or product gating unless
  `PLAN.md` explicitly adds a milestone for it.

## Repository Layout Rules

- The root Android skill directories are temporary migration inputs only:
  `android-cli/`, `build/`, `camera/`, `jetpack-compose/`, `navigation/`, `performance/`, `play/`,
  `system/`, and `xr/`.
- The final release layout must remove those legacy root directories after their contents are
  packaged and validated under `plugins/*/skills/`.
- Codex distribution files live in `.agents/plugins/`, `plugins/`, `scripts/`, and `docs/`; after
  cleanup these are the repository source of truth.
- Keep the first marketplace split from `PLAN.md` unless the plan is deliberately revised:
  `android-cli-tools`, `android-build-and-release`, `android-ui-migration`, and
  `android-xr-glimmer`.
- Packaged skills under `plugins/*/skills/` must preserve their `references/` directories and
  relative links.
- The root skill `android-cli/base` is too generic for marketplace distribution. The packaged
  skill must be named `android-cli-base`.
- During migration, treat packaged skill copies as distribution output generated from the legacy
  root layout. After cleanup, edit plugin skill directories directly or refresh from a temporary
  upstream extraction via the sync script's `SOURCE_ROOT`.
- Do not include `.idea/`, local IDE files, caches, temporary downloads, or generated archives in
  releases unless `PLAN.md` explicitly requires them.
- Preserve `Apache-2.0` licensing and existing skill metadata. Do not add Google logos, Android
  robot assets, or wording that implies official Google/OpenAI publication unless explicitly
  authorized.
- The existing `update-skills` workflow must never delete `.agents/`, `plugins/`, `scripts/`, or
  docs required for Codex distribution, and must not recreate legacy root skill directories in the
  final release layout.

## Codex Delegation And Subagents

- The main agent owns architecture decisions, the critical path, final validation, every
  `PLAN.md` update, and milestone handoff.
- Use subagents only when the active platform, tool instructions, and user instructions permit
  them. If the active tool policy requires explicit user permission before spawning subagents, get
  that permission first.
- When permitted, use subagents for bounded read-only analysis, parallel context gathering, and
  final P0/P1 reviewer passes.
- Do not delegate the immediate blocking next step on the critical path. First identify what the
  main agent must do locally, then delegate independent side work that can run in parallel.
- Delegate code or docs changes only when the ownership boundary is explicit and the delegated
  write set does not overlap other active work.
- Every delegated task must include expected output, file/module ownership, relevant `AGENTS.md`
  and `PLAN.md` context, validation expectations, and an explicit instruction not to edit
  `PLAN.md` unless the user directly asks for it.
- Any subagent that edits files must be told it is not alone in the worktree, must not revert
  user/main-agent changes, and must list changed file paths in its final response.
- Treat subagent edits as proposed work until the main agent reviews the diff, checks correctness,
  verifies milestone fit, and runs or records relevant validation.
- Close subagents promptly after their result is processed.
- After each milestone, when subagents are permitted, run a dedicated read-only reviewer pass
  scoped to P0/P1 regressions in changed code, docs, workflows, marketplace metadata, release
  packaging, and validation evidence.
- Reviewer scope excludes cosmetic findings, naming preferences, broad refactors, and style
  nitpicks unless they create correctness, release-safety, privacy, legal, or integration risk.
- If subagents are unavailable, record the missing reviewer gate in `PLAN.md` or the handoff and
  perform a local P0/P1 review before yielding.

## Execution Rules

- Use `rg` or `rg --files` first for exact repository searches when SocratiCode is not the right
  tool.
- Keep diffs scoped to the active milestone in `PLAN.md`.
- Prefer small, reviewable changes with validation after each milestone.
- Do not make destructive git or filesystem changes unless the user explicitly requested them.
- Never revert user changes you did not make.
- Use structured JSON tools or `jq` for manifest and marketplace validation instead of ad hoc text
  parsing.
- Do not update plugin versions, release tags, marketplace channel behavior, or GitHub release
  workflows without updating docs and validation expectations.

## Validation Defaults

Run commands from the repository root.

- Inspect working tree:
  - `git status --short`
- Validate marketplace and plugin JSON:
  - `jq . .agents/plugins/marketplace.json`
  - `jq . plugins/*/.codex-plugin/plugin.json`
- Sync packaged plugins from an explicit upstream extraction when the sync script exists:
  - `SOURCE_ROOT=/tmp/android-skills-upstream scripts/sync-codex-plugins.sh`
- Validate packaged plugins when the validation script exists:
  - `scripts/validate-codex-plugins.sh`
- Check packaged skill count:
  - `find plugins -name SKILL.md | wc -l`
- Check packaged references:
  - `find plugins -path '*/references/*' -type f | wc -l`
- Check legacy root layout is absent before release:
  - `for path in android-cli build camera jetpack-compose navigation performance play system xr; do test ! -e "$path" || { echo "Legacy root path still exists: $path"; exit 1; }; done`
- Check for release-facing placeholders:
  - `rg -n "TODO|TBD|FIXME" plugins .agents README.md docs -g '!plugins/**/references/**' || true`
- Check that the generic packaged skill name is gone:
  - `rg -n "^name: base$" plugins || true`

If a validation command is unavailable, record the exact reason and the closest substitute used.

## Documentation

- Update `README.md` and `docs/codex-marketplace-install.md` when install, update, plugin split,
  or release behavior changes.
- Update `docs/release-process.md` when release workflow, versioning, artifacts, or validation
  commands change.
- Keep consumer-facing install instructions concrete:
  - GitHub source
  - Git ref behavior
  - selective paths
  - upgrade command
  - restart/new-thread expectations
- Keep technical names such as `plugin.json`, `marketplace.json`, `SKILL.md`, `Codex`, `MCP`,
  `Git ref`, and plugin IDs in English.

## Done Means

- The active `PLAN.md` milestone is implemented or explicitly blocked.
- Relevant marketplace files, plugin manifests, skills, scripts, docs, workflows, and release
  notes are updated together.
- Validation commands pass, or blocked validation is documented with the exact reason.
- `PLAN.md` states what is done, what remains, what changed, and why.

## Milestone Handoff

State what was done, which `PLAN.md` items closed, which validations ran with results, which
validations were blocked, and the next already-known milestone step.
