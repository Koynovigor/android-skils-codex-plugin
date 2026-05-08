# Release Process

Use this checklist to cut a Codex marketplace release from this repository.

## 1. Refresh Skills

When refreshing upstream Android Skills, extract them into a temporary directory
outside the final release layout.

```bash
SOURCE_ROOT=/tmp/android-skills-upstream scripts/sync-codex-plugins.sh
```

Do not rely on legacy root skill directories during release. They are migration
inputs only and must be absent before the public release is cut.

## 2. Validate Package Shape

Run the plugin validator:

```bash
scripts/validate-codex-plugins.sh
```

Confirm the legacy root layout is absent:

```bash
for path in android-cli build camera jetpack-compose navigation performance play system xr; do
  test ! -e "$path" || { echo "Legacy root path still exists: $path"; exit 1; }
done
```

Confirm the packaged counts:

```bash
find plugins -name SKILL.md | wc -l
find plugins -path '*/references/*' -type f | wc -l
```

Expected values for `v0.0.4` are 9 packaged skills and 80 packaged reference
files.

## 3. Update Versions And Notes

Before release:

- Update all plugin manifest versions in `plugins/*/.codex-plugin/plugin.json`.
- Keep all four plugin manifest versions equal to `0.0.4` for the first public
  release.
- Update `CHANGELOG.md` with changed plugins, bundled skills, and upgrade
  guidance for the release.
- Update the README release/version notes or the generated GitHub Release notes.
- Preserve Apache-2.0 licensing and existing skill metadata.
- Do not add `.app.json`, `.mcp.json`, hooks, external authentication, or product
  gating unless the plan explicitly adds that scope.

## 4. Verify Upstream Alignment

The first public release must stay aligned with the requested upstream
`android/skills` release version, `v0.0.4`.

```bash
gh release view v0.0.4 --repo android/skills
```

If upstream `android/skills` does not have `v0.0.4` at release time, stop and
decide whether this repository should keep `v0.0.4` by project decision or align
to the actual upstream release.

## 5. Publish From Main

Push the validated repository state to `main`.

Run the `Create Release` GitHub workflow with:

```text
tag_name: v0.0.4
version: 0.0.4
upstream_alignment: android/skills v0.0.4 verified before this release
```

The workflow validates release input, plugin manifest versions, and marketplace
shape, creates
`android-skills-codex-marketplace.zip`, targets `main`, and writes release notes
with the upstream alignment result, install commands, plugin list, update
behavior, and artifact contents.

## 6. Verify Install Channels

Verify pinned install from the tag:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref v0.0.4
codex plugin marketplace upgrade android-skills-codex
```

Then type `/plugins`, choose `Android Skills for Codex`, and verify the target
plugin can be installed or enabled.

Verify rolling-channel install from `main`:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref main
codex plugin marketplace upgrade android-skills-codex
```

Then type `/plugins`, choose `Android Skills for Codex`, and verify the target
plugin can be installed or enabled.

In Codex App, verify `/plugins` shows `Android Skills for Codex`, all four
plugins are installable, and a new thread can use the installed skills.

## Current Runtime Validation Gap

Local runtime validation is blocked on this machine because
`/opt/homebrew/bin/codex` reports `codex-cli 0.106.0` and rejects
`codex plugin marketplace --help` with `unexpected argument 'marketplace' found`.
Close this gap on a Codex build that exposes plugin marketplace commands before
claiming end-to-end runtime install validation.
