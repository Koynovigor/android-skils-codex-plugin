# Codex Marketplace Install

This guide shows how to install `android-skills-codex`, a GitHub-backed Codex
marketplace that exposes four Android Skills plugins for Codex App and Codex CLI.

Current releases are skills-only marketplace distributions. They do not require
external authentication and do not claim Google or OpenAI
publication, endorsement, or sponsorship.

## CLI Install

Use `latest` as the stable release update channel:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref latest
codex plugin marketplace upgrade android-skills-codex
```

Use a release tag from
[Releases](https://github.com/Koynovigor/android-skils-codex-plugin/releases)
for reproducible pinned installs:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref <release-tag>
```

If using sparse checkout from the CLI, include both marketplace metadata and
plugin payload:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref latest --sparse .agents/plugins --sparse plugins
```

After adding or upgrading the marketplace, open the Codex CLI plugin browser:

```text
/plugins
```

Choose `Android Skills for Codex`, install or enable the plugin you need, and
start a new thread before using that plugin's skills.

## Codex App UI

Open Plugins, add a marketplace, and enter:

| Field           | Value                                                                           |
|-----------------|---------------------------------------------------------------------------------|
| Source          | `Koynovigor/android-skils-codex-plugin`                                         |
| Git ref         | `latest` for the release update channel, or a release tag for a pinned install  |
| Selective paths | `.agents/plugins` and `plugins`                                                 |

For a narrower selective checkout, include the marketplace metadata and each
plugin directory:

```text
.agents/plugins
plugins/android-cli-tools
plugins/android-build-and-release
plugins/android-ui-migration
plugins/android-xr-glimmer
```

After adding the marketplace:

1. Restart Codex after local marketplace or plugin file changes.
2. Open `/plugins`.
3. Choose `Android Skills for Codex`.
4. Verify that all four plugins are visible.
5. Install each plugin one at a time.
6. Start a new thread after installing a plugin so the enabled skills are loaded.

## Local Development Install

Use the local repository checkout while developing marketplace or plugin changes:

```bash
codex plugin marketplace add /Users/igor/AndroidStudioProjects/android-skils-codex-plugin
codex plugin marketplace upgrade android-skills-codex
```

After local plugin changes, restart Codex when needed so the installed plugin
cache and newly enabled skills are refreshed.

## Update Behavior

CLI installs update with:

```bash
codex plugin marketplace upgrade android-skills-codex
```

In the Codex App UI, change the Git ref to move between `latest` and a pinned
release tag. Pinned refs do not auto-advance.

## Plugins

| Plugin                      | Purpose                                                    |
|-----------------------------|------------------------------------------------------------|
| `android-cli-tools`         | Android CLI workflows for Codex.                           |
| `android-build-and-release` | AGP, Play Billing Library, and R8 workflows.               |
| `android-ui-migration`      | Compose, Navigation, CameraX, and edge-to-edge migrations. |
| `android-xr-glimmer`        | Android XR Glimmer guidance for Display AI Glasses.        |

## Trigger Test Prompts

Use these prompts after installing the matching plugin and starting a new thread:

```text
Use Android CLI to inspect this project.
Migrate this project to AGP 9.
Upgrade Play Billing Library to the latest stable version.
Analyze this project's R8 keep rules.
Add edge-to-edge support to this Compose app.
Migrate this XML layout to Jetpack Compose.
Migrate this app to Navigation 3.
Migrate this Camera1 implementation to CameraX.
Build an Android XR Glimmer UI for Display AI Glasses.
```

## Troubleshooting

- If the marketplace appears empty, include both `.agents/plugins` and `plugins`
  in selective paths.
- If plugin changes are not visible, restart Codex and start a new thread.
- If a pinned ref does not update, change the Git ref or install from a newer
  tag.
- If installed marketplace files are stale, run
  `codex plugin marketplace upgrade android-skills-codex`.
- Install a plugin, then start a new thread before using that plugin's skills.
- No external authentication is required for the current skills-only release.

## Release Artifact

GitHub releases attach `android-skills-codex-marketplace.zip`. The artifact
contains only marketplace-relevant files:

- `.agents/plugins/`
- `plugins/`
- `scripts/`
- `README.md`
- `CHANGELOG.md`
- `LICENSE.txt`
- `docs/`

## Repository Layout Note

This repository is a Codex marketplace repository, not a duplicated Android
Skills mirror. Codex distribution files live in `.agents/plugins/`, `plugins/`,
`scripts/`, and `docs/`. Legacy root skill directories such as `android-cli/`,
`build/`, and `xr/` are not install paths and must stay absent from the release
layout.
