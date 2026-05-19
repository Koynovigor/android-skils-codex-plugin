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
for skill_root in android-cli build camera device-ai devtools identity jetpack-compose navigation performance play profilers system testing xr; do
  test ! -e "$skill_root" || { echo "Legacy root path still exists: $skill_root"; exit 1; }
done
```

Confirm the packaged counts:

```bash
find plugins -name SKILL.md | wc -l
find plugins -path '*/references/*' -type f | wc -l
```

The current marketplace contains 17 packaged skills and 148 packaged reference
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
- Preserve Apache-2.0 licensing and existing skill metadata.
- Do not add `.app.json`, `.mcp.json`, hooks, external authentication, or product
  gating unless the plan explicitly adds that scope.

The release workflow uses GitHub-provided context instead of hard-coded
repository or version text:

- `${{ github.repository }}` / `$GITHUB_REPOSITORY` for the install source in
  generated release notes.
- `${{ inputs.tag_name }}` for the pinned release Git ref.
- `${{ inputs.version }}` for plugin manifest version validation and release
  notes.

## 4. Verify Upstream Alignment

Verify whether upstream `android/skills` has the same release tag:

```bash
gh release view "$RELEASE_TAG" --repo android/skills
```

If upstream `android/skills` does not have that tag at release time, stop and
decide whether this repository should keep the planned tag by project decision
or align to the actual upstream release.

## 5. Publish From Main

Push the validated repository state to `main`.

Run the `Create Release` GitHub workflow with:

```text
tag_name: <release-tag>
version: <release-version-without-leading-v>
upstream_alignment: android/skills <release-tag> verified before this release
```

The workflow validates release input, plugin manifest versions, and marketplace
shape, creates `android-skills-codex-marketplace.zip`, targets `main`, creates
the GitHub Release, and then moves the `latest` Git ref to the released commit.
Generated release notes include the upstream alignment result, install commands,
plugin list, update behavior, and artifact contents.

## 6. Verify Install Channels

Verify latest-release install:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref latest
codex plugin marketplace upgrade android-skills-codex
```

Then type `/plugins`, choose `Android Skills for Codex`, and verify the target
plugin can be installed or enabled.

Verify pinned install from the release tag:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref <release-tag>
codex plugin marketplace upgrade android-skills-codex
```

Then type `/plugins`, choose `Android Skills for Codex`, and verify the target
plugin can be installed or enabled.

In Codex App, verify `/plugins` shows `Android Skills for Codex`, all five
plugins are installable, and a new thread can use the installed skills.

## Current Runtime Validation Gap

Local runtime validation is blocked on this machine because
`/opt/homebrew/bin/codex` reports `codex-cli 0.106.0` and rejects
`codex plugin marketplace --help` with `unexpected argument 'marketplace' found`.
Close this gap on a Codex build that exposes plugin marketplace commands before
claiming end-to-end runtime install validation.
