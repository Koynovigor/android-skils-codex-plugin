# Android Skills for Codex

[![Latest Release](https://img.shields.io/github/v/release/Koynovigor/android-skils-codex-plugin?label=release)](https://github.com/Koynovigor/android-skils-codex-plugin/releases/latest)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](LICENSE.txt)
[![Create Release](https://github.com/Koynovigor/android-skils-codex-plugin/actions/workflows/create-release.yml/badge.svg)](https://github.com/Koynovigor/android-skils-codex-plugin/actions/workflows/create-release.yml)
[![Codex Marketplace](https://img.shields.io/badge/Codex-marketplace-10A37F)](.agents/plugins/marketplace.json)

This repository packages Android Skills as a GitHub-backed marketplace for Codex
App and Codex CLI. It exposes one marketplace, `android-skills-codex`, with four
installable Codex plugins.

Current releases are skills-only distributions: no apps, MCP servers, hooks,
external authentication, logos, or product gating are included.

> [!IMPORTANT]
> This repository is not the official OpenAI Plugin Directory and does not claim
> publication, endorsement, or sponsorship by Google or OpenAI.

## Contents

- [Codex CLI](#codex-cli)
- [Codex App](#codex-app)
- [Plugin Catalog](#plugin-catalog)
- [Update Behavior](#update-behavior)
- [Local Development](#local-development)
- [Releases And Versioning](#releases-and-versioning)
- [Changelog](CHANGELOG.md)
- [Links](#links)
- [License And Attribution](#license-and-attribution)

## Codex CLI

Recommended install: track the latest GitHub release through the moving
`latest` Git ref.

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref latest
codex plugin marketplace upgrade android-skills-codex
```

Pinned install: copy a release tag from
[Releases](https://github.com/Koynovigor/android-skils-codex-plugin/releases)
and use it as the Git ref.

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref <release-tag>
```

If you use sparse checkout, include both marketplace metadata and plugin
payload:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref latest --sparse .agents/plugins --sparse plugins
```

Update an existing CLI marketplace checkout:

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

Open Plugins, add a marketplace, and enter these fields:

| Field           | Value                                                       |
|-----------------|-------------------------------------------------------------|
| Source          | `Koynovigor/android-skils-codex-plugin`                     |
| Git ref         | `latest` for updates, or a release tag for a pinned install |
| Selective paths | `.agents/plugins` and `plugins`                             |

Do not paste a GitHub release URL into `Source`. Use the repository shorthand
above, then put the release tag or `latest` in `Git ref`.

Then choose `Android Skills for Codex`, install the plugin you need, and start a
new thread before using that plugin's skills.

## Plugin Catalog

| Plugin                      | Bundled skills                                                                               |
|-----------------------------|----------------------------------------------------------------------------------------------|
| `android-cli-tools`         | `android-cli-base`                                                                           |
| `android-build-and-release` | `agp-9-upgrade`, `play-billing-library-version-upgrade`, `perfetto-sql`, `r8-analyzer`       |
| `android-ui-migration`      | `camera1-to-camerax`, `edge-to-edge`, `migrate-xml-views-to-jetpack-compose`, `navigation-3` |
| `android-xr-glimmer`        | `display-ai-glasses-with-jetpack-compose-glimmer`                                            |

| Skill                                             | Plugin                      | Purpose                                                                                                                                                    |
|---------------------------------------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `android-cli-base`                                | `android-cli-tools`         | Android CLI workflows for project creation, SDK and emulator management, device interaction, screenshots, layout inspection, docs lookup, and diagnostics. |
| `agp-9-upgrade`                                   | `android-build-and-release` | Android Gradle Plugin 9 migration guidance.                                                                                                                |
| `play-billing-library-version-upgrade`            | `android-build-and-release` | Google Play Billing Library migration guidance.                                                                                                            |
| `perfetto-sql`                                    | `android-build-and-release` | Perfetto SQL query guidance for Android trace analysis with `trace_processor`.                                                                              |
| `r8-analyzer`                                     | `android-build-and-release` | R8 and ProGuard keep-rule analysis.                                                                                                                        |
| `camera1-to-camerax`                              | `android-ui-migration`      | Camera1 or raw Camera2 migration to CameraX.                                                                                                               |
| `edge-to-edge`                                    | `android-ui-migration`      | Edge-to-edge Compose insets and system UI migration.                                                                                                       |
| `migrate-xml-views-to-jetpack-compose`            | `android-ui-migration`      | XML View to Jetpack Compose migration workflow.                                                                                                            |
| `navigation-3`                                    | `android-ui-migration`      | Navigation 3 migration and recipes.                                                                                                                        |
| `display-ai-glasses-with-jetpack-compose-glimmer` | `android-xr-glimmer`        | Android XR Display AI Glasses UI with Jetpack Compose Glimmer.                                                                                             |

## Update Behavior

`latest` is a moving Git ref updated by the release workflow after each GitHub
Release. Use it when you want users to get the newest release with:

```bash
codex plugin marketplace upgrade android-skills-codex
```

Release tags are pinned channels for reproducible installs.

Pinned refs do not auto-advance. To move from a pinned tag to a newer release,
change the Git ref in Codex App or add the marketplace again with a newer `--ref`.

<details>
<summary>Troubleshooting</summary>

- If the marketplace appears empty, include both `.agents/plugins` and `plugins`
  in selective paths.
- If plugin changes are not visible, restart Codex and start a new thread.
- If you installed from a pinned release tag, updates do not move that install
  to a newer tag automatically.
- Local marketplace installs use the Codex plugin cache; run
  `codex plugin marketplace upgrade android-skills-codex` after local changes.
- No external authentication is required for the current skills-only release.

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
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref latest --sparse .agents/plugins --sparse plugins
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

- The latest GitHub Release is available at
  [releases/latest](https://github.com/Koynovigor/android-skils-codex-plugin/releases/latest).
- Plugin manifest versions are validated against the release workflow `version`
  input.
- Git tags are stable pinned channels.
- `latest` is the moving stable release ref for normal installs.
- `main` is the development branch used by the release workflow.
- Release artifacts include `.agents/plugins/`, `plugins/`, `scripts/`,
  `README.md`, `CHANGELOG.md`, `LICENSE.txt`, and `docs/`.
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
