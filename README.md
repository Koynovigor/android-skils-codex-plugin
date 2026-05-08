# Android Skills for Codex

[![Latest Release](https://img.shields.io/badge/release-v0.0.4-blue)](https://github.com/Koynovigor/android-skils-codex-plugin/releases/tag/v0.0.4)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](LICENSE.txt)
[![Create Release](https://github.com/Koynovigor/android-skils-codex-plugin/actions/workflows/create-release.yml/badge.svg)](https://github.com/Koynovigor/android-skils-codex-plugin/actions/workflows/create-release.yml)
[![Codex Marketplace](https://img.shields.io/badge/Codex-marketplace-10A37F)](.agents/plugins/marketplace.json)

This repository packages Android Skills as a GitHub-backed marketplace for Codex
App and Codex CLI. It exposes one marketplace, `android-skills-codex`, with four
installable Codex plugins.

The first public release is `v0.0.4`. It is a skills-only distribution: no apps,
MCP servers, hooks, external authentication, logos, or product gating are included.

> [!IMPORTANT]
> This repository is not the official OpenAI Plugin Directory and does not claim
> publication, endorsement, or sponsorship by Google or OpenAI.

## Contents

- [Quick Install](#quick-install)
- [Codex App](#codex-app)
- [Plugin Catalog](#plugin-catalog)
- [Update Behavior](#update-behavior)
- [Local Development](#local-development)
- [Releases And Versioning](#releases-and-versioning)
- [Changelog](CHANGELOG.md)
- [Links](#links)
- [License And Attribution](#license-and-attribution)

## Quick Install

Install from `main` to track the rolling stable channel:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref main
codex plugin marketplace upgrade android-skills-codex
```

Install the first pinned release:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref v0.0.4
```

Update an existing marketplace checkout:

```bash
codex plugin marketplace upgrade android-skills-codex
```

Then open the plugin browser in Codex CLI:

```text
/plugins
```

Choose `Android Skills for Codex`, install or enable the plugin you need, and
start a new thread before using that plugin's skills.

> [!NOTE]
> After installing or updating a plugin, restart Codex when needed, install the
> plugin you want to use, and start a new thread so the enabled skills are loaded.

## Codex App

Open Plugins, add a marketplace, and enter:

| Field           | Value                                                |
|-----------------|------------------------------------------------------|
| Source          | `Koynovigor/android-skils-codex-plugin`              |
| Git ref         | `main` for updates, or `v0.0.4` for a pinned install |
| Selective paths | `.agents/plugins` and `plugins`                      |

Then choose `Android Skills for Codex`, install the plugin you need, and start a
new thread before using that plugin's skills.

## Plugin Catalog

| Plugin                      | Version | Bundled skills                                                                               |
|-----------------------------|--------:|----------------------------------------------------------------------------------------------|
| `android-cli-tools`         | `0.0.4` | `android-cli-base`                                                                           |
| `android-build-and-release` | `0.0.4` | `agp-9-upgrade`, `play-billing-library-version-upgrade`, `r8-analyzer`                       |
| `android-ui-migration`      | `0.0.4` | `camera1-to-camerax`, `edge-to-edge`, `migrate-xml-views-to-jetpack-compose`, `navigation-3` |
| `android-xr-glimmer`        | `0.0.4` | `display-ai-glasses-with-jetpack-compose-glimmer`                                            |

| Skill                                             | Plugin                      | Purpose                                                                                                                                                    |
|---------------------------------------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `android-cli-base`                                | `android-cli-tools`         | Android CLI workflows for project creation, SDK and emulator management, device interaction, screenshots, layout inspection, docs lookup, and diagnostics. |
| `agp-9-upgrade`                                   | `android-build-and-release` | Android Gradle Plugin 9 migration guidance.                                                                                                                |
| `play-billing-library-version-upgrade`            | `android-build-and-release` | Google Play Billing Library migration guidance.                                                                                                            |
| `r8-analyzer`                                     | `android-build-and-release` | R8 and ProGuard keep-rule analysis.                                                                                                                        |
| `camera1-to-camerax`                              | `android-ui-migration`      | Camera1 or raw Camera2 migration to CameraX.                                                                                                               |
| `edge-to-edge`                                    | `android-ui-migration`      | Edge-to-edge Compose insets and system UI migration.                                                                                                       |
| `migrate-xml-views-to-jetpack-compose`            | `android-ui-migration`      | XML View to Jetpack Compose migration workflow.                                                                                                            |
| `navigation-3`                                    | `android-ui-migration`      | Navigation 3 migration and recipes.                                                                                                                        |
| `display-ai-glasses-with-jetpack-compose-glimmer` | `android-xr-glimmer`        | Android XR Display AI Glasses UI with Jetpack Compose Glimmer.                                                                                             |

## Update Behavior

`main` is the rolling stable channel. Release tags such as `v0.0.4` are pinned
channels for reproducible installs.

Pinned refs do not auto-advance. To move from a pinned tag to a newer release,
change the Git ref in Codex App or add the marketplace again with a newer `--ref`.

<details>
<summary>Troubleshooting</summary>

- If the marketplace appears empty, include both `.agents/plugins` and `plugins`
  in selective paths.
- If plugin changes are not visible, restart Codex and start a new thread.
- If you installed from a pinned ref such as `v0.0.4`, updates do not move that
  install to a newer tag automatically.
- Local marketplace installs use the Codex plugin cache; run
  `codex plugin marketplace upgrade android-skills-codex` after local changes.
- No external authentication is required in `v0.0.4`.

</details>

<details>
<summary>Advanced Sparse / Selective Paths</summary>

Use the broad path set for normal installs:

```text
.agents/plugins
plugins
```

Use the narrower path set when the UI or CLI asks for explicit plugin subpaths:

```text
.agents/plugins
plugins/android-cli-tools
plugins/android-build-and-release
plugins/android-ui-migration
plugins/android-xr-glimmer
```

CLI sparse checkout example:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref main --sparse .agents/plugins --sparse plugins
```

</details>

## Local Development

Install this checkout as a local marketplace while developing:

```bash
codex plugin marketplace add /Users/igor/AndroidStudioProjects/android-skils-codex-plugin
codex plugin marketplace upgrade android-skills-codex
```

Local runtime validation is currently blocked on this machine because the installed
`codex-cli 0.106.0` does not expose `codex plugin marketplace`.

The release source of truth is the Codex marketplace layout under
`.agents/plugins/` and `plugins/`. Legacy Android Skills root directories such
as `android-cli/`, `build/`, and `xr/` are not part of the final repository
layout.

## Releases And Versioning

- First public release: `v0.0.4`.
- Plugin manifest versions: `0.0.4`.
- Git tags are stable pinned channels.
- `main` is the rolling stable channel.
- Release artifacts include `.agents/plugins/`, `plugins/`, `scripts/`,
  `README.md`, `CHANGELOG.md`, `LICENSE.txt`, and
  `docs/codex-marketplace-install.md`.
- See [CHANGELOG.md](CHANGELOG.md) for changed plugins, bundled skills, and
  upgrade guidance per release.

## Links

- [Releases](https://github.com/Koynovigor/android-skils-codex-plugin/releases)
- [Issues](https://github.com/Koynovigor/android-skils-codex-plugin/issues)
- [License](LICENSE.txt)
- [OpenAI Codex plugin docs](https://developers.openai.com/codex/plugins/build)
- [Upstream android/skills](https://github.com/android/skills)
- [Install guide](docs/codex-marketplace-install.md)
- [Release process](docs/release-process.md)

## License And Attribution

This repository is licensed under [Apache-2.0](LICENSE.txt). Android skill content
retains its existing Google LLC metadata and licensing references. This packaging
does not include Google logos, Android robot assets, OpenAI logos, or official
publication claims.
