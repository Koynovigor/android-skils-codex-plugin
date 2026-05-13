# Release Process

Use this checklist to cut a Codex Dev Forge marketplace release from this
repository.

## 1. Refresh Upstream Skills

When refreshing upstream Android Skills, extract them into a temporary directory
outside the final release layout.

```bash
SOURCE_ROOT=/tmp/android-skills-upstream scripts/sync-codex-plugins.sh
```

When refreshing `agent-skills`, copy from a clean upstream checkout or
extraction into `plugins/agent-skills`, then reapply Codex-specific adaptation
in `plugins/agent-skills/AGENTS.md` and intentionally patched skill text.

When refreshing `adverse`, copy from a clean upstream checkout or extraction
into `plugins/adverse-review`, preserve `bin/`, `src/`,
`skills/adverse-review/`, `tests/`, `package.json`, `README.md` as
`UPSTREAM.md`, and `LICENSE`, then reapply Codex-specific adaptation in
`plugins/adverse-review/AGENTS.md`, `README.md`, and
`skills/adverse-review/SKILL.md`.

After any `adverse-review` upstream refresh, verify that the packaged plugin
still provides the current Codex behavior:

- Native Codex use prefers subagent orchestration and asks for subagent
  permission when the active runtime policy requires it.
- If subagents are declined or unavailable, the skill reports a degraded
  single-agent local review instead of pretending panel consensus.
- The CLI fallback is read-only and non-interactive.
- Uncommitted diff review includes reviewable untracked text files, respects the
  selected target path, skips common sensitive local files and symlinks, and
  keeps a complete `files.json` scope list for batched review when the source
  block is truncated.
- Review artifacts are written to private per-run files and existing or symlink
  output paths are refused.
- Reviewer JSON is schema-validated before synthesis, missing degraded artifacts
  are handled explicitly, and synthesis keeps findings tied to the reporter and
  concrete location when available.
- Subprocess output and collected source are bounded so hostile repositories or
  misconfigured reviewer commands cannot exhaust memory before truncation.

Run the `adverse-review` Node test suite after any refresh:

```bash
npm test --prefix plugins/adverse-review
npm run lint --prefix plugins/adverse-review
```

Do not rely on legacy root Android skill directories during release. They are
migration inputs only and must be absent before the public release is cut.

## 2. Validate Package Shape

Run the plugin validator:

```bash
scripts/validate-codex-plugins.sh
```

Confirm the legacy Android root layout is absent:

```bash
for path in android-cli build camera devtools jetpack-compose navigation performance play profilers system xr; do
  test ! -e "$path" || { echo "Legacy root path still exists: $path"; exit 1; }
done
```

Confirm the packaged counts:

```bash
find plugins -name SKILL.md | wc -l
find plugins -path '*/references/*' -type f | wc -l
```

The current marketplace contains 33 packaged skills and 88 packaged reference
files. If that package shape changes, update the validator, changelog, and
release notes together.

## 3. Update Versions And Notes

Use one release tag and derive the manifest version from it:

```bash
RELEASE_TAG=vX.Y.Z
VERSION="${RELEASE_TAG#v}"
```

Before release:

- Update all plugin manifest versions in `plugins/*/.codex-plugin/plugin.json`
  to `$VERSION`.
- Update `CHANGELOG.md` under `$RELEASE_TAG` with changed plugins, bundled
  skills, and upgrade guidance.
- Keep public install docs version-agnostic: use `latest`, `<release-tag>`, and
  `https://github.com/Koynovigor/android-skils-codex-plugin/releases/latest`
  instead of hard-coding a specific version.
- Preserve Apache-2.0 repository packaging license, Android skill metadata, and
  MIT licensing for bundled `agent-skills` and `adverse-review` content.
- Do not add `.app.json`, `.mcp.json`, active hooks, external authentication, or
  product gating unless the plan explicitly adds that scope.

The release workflow uses GitHub-provided context instead of hard-coded
repository or version text:

- `${{ github.repository }}` / `$GITHUB_REPOSITORY` for the install source in
  generated release notes.
- `${{ inputs.tag_name }}` for the pinned release Git ref.
- `${{ inputs.version }}` for plugin manifest version validation and release
  notes.

## 4. Verify Upstream Alignment

Verify whether upstream `android/skills` has the same release tag when cutting
an Android refresh release:

```bash
gh release view "$RELEASE_TAG" --repo android/skills
```

For `agent-skills` and `adverse`, record the upstream repository ref or release
source used for the packaged copy in the changelog.

## 5. Publish From Main

Push the validated repository state to `main`.

Run the `Create Release` GitHub workflow with:

```text
tag_name: <release-tag>
version: <release-version-without-leading-v>
upstream_alignment: android/skills, agent-skills, and adverse source refs verified for this release
```

The workflow validates release input, plugin manifest versions, and marketplace
shape, creates `codex-dev-forge-marketplace.zip`, targets `main`, creates the
GitHub Release, and then moves the `latest` Git ref to the released commit.
Generated release notes include upstream alignment, install commands, plugin
list, update behavior, and artifact contents.

## 6. Verify Install Channels

Verify latest-release install:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref latest
codex plugin marketplace upgrade codex-dev-forge
```

Then type `/plugins`, choose `Codex Dev Forge`, and verify the target plugin can
be installed or enabled.

Verify pinned install from the release tag:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref <release-tag>
codex plugin marketplace upgrade codex-dev-forge
```

Then type `/plugins`, choose `Codex Dev Forge`, and verify the target plugin can
be installed or enabled.

In Codex App, verify `/plugins` shows `Codex Dev Forge`, all six plugins are
installable, and a new thread can use the installed skills.

For the `adverse-review` plugin, verify the Codex App path before CLI fallback
behavior: install or enable `Adverse Review`, start a new thread, ask for an
adverse review of uncommitted changes, and confirm the skill stops to ask for
Codex subagent permission when the active runtime policy requires it. A yes
must use native Codex orchestration; a no must clearly report a degraded/manual
path. Only then validate the standalone CLI fallback.

When testing Codex App update behavior, use Git ref `latest`. The app's
marketplace update action refreshes the configured Git ref; a pinned release tag
does not auto-advance to newer releases.

## Current Runtime Validation Gap

Local CLI runtime validation is blocked on this machine because
`/opt/homebrew/bin/codex` fails before argument handling with a missing vendor
binary at
`/opt/homebrew/lib/node_modules/@openai/codex/node_modules/@openai/codex-darwin-arm64/vendor/aarch64-apple-darwin/codex/codex`.
Close this gap on a working Codex build before claiming end-to-end CLI
marketplace validation. Codex App validation should be treated separately and
should use the App Plugins UI plus a fresh thread after install or update.
