# Codex Dev Forge

[![Latest Release](https://img.shields.io/github/v/release/Koynovigor/codex-dev-forge?label=release)](https://github.com/Koynovigor/codex-dev-forge/releases/latest)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](LICENSE.txt)
[![Create Release](https://github.com/Koynovigor/codex-dev-forge/actions/workflows/create-release.yml/badge.svg)](https://github.com/Koynovigor/codex-dev-forge/actions/workflows/create-release.yml)
[![Codex Marketplace](https://img.shields.io/badge/Codex-marketplace-10A37F)](.agents/plugins/marketplace.json)

This repository packages a GitHub-backed Codex marketplace named
`codex-dev-forge`. It includes Android-focused Codex plugins plus general
software-development plugins, `agent-skills` and `adverse-review`.

Current releases are skills-only distributions: no apps, MCP servers, active
Codex hooks, external authentication, logos, or product gating are included.

> [!IMPORTANT]
> This repository is not the official OpenAI Plugin Directory and does not claim
> publication, endorsement, or sponsorship by Google, OpenAI, or upstream skill
> authors.

## Codex CLI

Recommended install: track the latest GitHub release through the moving
`latest` Git ref.

```bash
codex plugin marketplace add Koynovigor/codex-dev-forge --ref latest
codex plugin marketplace upgrade codex-dev-forge
```

Pinned install: copy a release tag from
[Releases](https://github.com/Koynovigor/codex-dev-forge/releases)
and use it as the Git ref.

```bash
codex plugin marketplace add Koynovigor/codex-dev-forge --ref <release-tag>
```

If you use sparse checkout, include both marketplace metadata and plugin
payload:

```bash
codex plugin marketplace add Koynovigor/codex-dev-forge --ref latest --sparse .agents/plugins --sparse plugins
```

Then open the plugin browser in Codex CLI:

```text
/plugins
```

Choose `Codex Dev Forge`, install or enable the plugin you need, and start a
new thread before using that plugin's skills.

## Codex App

Open Plugins, add a marketplace, and enter these fields:

| Field           | Value                                                                                   |
|-----------------|-----------------------------------------------------------------------------------------|
| Source          | `Koynovigor/codex-dev-forge`                                                            |
| Git ref         | `latest` for the updateable release channel, or a release tag only for a pinned install |
| Selective paths | `.agents/plugins` and `plugins`                                                         |

Use `latest` when you expect the Codex App **Update** button to move the
marketplace to the newest release. A pinned release tag is reproducible but does
not advance when newer tags are published.

### Existing Android Skills Installs

The marketplace id changed from `android-skills-codex` to `codex-dev-forge`.
For Codex App, add or update this repository with Git ref `latest`, verify that
`Codex Dev Forge` shows all seven plugins, install the plugins you need, and start
a new thread. If the old `Android Skills for Codex` marketplace entry is still
visible, remove or disable it from the Plugins UI after confirming the new
marketplace works.

For Codex CLI, run the new marketplace add or upgrade command shown above. If an
older `android-skills-codex` entry remains visible in `/plugins`, remove or
disable it there after `codex-dev-forge` is installed.

## Plugin Catalog

| Plugin                      | Purpose                                                                                                                                                             |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `agent-skills`              | General engineering workflows for specs, planning, implementation, tests, review, hardening, performance, docs, Git, CI/CD, migrations, and launch.                 |
| `adverse-review`            | Adversarial multi-perspective code review for non-trivial PRs, release gates, security-sensitive changes, and critical-vulnerability checks; CLI use is a fallback. |
| `android-cli-tools`         | Android CLI workflows for Codex.                                                                                                                                    |
| `android-app-capabilities`  | AppFunctions, verified email, and Play Engage SDK integration workflows.                                                                                            |
| `android-build-and-release` | AGP, Android testing, Play Billing Library, R8, and Perfetto workflows.                                                                                             |
| `android-ui-migration`      | Compose adaptive UI, Compose Styles, Navigation, CameraX, and edge-to-edge workflows.                                                                               |
| `android-xr-glimmer`        | Android XR Glimmer guidance for display glasses.                                                                                                                    |

| Android skill                                  | Plugin                      | Purpose                                                                                                                                                    |
|------------------------------------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `android-cli-base`                             | `android-cli-tools`         | Android CLI workflows for project creation, SDK and emulator management, device interaction, screenshots, layout inspection, docs lookup, and diagnostics. |
| `appfunctions`                                 | `android-app-capabilities`  | Android AppFunctions discovery, implementation, and KDoc refinement for on-device agents and system shortcuts.                                             |
| `engage-sdk-integration`                       | `android-app-capabilities`  | Play Engage SDK integration, publishing code generation, entity mapping, and SDK issue resolution.                                                         |
| `verified-email`                               | `android-app-capabilities`  | Verified email retrieval with Credential Manager and Digital Credentials.                                                                                  |
| `agp-9-upgrade`                                | `android-build-and-release` | Android Gradle Plugin 9 migration guidance.                                                                                                                |
| `play-billing-library-version-upgrade`         | `android-build-and-release` | Google Play Billing Library migration guidance.                                                                                                            |
| `perfetto-sql`                                 | `android-build-and-release` | Perfetto SQL query guidance for Android trace analysis with `trace_processor`.                                                                              |
| `perfetto-trace-analysis`                      | `android-build-and-release` | Perfetto trace analysis for latency, memory, and jank investigations.                                                                                      |
| `r8-analyzer`                                  | `android-build-and-release` | R8 and ProGuard keep-rule analysis.                                                                                                                        |
| `testing-setup`                                | `android-build-and-release` | Android unit, UI, screenshot, and end-to-end test infrastructure setup.                                                                                    |
| `adaptive`                                     | `android-ui-migration`      | Adaptive Compose UI for phones, tablets, foldables, desktop, TV, Auto, and XR.                                                                             |
| `camera1-to-camerax`                           | `android-ui-migration`      | Camera1 or raw Camera2 migration to CameraX.                                                                                                               |
| `edge-to-edge`                                 | `android-ui-migration`      | Edge-to-edge Compose insets and system UI migration.                                                                                                       |
| `migrate-xml-views-to-jetpack-compose`         | `android-ui-migration`      | XML View to Jetpack Compose migration workflow.                                                                                                            |
| `navigation-3`                                 | `android-ui-migration`      | Navigation 3 migration and recipes.                                                                                                                        |
| `styles`                                       | `android-ui-migration`      | Experimental Compose Styles API integration for styleable design system components.                                                                        |
| `display-glasses-with-jetpack-compose-glimmer` | `android-xr-glimmer`        | Android XR display glasses UI with Jetpack Compose Glimmer.                                                                                                |

## Trigger Test Prompts

Use these prompts after installing the matching plugin and starting a new thread:

```text
Use Agent Skills to turn this idea into a spec.
Break this spec into implementation tasks.
Build this feature incrementally with tests.
Review this change across code quality, tests, and security.
Prepare this project for launch.
Run an adverse review of my uncommitted changes.
Run a critical-vulnerability adverse review before release.
Use Android CLI to inspect this project.
Expose this Android workflow with AppFunctions.
Implement verified email with Credential Manager.
Integrate Play Engage SDK for this app.
Migrate this project to AGP 9.
Upgrade Play Billing Library to the latest stable version.
Analyze this project's R8 keep rules.
Analyze this Perfetto trace with Perfetto SQL.
Analyze this Perfetto trace for jank.
Set up Android testing for this app.
Make this Compose UI adaptive.
Integrate the Compose Styles API.
Add edge-to-edge support to this Compose app.
Migrate this XML layout to Jetpack Compose.
Migrate this app to Navigation 3.
Migrate this Camera1 implementation to CameraX.
Build an Android XR Glimmer UI for display glasses.
```

## Update Behavior

`latest` is a moving Git ref updated by the release workflow after each GitHub
Release. Use it when you want users to get the newest release with:

```bash
codex plugin marketplace upgrade codex-dev-forge
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
  `codex plugin marketplace upgrade codex-dev-forge` after local changes.
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
plugins/agent-skills
plugins/adverse-review
plugins/android-cli-tools
plugins/android-app-capabilities
plugins/android-build-and-release
plugins/android-ui-migration
plugins/android-xr-glimmer
```

CLI sparse checkout example:

```bash
codex plugin marketplace add Koynovigor/codex-dev-forge --ref latest --sparse .agents/plugins --sparse plugins
```

</details>

## Local Development

Install this checkout as a local marketplace while developing:

```bash
codex plugin marketplace add /path/to/local/codex-dev-forge-checkout
codex plugin marketplace upgrade codex-dev-forge
```

Local runtime validation is currently blocked on this machine because the installed
`codex-cli 0.106.0` does not expose `codex plugin marketplace`.

The release source of truth is the Codex marketplace layout under
`.agents/plugins/` and `plugins/`. Legacy Android Skills root directories such
as `android-cli/`, `build/`, and `xr/` are not part of the final repository
layout.

## Releases And Versioning

- The latest GitHub Release is available at
  [releases/latest](https://github.com/Koynovigor/codex-dev-forge/releases/latest).
- Plugin manifest versions are validated against the release workflow `version`
  input.
- Release artifacts include `.agents/plugins/`, `plugins/`, `scripts/`,
  `README.md`, `CHANGELOG.md`, `LICENSE.txt`, and `docs/`.
- See [CHANGELOG.md](CHANGELOG.md) for changed plugins, bundled skills, and
  upgrade guidance per release.

## Links

- [OpenAI Codex plugin docs](https://developers.openai.com/codex/plugins/build)
- [OpenAI Codex skills docs](https://developers.openai.com/codex/skills)
- [Upstream Android Skills](https://github.com/android/skills)
- [Upstream Agent Skills](https://github.com/addyosmani/agent-skills)
- [Upstream Adverse](https://github.com/addyosmani/adverse)
- [Install guide](docs/codex-marketplace-install.md)
- [Release process](docs/release-process.md)

## License And Attribution

This repository is licensed under [Apache-2.0](LICENSE.txt). Android skill
content retains its existing Google LLC metadata and licensing references.
Bundled `agent-skills` content is MIT licensed; see
[plugins/agent-skills/LICENSE](plugins/agent-skills/LICENSE). Bundled
`adverse-review` content is MIT licensed; see
[plugins/adverse-review/LICENSE](plugins/adverse-review/LICENSE). This
packaging does not include Google logos, Android robot assets, OpenAI logos, or
official publication claims.
