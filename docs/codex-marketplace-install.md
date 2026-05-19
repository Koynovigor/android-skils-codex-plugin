# Codex Marketplace Install

This guide shows how to install `codex-dev-forge`, a GitHub-backed Codex
marketplace that exposes Android plugins and general development workflow
plugins for Codex App and Codex CLI.

Current releases are skills-only marketplace distributions. They do not require
external authentication and do not claim Google, OpenAI, or upstream author
publication, endorsement, or sponsorship.

## Codex CLI Install

Recommended install: use `latest` as the stable release update channel. The
repository release workflow moves this Git ref to the latest release commit.

```bash
codex plugin marketplace add Koynovigor/codex-dev-forge --ref latest
codex plugin marketplace upgrade codex-dev-forge
```

Pinned install: open
[Releases](https://github.com/Koynovigor/codex-dev-forge/releases),
copy the release tag, and use that tag as the Git ref:

```bash
codex plugin marketplace add Koynovigor/codex-dev-forge --ref <release-tag>
```

If using sparse checkout from the CLI, include both marketplace metadata and
plugin payload:

```bash
codex plugin marketplace add Koynovigor/codex-dev-forge --ref latest --sparse .agents/plugins --sparse plugins
```

After adding or upgrading the marketplace, open the Codex CLI plugin browser:

```text
/plugins
```

Choose `Codex Dev Forge`, install or enable the plugin you need, and start a
new thread before using that plugin's skills.

## Codex App Install

Open Plugins, choose add marketplace, and enter:

| Field           | Value                                                                                   |
|-----------------|-----------------------------------------------------------------------------------------|
| Source          | `Koynovigor/codex-dev-forge`                                                            |
| Git ref         | `latest` for the updateable release channel, or a release tag only for a pinned install |
| Selective paths | `.agents/plugins` and `plugins`                                                         |

Do not paste a GitHub release URL into `Source`. The source is the repository
shorthand above. The release selection belongs in `Git ref`.

For a narrower selective checkout, include the marketplace metadata and each
plugin directory:

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

After adding the marketplace:

1. Choose `Codex Dev Forge`.
2. Verify that all seven plugins are visible.
3. Install each plugin you need.
4. Start a new thread after installing a plugin so the enabled skills are loaded.
5. Restart Codex if marketplace or plugin changes are not visible.

### Existing Android Skills Installs

The old marketplace id was `android-skills-codex`. The current marketplace id
is `codex-dev-forge`, so existing Codex App users should add or update this
repository with Git ref `latest`, verify that `Codex Dev Forge` shows all seven
plugins, and install the needed plugins from the new marketplace. After that,
remove or disable the old `Android Skills for Codex` entry from the Plugins UI
if it is still listed.

For CLI users, run:

```bash
codex plugin marketplace add Koynovigor/codex-dev-forge --ref latest
codex plugin marketplace upgrade codex-dev-forge
```

Then open `/plugins`, verify `Codex Dev Forge`, and remove or disable any stale
`android-skills-codex` entry if your installed Codex build still shows it.

## Local Development Install

Use the local repository checkout while developing marketplace or plugin changes:

```bash
codex plugin marketplace add <path-to-local-codex-dev-forge-checkout>
codex plugin marketplace upgrade codex-dev-forge
```

After local plugin changes, restart Codex when needed so the installed plugin
cache and newly enabled skills are refreshed.

## Plugins

| Plugin | Purpose |
|--------|---------|
| `agent-skills` | General engineering workflows for specs, plans, implementation, tests, review, hardening, performance, docs, Git, CI/CD, migrations, and launch. |
| `adverse-review` | Adversarial multi-perspective code review for non-trivial PRs, release gates, security-sensitive changes, and critical-vulnerability checks; CLI use is a fallback. |
| `android-cli-tools` | Android CLI workflows for Codex. |
| `android-app-capabilities` | AppFunctions, verified email, and Play Engage SDK integration workflows. |
| `android-build-and-release` | AGP, Android testing, Play Billing Library, R8, and Perfetto workflows. |
| `android-ui-migration` | Compose adaptive UI, Compose Styles, Navigation, CameraX, and edge-to-edge workflows. |
| `android-xr-glimmer` | Android XR Glimmer guidance for display glasses. |

## Trigger Test Prompts

Use these prompts after installing the matching plugin and starting a new thread:

```text
Use Agent Skills to turn this idea into a spec.
Break this spec into implementation tasks.
Build this feature incrementally with tests.
Debug this failing test systematically.
Review this change across code quality, tests, and security.
Prepare this project for launch.
Run an adverse review of my uncommitted changes.
Review this branch against main from correctness, security, and maintainability angles.
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

CLI installs update with:

```bash
codex plugin marketplace upgrade codex-dev-forge
```

In the Codex App UI, change the Git ref to move between `latest` and a pinned
release tag. Pinned refs do not auto-advance, and **Update** only refreshes the
currently configured ref.

## Troubleshooting

- If the marketplace appears empty, include both `.agents/plugins` and `plugins`
  in selective paths.
- If plugin changes are not visible, restart Codex and start a new thread.
- If a pinned ref does not update, change the Git ref or install from a newer
  tag.
- If installed marketplace files are stale, run
  `codex plugin marketplace upgrade codex-dev-forge`.
- Install a plugin, then start a new thread before using that plugin's skills.
- No external authentication is required for the current skills-only release.

## Release Artifact

GitHub releases attach `codex-dev-forge-marketplace.zip`. The artifact contains
only marketplace-relevant files:

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
`build/`, `device-ai/`, `identity/`, `testing/`, and `xr/` are not install
paths and must stay absent from the release layout.
