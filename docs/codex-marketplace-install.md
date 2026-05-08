# Codex Marketplace Install

This repository is being migrated from a mirrored Android Skills root layout into a
GitHub-backed Codex marketplace. During the migration, the root skill directories are
temporary migration inputs only:

- `android-cli/`
- `build/`
- `camera/`
- `jetpack-compose/`
- `navigation/`
- `performance/`
- `play/`
- `system/`
- `xr/`

The final repository source of truth must be the Codex distribution layout:

- `.agents/plugins/` for `marketplace.json`
- `plugins/` for installable Codex plugin directories
- `scripts/` for sync and validation helpers
- `docs/` for consumer and maintainer documentation

After plugin packaging and validation are complete, do not keep duplicate legacy root
skill directories in the release layout.

## Planned GitHub Install

The first public marketplace will use the GitHub source
`Koynovigor/android-skils-codex-plugin`.

For the rolling update channel:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref main
codex plugin marketplace upgrade android-skills-codex
```

For the first pinned release:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref v0.0.4
```

If Codex asks for selective paths, include both marketplace metadata and plugin payload:

```text
.agents/plugins
plugins
```

After installing or updating plugins, restart Codex when needed, install the plugin you
want to use, and start a new thread so the enabled skills are loaded.

## Scope

This repository packages Android Skills for Codex. It is a marketplace distribution
repository, not an Android application project. It does not claim publication,
endorsement, or sponsorship by Google, OpenAI, or their plugin directories.
