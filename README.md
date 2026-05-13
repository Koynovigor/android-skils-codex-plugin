# Codex Dev Forge

[![Latest Release](https://img.shields.io/github/v/release/Koynovigor/android-skils-codex-plugin?label=release)](https://github.com/Koynovigor/android-skils-codex-plugin/releases/latest)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](LICENSE.txt)
[![Create Release](https://github.com/Koynovigor/android-skils-codex-plugin/actions/workflows/create-release.yml/badge.svg)](https://github.com/Koynovigor/android-skils-codex-plugin/actions/workflows/create-release.yml)
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
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref latest
codex plugin marketplace upgrade codex-dev-forge
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
| Source          | `Koynovigor/android-skils-codex-plugin`                                                 |
| Git ref         | `latest` for the updateable release channel, or a release tag only for a pinned install |
| Selective paths | `.agents/plugins` and `plugins`                                                         |

Use `latest` when you expect the Codex App **Update** button to move the
marketplace to the newest release. A pinned release tag is reproducible but does
not advance when newer tags are published.

### Existing Android Skills Installs

The marketplace id changed from `android-skills-codex` to `codex-dev-forge`.
For Codex App, add or update this repository with Git ref `latest`, verify that
`Codex Dev Forge` shows all six plugins, install the plugins you need, and start
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
| `android-build-and-release` | AGP, Play Billing Library, R8, and Perfetto workflows.                                                                                                              |
| `android-ui-migration`      | Compose, Navigation, CameraX, and edge-to-edge migrations.                                                                                                          |
| `android-xr-glimmer`        | Android XR Glimmer guidance for Display AI Glasses.                                                                                                                 |

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
Migrate this project to AGP 9.
Upgrade Play Billing Library to the latest stable version.
Analyze this project's R8 keep rules.
Analyze this Perfetto trace with Perfetto SQL.
Add edge-to-edge support to this Compose app.
Migrate this XML layout to Jetpack Compose.
Migrate this app to Navigation 3.
Migrate this Camera1 implementation to CameraX.
Build an Android XR Glimmer UI for Display AI Glasses.
```

## Update Behavior

`latest` is a moving Git ref updated by the release workflow after each GitHub
Release. Use it when you want users to get the newest release with:

```bash
codex plugin marketplace upgrade codex-dev-forge
```

Release tags are pinned channels for reproducible installs. Pinned refs do not
auto-advance; change the Git ref to move to a newer release.

## Releases And Versioning

- The latest GitHub Release is available at
  [releases/latest](https://github.com/Koynovigor/android-skils-codex-plugin/releases/latest).
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
