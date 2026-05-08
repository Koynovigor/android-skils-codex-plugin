# Android Skills Codex Marketplace Plan

**Goal:** превратить текущий репозиторий Android Skills в GitHub-обновляемый marketplace для Codex App/CLI, чтобы пользователи могли добавить репозиторий как marketplace, установить нужные плагины и обновляться через `codex plugin marketplace upgrade` или через новый Git ref в UI.

**Recommended architecture:** один marketplace в репозитории `Koynovigor/android-skils-codex-plugin`, внутри него несколько тематических Codex-плагинов. Это использует модель OpenAI, где marketplace является каталогом, а каждый plugin является отдельной installable distribution unit для одного или нескольких skills.

**Initial release target:** `v0.0.4`.

**Version alignment:** first public release must use the same release version requested for `https://github.com/android/skills`: `v0.0.4`. Before cutting the release, verify the upstream `android/skills` tags/releases and record the check in release notes.

**Clean repository target:** к первому публичному релизу репозиторий должен остаться чистым Codex marketplace/plugin репозиторием. Старый root-layout Android Skills (`android-cli/`, `build/`, `camera/`, `jetpack-compose/`, `navigation/`, `performance/`, `play/`, `system/`, `xr/`) используется только как временный источник миграции и должен быть удален после того, как содержимое перенесено и провалидировано в `plugins/*/skills/`.

---

## 1. OpenAI Documentation Baseline

Изученные актуальные страницы OpenAI:

- [Build plugins](https://developers.openai.com/codex/plugins/build)
- [Plugins](https://developers.openai.com/codex/plugins)
- [Agent Skills](https://developers.openai.com/codex/skills)
- [Customization: Skills](https://developers.openai.com/codex/concepts/customization#skills)
- [Browse plugins with `/plugins`](https://developers.openai.com/codex/cli/slash-commands#browse-plugins-with-plugins)

Ключевые правила, на которых основан план:

- У каждого Codex-плагина должен быть manifest в `.codex-plugin/plugin.json`.
- `plugin.json` лежит только внутри `.codex-plugin/`; `skills/`, `assets/`, `.mcp.json`, `.app.json`, `hooks/` лежат в корне плагина.
- Published plugin manifest обычно содержит `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `skills`, `interface`.
- Пути в manifest должны быть относительными к корню плагина и начинаться с `./`.
- Marketplace для репозитория должен лежать в `.agents/plugins/marketplace.json`.
- Marketplace entry должен содержать `name`, `source`, `policy.installation`, `policy.authentication`, `category`.
- Marketplace может указывать на локальные пути внутри checkout или на Git-backed plugin source. Для этого репозитория проще и надежнее использовать local paths внутри Git-backed marketplace checkout.
- Codex может добавить marketplace из GitHub shorthand, Git URL, SSH URL или локальной директории. Для обновления используется `codex plugin marketplace upgrade`.
- Skills остаются authoring format; plugins являются installable distribution unit.
- Skill discovery опирается на `name` и `description`, поэтому слишком общие имена и слабые descriptions нужно исправить до релиза.
- Официальная self-serve публикация в OpenAI Plugin Directory по документации еще не доступна, поэтому GitHub marketplace является основным публичным каналом распространения.

---

## 2. Current Project Inventory

Текущий репозиторий:

- Remote: `https://github.com/Koynovigor/android-skils-codex-plugin.git`
- Current branch: `feature/codex_plugin`
- Main commit checked locally: `4b896c8 Updates skills (2026-05-07 15:25)`
- Tracked files: 95
- Repo size: около `1.8M`
- Skills: 9
- Reference files: 80
- Existing release workflow: `.github/workflows/create-release.yml`
- Existing upstream sync workflow: `.github/workflows/update-skills.yml`
- Existing license: `Apache-2.0` in `LICENSE.txt`
- Untracked local IDE state: `.idea/`; it must not be included in plugin packaging.

Existing skills:

| Current path | Skill name | Domain | References | Release decision |
|---|---:|---|---:|---|
| `android-cli/base/SKILL.md` | `base` | Android CLI orchestration | 0 | Rename in packaged copy to `android-cli-base`; current `base` is too generic for marketplace discovery. |
| `build/agp/agp-9-upgrade/SKILL.md` | `agp-9-upgrade` | Build migration | 6 | Ship in build plugin. |
| `play/play-billing-library-version-upgrade/SKILL.md` | `play-billing-library-version-upgrade` | Google Play Billing migration | 3 | Ship in build/release plugin. |
| `performance/r8-analyzer/SKILL.md` | `r8-analyzer` | R8 and ProGuard analysis | 6 | Ship in build/release plugin. |
| `system/edge-to-edge/SKILL.md` | `edge-to-edge` | Compose system UI/insets | 0 | Ship in UI migration plugin. |
| `jetpack-compose/migration/migrate-xml-views-to-jetpack-compose/SKILL.md` | `migrate-xml-views-to-jetpack-compose` | XML to Compose migration | 7 | Ship in UI migration plugin. |
| `navigation/navigation-3/SKILL.md` | `navigation-3` | Navigation 3 migration and recipes | 23 | Ship in UI migration plugin. |
| `camera/camera1-to-camerax/SKILL.md` | `camera1-to-camerax` | Camera migration | 0 | Ship in UI/device migration plugin. |
| `xr/display-ai-glasses-with-jetpack-compose-glimmer/SKILL.md` | `display-ai-glasses-with-jetpack-compose-glimmer` | Android XR Glimmer | 35 | Ship as separate XR plugin because it is large and specialized. |

Important project findings:

- There is no current `.codex-plugin/plugin.json`.
- There is no `.agents/plugins/marketplace.json`.
- There are no `.mcp.json`, `.app.json`, or hook configs. The first release should be skills-only.
- Current skills are already valid `SKILL.md`-style folders with local `references/` where needed.
- The current root layout is an upstream skill mirror, not a Codex plugin layout. It is migration input only; final release layout should keep the Codex plugin structure under `plugins/` and remove duplicated legacy root skill directories.
- Existing `.github/workflows/update-skills.yml` deletes all non-hidden top-level directories. It must be rewritten so it refreshes plugin directories directly from a temporary upstream extraction and never deletes Codex marketplace files.
- Existing `.github/workflows/create-release.yml` creates a full repository zip. For marketplace consumers, Git refs matter more than the zip, but release artifacts should still contain `.agents/plugins/` and `plugins/`.

---

## 3. Product Shape Decision

### Recommended: one marketplace with four plugins

Use a curated marketplace named `android-skills-codex`:

1. `android-cli-tools`
2. `android-build-and-release`
3. `android-ui-migration`
4. `android-xr-glimmer`

Why this is better than one monolithic plugin:

- Users can install only the domain they need.
- The XR Glimmer skill is reference-heavy and specialized; it should not be installed by default for every Android build migration user.
- `android-cli/base` has a generic skill name; separating and renaming its packaged copy reduces collisions.
- Marketplace ordering can show a clear catalog while still letting users add one GitHub marketplace source.
- Future versions can move faster in one domain without forcing users to enable unrelated capabilities.

Why not one plugin per skill in `v0.0.4`:

- Nine plugins make the first marketplace noisy.
- Several skills naturally work together: AGP/PBL/R8 are build/release workflows; edge-to-edge/XML migration/Navigation/CameraX are UI or device-facing migration workflows.
- OpenAI docs explicitly allow one plugin to bundle multiple skills.

---

## 4. Target Repository Structure

Create this final distribution structure:

```text
.agents/
  plugins/
    marketplace.json
plugins/
  android-cli-tools/
    .codex-plugin/
      plugin.json
    skills/
      android-cli-base/
        SKILL.md
  android-build-and-release/
    .codex-plugin/
      plugin.json
    skills/
      agp-9-upgrade/
        SKILL.md
        references/
      play-billing-library-version-upgrade/
        SKILL.md
        references/
      r8-analyzer/
        SKILL.md
        references/
  android-ui-migration/
    .codex-plugin/
      plugin.json
    skills/
      camera1-to-camerax/
        SKILL.md
      edge-to-edge/
        SKILL.md
      migrate-xml-views-to-jetpack-compose/
        SKILL.md
        references/
      navigation-3/
        SKILL.md
        references/
  android-xr-glimmer/
    .codex-plugin/
      plugin.json
    skills/
      display-ai-glasses-with-jetpack-compose-glimmer/
        SKILL.md
        references/
scripts/
  sync-codex-plugins.sh
  validate-codex-plugins.sh
docs/
  codex-marketplace-install.md
  release-process.md
```

The legacy root skill directories are temporary migration inputs only:

```text
android-cli/
build/
camera/
jetpack-compose/
navigation/
performance/
play/
system/
xr/
```

After `plugins/*/skills/` is populated and validated, delete those legacy root directories so the repository is not a duplicated upstream mirror plus a marketplace. From that cleanup point onward, plugin directories are the release source of truth.

For future upstream refreshes, use a temporary source extraction outside the final repository layout:

```text
/tmp/android-skills-upstream/
  android-cli/
  build/
  camera/
  jetpack-compose/
  navigation/
  performance/
  play/
  system/
  xr/
```

Then run `scripts/sync-codex-plugins.sh` with that temporary source root and commit only marketplace/plugin output.

---

## 5. Marketplace Manifest

Create `.agents/plugins/marketplace.json`:

```json
{
  "name": "android-skills-codex",
  "interface": {
    "displayName": "Android Skills for Codex"
  },
  "plugins": [
    {
      "name": "android-cli-tools",
      "source": {
        "source": "local",
        "path": "./plugins/android-cli-tools"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Developer Tools"
    },
    {
      "name": "android-build-and-release",
      "source": {
        "source": "local",
        "path": "./plugins/android-build-and-release"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Developer Tools"
    },
    {
      "name": "android-ui-migration",
      "source": {
        "source": "local",
        "path": "./plugins/android-ui-migration"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Developer Tools"
    },
    {
      "name": "android-xr-glimmer",
      "source": {
        "source": "local",
        "path": "./plugins/android-xr-glimmer"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Developer Tools"
    }
  ]
}
```

This uses local plugin paths relative to the Git-backed marketplace root. Users who add the GitHub repo as a marketplace must include both `.agents/plugins` and `plugins` if they use selective/sparse paths.

---

## 6. Plugin Manifests

All plugin manifests use:

- `version`: `0.0.4` for first release.
- `license`: `Apache-2.0`.
- `repository`: `https://github.com/Koynovigor/android-skils-codex-plugin`.
- `homepage`: `https://github.com/Koynovigor/android-skils-codex-plugin/blob/main/docs/codex-marketplace-install.md`.
- No `apps`, `mcpServers`, or `hooks` in `v0.0.4`.
- No Google logos or Android robot assets unless trademark usage is explicitly approved. Use neutral plugin naming and preserve Google LLC as skill metadata author where it already exists.

Create `plugins/android-cli-tools/.codex-plugin/plugin.json`:

```json
{
  "name": "android-cli-tools",
  "version": "0.0.4",
  "description": "Reusable Android CLI workflows for Codex.",
  "author": {
    "name": "Koynovigor",
    "url": "https://github.com/Koynovigor"
  },
  "homepage": "https://github.com/Koynovigor/android-skils-codex-plugin/blob/main/docs/codex-marketplace-install.md",
  "repository": "https://github.com/Koynovigor/android-skils-codex-plugin",
  "license": "Apache-2.0",
  "keywords": ["android", "android-cli", "sdk", "emulator", "developer-tools"],
  "skills": "./skills/",
  "interface": {
    "displayName": "Android CLI Tools",
    "shortDescription": "Android CLI workflows for Codex",
    "longDescription": "Use Android CLI commands for project creation, SDK management, emulator work, device interaction, screenshots, layout inspection, and Android documentation lookup.",
    "developerName": "Koynovigor",
    "category": "Developer Tools",
    "capabilities": ["Read", "Write"],
    "websiteURL": "https://github.com/Koynovigor/android-skils-codex-plugin",
    "defaultPrompt": [
      "Use Android CLI to inspect this project.",
      "Use Android CLI to check connected devices.",
      "Use Android CLI to search Android docs."
    ],
    "brandColor": "#3DDC84"
  }
}
```

Create `plugins/android-build-and-release/.codex-plugin/plugin.json`:

```json
{
  "name": "android-build-and-release",
  "version": "0.0.4",
  "description": "Android build, release, billing, and R8 optimization workflows for Codex.",
  "author": {
    "name": "Koynovigor",
    "url": "https://github.com/Koynovigor"
  },
  "homepage": "https://github.com/Koynovigor/android-skils-codex-plugin/blob/main/docs/codex-marketplace-install.md",
  "repository": "https://github.com/Koynovigor/android-skils-codex-plugin",
  "license": "Apache-2.0",
  "keywords": ["android", "gradle", "agp", "play-billing", "r8", "proguard"],
  "skills": "./skills/",
  "interface": {
    "displayName": "Android Build and Release",
    "shortDescription": "AGP, Play Billing, and R8 workflows",
    "longDescription": "Migrate Android projects to AGP 9, upgrade Google Play Billing Library, and analyze R8 or ProGuard keep rules using Android-focused guidance.",
    "developerName": "Koynovigor",
    "category": "Developer Tools",
    "capabilities": ["Read", "Write"],
    "websiteURL": "https://github.com/Koynovigor/android-skils-codex-plugin",
    "defaultPrompt": [
      "Migrate this project to AGP 9.",
      "Upgrade Play Billing Library.",
      "Analyze R8 keep rules."
    ],
    "brandColor": "#4285F4"
  }
}
```

Create `plugins/android-ui-migration/.codex-plugin/plugin.json`:

```json
{
  "name": "android-ui-migration",
  "version": "0.0.4",
  "description": "Android UI, Compose, Navigation, CameraX, and edge-to-edge migration workflows for Codex.",
  "author": {
    "name": "Koynovigor",
    "url": "https://github.com/Koynovigor"
  },
  "homepage": "https://github.com/Koynovigor/android-skils-codex-plugin/blob/main/docs/codex-marketplace-install.md",
  "repository": "https://github.com/Koynovigor/android-skils-codex-plugin",
  "license": "Apache-2.0",
  "keywords": ["android", "compose", "navigation", "camerax", "edge-to-edge", "xml-migration"],
  "skills": "./skills/",
  "interface": {
    "displayName": "Android UI Migration",
    "shortDescription": "Compose and Android UI migrations",
    "longDescription": "Migrate Android XML views to Compose, add edge-to-edge support, move to Navigation 3, and migrate legacy camera implementations to CameraX.",
    "developerName": "Koynovigor",
    "category": "Developer Tools",
    "capabilities": ["Read", "Write"],
    "websiteURL": "https://github.com/Koynovigor/android-skils-codex-plugin",
    "defaultPrompt": [
      "Migrate this XML layout to Compose.",
      "Add edge-to-edge support.",
      "Migrate this app to Navigation 3."
    ],
    "brandColor": "#0F9D58"
  }
}
```

Create `plugins/android-xr-glimmer/.codex-plugin/plugin.json`:

```json
{
  "name": "android-xr-glimmer",
  "version": "0.0.4",
  "description": "Android XR Display AI Glasses and Jetpack Compose Glimmer workflows for Codex.",
  "author": {
    "name": "Koynovigor",
    "url": "https://github.com/Koynovigor"
  },
  "homepage": "https://github.com/Koynovigor/android-skils-codex-plugin/blob/main/docs/codex-marketplace-install.md",
  "repository": "https://github.com/Koynovigor/android-skils-codex-plugin",
  "license": "Apache-2.0",
  "keywords": ["android", "xr", "glimmer", "ai-glasses", "jetpack-compose"],
  "skills": "./skills/",
  "interface": {
    "displayName": "Android XR Glimmer",
    "shortDescription": "XR Glimmer guidance for Codex",
    "longDescription": "Build projected Android XR experiences for Display AI Glasses using Jetpack Compose Glimmer guidelines, components, references, and input models.",
    "developerName": "Koynovigor",
    "category": "Developer Tools",
    "capabilities": ["Read", "Write"],
    "websiteURL": "https://github.com/Koynovigor/android-skils-codex-plugin",
    "defaultPrompt": [
      "Build an AI glasses Glimmer UI.",
      "Add a projected glasses activity.",
      "Review this Glimmer layout."
    ],
    "brandColor": "#A142F4"
  }
}
```

---

## 7. Milestones

### Milestone 0: Freeze baseline and protect plugin output

**Files:**

- Modify: `.github/workflows/update-skills.yml`
- Create: `docs/codex-marketplace-install.md`

**Tasks:**

- Replace the broad deletion step in `.github/workflows/update-skills.yml` with a temporary-source workflow. The workflow must download/extract upstream skills into a temp directory, sync from that temp directory into `plugins/`, validate, then delete the temp directory.
- If the first implementation needs an intermediate migration step, restrict deletion to legacy source directories only:

```bash
rm -rf android-cli build camera jetpack-compose navigation performance play system xr
```

- Keep `.agents/`, `plugins/`, `scripts/`, `docs/`, `.github/`, `README.md`, `CHANGELOG.md`, and `LICENSE.txt` untouched during upstream refresh.
- Document that root skill directories are temporary migration inputs only. The final repository must not keep duplicate legacy root skill directories after plugin packaging is complete.

**Acceptance criteria:**

- Running the update workflow cannot delete `plugins/`.
- Upstream skill refresh remains possible without permanently storing the old root skill layout.
- Codex packaging files have a stable place in the repository.

---

### Milestone 1: Add marketplace and plugin skeletons

**Files:**

- Create: `.agents/plugins/marketplace.json`
- Create: `plugins/android-cli-tools/.codex-plugin/plugin.json`
- Create: `plugins/android-build-and-release/.codex-plugin/plugin.json`
- Create: `plugins/android-ui-migration/.codex-plugin/plugin.json`
- Create: `plugins/android-xr-glimmer/.codex-plugin/plugin.json`

**Tasks:**

- Add marketplace JSON exactly in the shape from section 5.
- Add four plugin manifests exactly in the shape from section 6.
- Keep `policy.installation` as `AVAILABLE`.
- Keep `policy.authentication` as `ON_INSTALL`, even though these skills do not require external auth. This matches OpenAI marketplace metadata rules and keeps a stable policy block.
- Do not add `.app.json`, `.mcp.json`, or hooks in `v0.0.4`.

**Validation commands:**

```bash
jq . .agents/plugins/marketplace.json
jq . plugins/android-cli-tools/.codex-plugin/plugin.json
jq . plugins/android-build-and-release/.codex-plugin/plugin.json
jq . plugins/android-ui-migration/.codex-plugin/plugin.json
jq . plugins/android-xr-glimmer/.codex-plugin/plugin.json
```

**Acceptance criteria:**

- All JSON files parse successfully.
- Every marketplace entry has `name`, `source`, `policy.installation`, `policy.authentication`, and `category`.
- Every plugin has `.codex-plugin/plugin.json`.

---

### Milestone 2: Package skills into plugin directories

**Files:**

- Create: `scripts/sync-codex-plugins.sh`
- Modify generated output under: `plugins/*/skills/**`

**Skill mapping:**

```text
android-cli/base -> plugins/android-cli-tools/skills/android-cli-base
build/agp/agp-9-upgrade -> plugins/android-build-and-release/skills/agp-9-upgrade
play/play-billing-library-version-upgrade -> plugins/android-build-and-release/skills/play-billing-library-version-upgrade
performance/r8-analyzer -> plugins/android-build-and-release/skills/r8-analyzer
system/edge-to-edge -> plugins/android-ui-migration/skills/edge-to-edge
jetpack-compose/migration/migrate-xml-views-to-jetpack-compose -> plugins/android-ui-migration/skills/migrate-xml-views-to-jetpack-compose
navigation/navigation-3 -> plugins/android-ui-migration/skills/navigation-3
camera/camera1-to-camerax -> plugins/android-ui-migration/skills/camera1-to-camerax
xr/display-ai-glasses-with-jetpack-compose-glimmer -> plugins/android-xr-glimmer/skills/display-ai-glasses-with-jetpack-compose-glimmer
```

**Initial sync script content:**

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_ROOT="${SOURCE_ROOT:-$ROOT}"

copy_skill() {
  local source_dir="$1"
  local target_dir="$2"

  if [[ ! -f "$SOURCE_ROOT/$source_dir/SKILL.md" ]]; then
    echo "Missing skill source: $source_dir/SKILL.md" >&2
    exit 1
  fi

  rm -rf "$ROOT/$target_dir"
  mkdir -p "$(dirname "$ROOT/$target_dir")"
  rsync -a "$SOURCE_ROOT/$source_dir/" "$ROOT/$target_dir/"
}

copy_skill "android-cli/base" "plugins/android-cli-tools/skills/android-cli-base"
copy_skill "build/agp/agp-9-upgrade" "plugins/android-build-and-release/skills/agp-9-upgrade"
copy_skill "play/play-billing-library-version-upgrade" "plugins/android-build-and-release/skills/play-billing-library-version-upgrade"
copy_skill "performance/r8-analyzer" "plugins/android-build-and-release/skills/r8-analyzer"
copy_skill "system/edge-to-edge" "plugins/android-ui-migration/skills/edge-to-edge"
copy_skill "jetpack-compose/migration/migrate-xml-views-to-jetpack-compose" "plugins/android-ui-migration/skills/migrate-xml-views-to-jetpack-compose"
copy_skill "navigation/navigation-3" "plugins/android-ui-migration/skills/navigation-3"
copy_skill "camera/camera1-to-camerax" "plugins/android-ui-migration/skills/camera1-to-camerax"
copy_skill "xr/display-ai-glasses-with-jetpack-compose-glimmer" "plugins/android-xr-glimmer/skills/display-ai-glasses-with-jetpack-compose-glimmer"

perl -0pi -e 's/^name: base$/name: android-cli-base/m; s/^description: Orchestrates Android development tasks$/description: Use this skill for Android CLI workflows including project creation, SDK management, emulator management, device interaction, screenshots, layout inspection, Android documentation lookup, and Android CLI diagnostics./m' "$ROOT/plugins/android-cli-tools/skills/android-cli-base/SKILL.md"
```

**Tasks:**

- Run `chmod +x scripts/sync-codex-plugins.sh`.
- Run `scripts/sync-codex-plugins.sh`.
- For future upstream refreshes after cleanup, run the script with `SOURCE_ROOT=/tmp/android-skills-upstream`.
- Confirm each packaged skill keeps its `references/` directory.
- Confirm `android-cli-base` no longer exposes the generic skill name `base` in the packaged plugin.
- Treat root `android-cli/base/SKILL.md` as migration input only. Do not keep it in the final release layout after cleanup.

**Validation commands:**

```bash
find plugins -name SKILL.md | sort
find plugins -path '*/references/*' -type f | wc -l
rg -n "^name: base$" plugins
rg -n "^name: android-cli-base$" plugins/android-cli-tools/skills/android-cli-base/SKILL.md
```

**Expected validation:**

- `find plugins -name SKILL.md | sort` returns 9 files.
- Reference file count under `plugins/` is 80.
- `rg -n "^name: base$" plugins` returns no matches.
- `android-cli-base` frontmatter exists in the packaged copy.

---

### Milestone 3: Fix release-blocking skill metadata and markdown quality

**Files:**

- Modify: `plugins/android-cli-tools/skills/android-cli-base/SKILL.md`
- Modify: `plugins/android-build-and-release/skills/r8-analyzer/SKILL.md`
- Modify: `plugins/android-ui-migration/skills/edge-to-edge/SKILL.md`
- Optionally mirror non-packaging fixes back to source skill directories when they are not Codex-specific.

**Tasks:**

- `android-cli-base`: ensure the packaged skill has a specific `name` and a trigger-focused `description`.
- `r8-analyzer`: fix the nested Step 4 markdown indentation in the packaged copy so the core workflow renders as a flat ordered checklist.
- `edge-to-edge`: normalize checklist bullets from `- []` to `- [ ]` in the packaged copy.
- Confirm every packaged `SKILL.md` has frontmatter `name` and `description`.
- Confirm skill descriptions front-load trigger phrases:
  - AGP 9 migration
  - Play Billing Library upgrade
  - R8/ProGuard keep rules
  - edge-to-edge Compose insets
  - XML View to Compose migration
  - Navigation 3 migration and recipes
  - Camera1/Camera2 to CameraX migration
  - Android XR Glimmer / Display AI Glasses
  - Android CLI workflows

**Validation commands:**

```bash
rg -n "^---$|^name:|^description:" plugins -g SKILL.md
rg -n -- "- \\[\\]" plugins -g SKILL.md
rg -n "TODO|TBD|FIXME" plugins .agents README.md docs || true
```

**Expected validation:**

- Every packaged skill has `name` and `description`.
- No malformed checklist item remains in packaged skills.
- No release-facing placeholder markers are present in `plugins/`, `.agents/`, `README.md`, or `docs/`.

---

### Milestone 4: Add plugin validation script and CI gate

**Files:**

- Create: `scripts/validate-codex-plugins.sh`
- Modify: `.github/workflows/create-release.yml`
- Modify: `.github/workflows/update-skills.yml`

**Validation script content:**

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MARKETPLACE="$ROOT/.agents/plugins/marketplace.json"

if [[ ! -f "$MARKETPLACE" ]]; then
  echo "Missing .agents/plugins/marketplace.json" >&2
  exit 1
fi

jq -e '.name and .plugins and (.plugins | length > 0)' "$MARKETPLACE" >/dev/null

for plugin in android-cli-tools android-build-and-release android-ui-migration android-xr-glimmer; do
  manifest="$ROOT/plugins/$plugin/.codex-plugin/plugin.json"
  skills_dir="$ROOT/plugins/$plugin/skills"

  if [[ ! -f "$manifest" ]]; then
    echo "Missing manifest: $manifest" >&2
    exit 1
  fi

  jq -e --arg plugin "$plugin" '
    .name == $plugin and
    .version and
    .description and
    .license == "Apache-2.0" and
    .skills == "./skills/" and
    .interface.displayName and
    .interface.shortDescription and
    .interface.longDescription
  ' "$manifest" >/dev/null

  if [[ ! -d "$skills_dir" ]]; then
    echo "Missing skills directory: $skills_dir" >&2
    exit 1
  fi
done

skill_count="$(find "$ROOT/plugins" -name SKILL.md | wc -l | tr -d ' ')"
if [[ "$skill_count" != "9" ]]; then
  echo "Expected 9 packaged skills, found $skill_count" >&2
  exit 1
fi

missing_frontmatter="$(find "$ROOT/plugins" -name SKILL.md -print0 | xargs -0 awk '
  FNR == 1 && $0 != "---" { print FILENAME }
')"
if [[ -n "$missing_frontmatter" ]]; then
  echo "Skills missing frontmatter:" >&2
  echo "$missing_frontmatter" >&2
  exit 1
fi

bad_paths="$(jq -r '.plugins[].source.path' "$MARKETPLACE" | awk '$0 !~ /^\\.\\/plugins\\// { print }')"
if [[ -n "$bad_paths" ]]; then
  echo "Marketplace source paths must start with ./plugins/:" >&2
  echo "$bad_paths" >&2
  exit 1
fi

echo "Codex plugin validation passed."
```

**Tasks:**

- Run `chmod +x scripts/validate-codex-plugins.sh`.
- In `update-skills.yml`, run sync from the temporary upstream extraction and validation before committing:

```bash
SOURCE_ROOT="$RUNNER_TEMP/android-skills-upstream" scripts/sync-codex-plugins.sh
scripts/validate-codex-plugins.sh
```

- In `create-release.yml`, run validation before archiving.
- Ensure GitHub Actions has `jq` available. Ubuntu runners include it; if the runner image changes, install it explicitly with `sudo apt-get update && sudo apt-get install -y jq`.

**Acceptance criteria:**

- CI fails if marketplace JSON is malformed.
- CI fails if any plugin manifest is missing or malformed.
- CI fails if packaged skill count is not 9.
- CI fails if marketplace source paths do not point under `./plugins/`.

---

### Milestone 5: Update GitHub release workflow for marketplace distribution

**Files:**

- Modify: `.github/workflows/create-release.yml`
- Create: `docs/codex-marketplace-install.md`

**Tasks:**

- Add `version` input to release workflow and require it to match the tag without the leading `v`.
- Run validation before release. Do not regenerate from deleted legacy root directories during release.
- If the release workflow intentionally refreshes upstream skills immediately before release, extract upstream into a temp directory and run:

```bash
SOURCE_ROOT="$RUNNER_TEMP/android-skills-upstream" scripts/sync-codex-plugins.sh
scripts/validate-codex-plugins.sh
```

- Archive only marketplace-relevant files:

```bash
git archive --format=zip --output=android-skills-codex-marketplace.zip HEAD .agents/plugins plugins scripts README.md LICENSE.txt docs/codex-marketplace-install.md
```

- Create GitHub Release with:
  - tag: `v0.0.4`
  - asset: `android-skills-codex-marketplace.zip`
  - notes containing install commands and plugin list.
- Use `main` as the default update channel.
- Use tags such as `v0.0.4`, `v0.0.5`, `v0.0.6`, and later `v1.0.0` for pinned installs.

**Recommended user install docs:**

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref main
codex plugin marketplace upgrade android-skills-codex
```

Pinned install:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref v0.0.4
```

If the Codex App UI asks for selective paths, enter:

```text
.agents/plugins
plugins
```

For a narrower sparse checkout:

```text
.agents/plugins
plugins/android-cli-tools
plugins/android-build-and-release
plugins/android-ui-migration
plugins/android-xr-glimmer
```

**Acceptance criteria:**

- A GitHub release has a marketplace artifact.
- A user can install from `main` to track updates.
- A user can install from a tag for reproducible pinned behavior.
- Docs explain that updates require `codex plugin marketplace upgrade` or changing Git ref in the Codex App UI.

---

### Milestone 6: Add local Codex verification path

**Files:**

- Modify: `docs/codex-marketplace-install.md`

**Tasks:**

- Document local install for development:

```bash
codex plugin marketplace add /Users/igor/AndroidStudioProjects/android-skils-codex-plugin
codex plugin marketplace upgrade android-skills-codex
```

- Document app UI install using the screenshot flow:
  - Source: `Koynovigor/android-skils-codex-plugin`
  - Git ref: `main` for update channel or `v0.0.4` for pinned release.
  - Selective paths: `.agents/plugins` and `plugins`.
- Restart Codex after local plugin changes.
- Open `/plugins`, choose `Android Skills for Codex`, verify four plugins are visible.
- Install each plugin one at a time and start a new thread after install.

**Trigger test prompts:**

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

**Acceptance criteria:**

- `/plugins` shows marketplace `Android Skills for Codex`.
- All four plugins are installable.
- Explicit plugin/skill invocation works.
- Implicit trigger behavior chooses the expected skill for representative prompts.
- No plugin requires external authentication.

---

### Milestone 7: Write a new GitHub-optimized README and public docs

**Files:**

- Replace: `README.md`
- Create: `docs/codex-marketplace-install.md`
- Create: `docs/release-process.md`

**README.md requirements:**

- Write a new README from scratch for this Codex marketplace repository, not a lightly edited Android Skills mirror README.
- Use GitHub-flavored Markdown features intentionally:
  - badges for latest release `v0.0.4`, license, validation workflow, and Codex marketplace status
  - a compact table of contents
  - plugin catalog tables
  - copy-paste install command blocks
  - blockquotes/admonitions for important version and restart notes
  - collapsible `<details>` sections for troubleshooting and advanced sparse/selective path setup
  - links to Releases, Issues, License, OpenAI Codex plugin docs, and upstream `android/skills`
- Include a clear repository description:
  - this repo packages Android Skills as a Codex App/CLI marketplace
  - it exposes one marketplace with four installable Codex plugins
  - it is a skills-only distribution in `v0.0.4`
  - it is not the official OpenAI Plugin Directory and must not imply official Google/OpenAI publication
- Include the full plugin catalog:
  - `android-cli-tools`
  - `android-build-and-release`
  - `android-ui-migration`
  - `android-xr-glimmer`
  - every bundled skill under each plugin
- Include complete installation instructions for Codex CLI:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref main
codex plugin marketplace upgrade android-skills-codex
```

- Include pinned install instructions for the first release:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref v0.0.4
```

- Include complete Codex App UI instructions:
  - open Plugins
  - add marketplace
  - source: `Koynovigor/android-skils-codex-plugin`
  - Git ref: `main` for update channel or `v0.0.4` for pinned release
  - selective paths: `.agents/plugins` and `plugins`
  - restart Codex when needed
  - install a plugin and start a new thread before using it
- Include update instructions:

```bash
codex plugin marketplace upgrade android-skills-codex
```

- Include local development install instructions:

```bash
codex plugin marketplace add /Users/igor/AndroidStudioProjects/android-skils-codex-plugin
```

- Include troubleshooting:
  - marketplace appears empty when `plugins` is omitted from selective paths
  - plugin changes require restart/new thread
  - pinned refs do not auto-advance
  - local installs use Codex cache
  - no external authentication is required in `v0.0.4`
- Include release/version notes:
  - first release is `v0.0.4`
  - plugin manifest versions are `0.0.4`
  - Git tags are the stable pinned channel
  - `main` is the rolling stable channel
- Preserve license/attribution:
  - repository license is Apache-2.0
  - Android skill content retains existing Google LLC metadata
  - no Google/OpenAI logos or official-publication claims unless authorized

**`docs/codex-marketplace-install.md` content:**

- CLI install.
- Codex App UI install.
- Selective paths.
- Update behavior.
- Plugin list.
- Troubleshooting:
  - restart Codex after local changes
  - include both `.agents/plugins` and `plugins` in selective paths
  - run `codex plugin marketplace upgrade`
  - install plugin then start a new thread

**`docs/release-process.md` content:**

- When refreshing upstream skills, extract them into a temp directory and run `SOURCE_ROOT=/tmp/android-skills-upstream scripts/sync-codex-plugins.sh`.
- Run `scripts/validate-codex-plugins.sh`.
- Confirm legacy root directories are absent before release.
- Update all plugin manifest versions.
- Update changelog section in `README.md` or release notes.
- Verify upstream `android/skills` release/tag alignment and keep this repository's first public release at `v0.0.4`.
- Push to `main`.
- Run `Create Release` workflow with `tag_name=v0.0.4`.
- Verify install from tag and from main.

**Acceptance criteria:**

- A new user can understand the repository and install from CLI or Codex App without reading repository internals.
- `README.md` is GitHub-ready and contains badges, catalog tables, copy-paste commands, full install/update instructions, troubleshooting, release notes, license, and attribution.
- A maintainer can cut a release with a repeatable checklist.
- Docs make update semantics explicit.

---

### Milestone 8: Remove legacy root skill layout

**Files:**

- Delete: `android-cli/`
- Delete: `build/`
- Delete: `camera/`
- Delete: `jetpack-compose/`
- Delete: `navigation/`
- Delete: `performance/`
- Delete: `play/`
- Delete: `system/`
- Delete: `xr/`
- Modify: `scripts/sync-codex-plugins.sh`
- Modify: `scripts/validate-codex-plugins.sh`
- Modify: `.github/workflows/update-skills.yml`
- Modify: `README.md`
- Modify: `docs/codex-marketplace-install.md`
- Modify: `docs/release-process.md`

**Tasks:**

- Confirm `plugins/*/skills/` contains all 9 skills and all 80 reference files before deleting any legacy root directory.
- Delete the old root skill directories after packaged plugins validate. These directories are no longer the repository source of truth once the Codex plugin structure exists.
- Ensure `scripts/sync-codex-plugins.sh` supports `SOURCE_ROOT=/path/to/upstream-extraction` and does not require legacy root directories to exist in the final checkout.
- Ensure `.github/workflows/update-skills.yml` downloads upstream skills into a temp directory, syncs into `plugins/`, validates, and commits only marketplace/plugin output.
- Add a validation check that fails if any legacy root skill directory reappears in the final release layout.
- Update docs to say the final repository is a Codex marketplace repository, not a duplicated Android Skills mirror.

**Validation commands:**

```bash
find plugins -name SKILL.md | wc -l
find plugins -path '*/references/*' -type f | wc -l
for path in android-cli build camera jetpack-compose navigation performance play system xr; do
  test ! -e "$path" || { echo "Legacy root path still exists: $path"; exit 1; }
done
scripts/validate-codex-plugins.sh
```

**Expected validation:**

- Packaged skill count is 9.
- Packaged reference count is 80.
- No legacy root skill directory exists.
- Plugin validation passes.

**Acceptance criteria:**

- Repository root contains Codex marketplace/plugin structure, docs, scripts, workflows, license, and README only.
- There is no duplicated old Android Skills root layout in the release branch.
- Future upstream refreshes still work through temporary extraction plus `SOURCE_ROOT`.

---

### Milestone 9: Versioning and update policy

**Files:**

- Modify: `plugins/*/.codex-plugin/plugin.json`
- Create: `CHANGELOG.md`
- Modify: `.github/workflows/create-release.yml`

**Policy:**

- Use SemVer for each plugin manifest.
- For `v0.x`, bump minor for new skills or major workflow rewrites; bump patch for metadata/reference fixes.
- Keep all four plugin versions equal in `v0.0.4` for the first release.
- After `v0.0.4`, allow independent versions only if the release workflow can update and validate them reliably.
- Git tag names use repository release version, for example `v0.0.4`.
- Marketplace `main` is the rolling stable channel.
- Git tags are pinned channels.

**Acceptance criteria:**

- `CHANGELOG.md` lists changed plugins and skills per release.
- Release notes tell users whether `codex plugin marketplace upgrade` is enough or whether they should change Git ref.
- Plugin manifest versions match release notes.

---

### Milestone 10: First public release

**Steps:**

1. Ensure working tree has no unintended changes:

```bash
git status --short
```

2. Validate package:

```bash
scripts/validate-codex-plugins.sh
```

3. Verify upstream `android/skills` release/tag alignment:

```bash
gh release view v0.0.4 --repo android/skills
```

If upstream `android/skills` does not have `v0.0.4` at release time, stop and ask whether to keep `v0.0.4` by project decision or align to the actual upstream latest tag.

4. Confirm legacy root directories are gone:

```bash
for path in android-cli build camera jetpack-compose navigation performance play system xr; do
  test ! -e "$path" || { echo "Legacy root path still exists: $path"; exit 1; }
done
```

5. Review marketplace diff:

```bash
git diff -- .agents plugins scripts docs README.md CHANGELOG.md .github/workflows
```

6. Commit:

```bash
git add .agents plugins scripts docs README.md CHANGELOG.md .github/workflows
git commit -m "feat: package Android skills as Codex marketplace"
```

7. Push:

```bash
git push origin feature/codex_plugin
```

8. Merge to `main` through PR.

9. Run `Create Release` workflow with `tag_name=v0.0.4`.

10. Verify from a clean Codex install path:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref v0.0.4
codex plugin marketplace upgrade android-skills-codex
```

11. Verify update channel:

```bash
codex plugin marketplace add Koynovigor/android-skils-codex-plugin --ref main
codex plugin marketplace upgrade android-skills-codex
```

**Acceptance criteria:**

- GitHub Release `v0.0.4` exists.
- Release asset contains `.agents/plugins/marketplace.json` and all four plugin directories.
- Pinned install from `v0.0.4` works.
- Main-channel install works.
- All four plugins appear in Codex plugin browser.

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Existing update workflow deletes `plugins/` | Release packaging disappears during skill refresh | Rewrite update workflow to use temporary upstream extraction and sync only into `plugins/`. |
| `android-cli/base` skill name collides with other skills | Poor discovery and confusing explicit invocation | Rename packaged copy to `android-cli-base`. |
| Marketplace sparse checkout omits plugin directories | Marketplace appears but plugin entries are skipped | Document selective paths as `.agents/plugins` plus `plugins` or all plugin subdirectories. |
| Legal/brand confusion with Google-authored skills | Users may think the packaging is official Google distribution | Preserve Apache-2.0 license and skill metadata, avoid Google logos, state repository packaging clearly. |
| Reference-heavy XR plugin bloats every install | Users install unrelated content | Keep XR as its own plugin. |
| Legacy root layout remains after migration | Repository stays noisy, duplicated, and confusing for Codex marketplace consumers | Add cleanup milestone, delete old root directories, and validate they cannot reappear in release. |
| Upstream refresh depends on deleted root directories | Future skill updates fail after cleanup | Make sync script accept `SOURCE_ROOT` and make CI download upstream into a temp directory. |
| Skill descriptions are too long or weak | Codex implicit invocation becomes unreliable | Front-load trigger phrases and keep each description scoped. |
| Official OpenAI plugin publishing changes | Marketplace structure may need adjustment | Keep docs links in release process and re-check OpenAI docs before `v1.0.0`. |

---

## 9. Definition of Done for `v0.0.4`

- `.agents/plugins/marketplace.json` exists and validates.
- Four plugin directories exist under `plugins/`.
- Every plugin has `.codex-plugin/plugin.json`.
- All 9 current skills are packaged under `plugins/*/skills/`.
- All 80 reference files are present in packaged plugin directories.
- No packaged skill is named `base`.
- No legacy root skill directories remain: `android-cli/`, `build/`, `camera/`, `jetpack-compose/`, `navigation/`, `performance/`, `play/`, `system/`, `xr/`.
- No `.app.json`, `.mcp.json`, or hooks are included unless a later milestone intentionally adds them.
- `scripts/sync-codex-plugins.sh` rebuilds packaged skills from an explicit `SOURCE_ROOT` temporary upstream extraction.
- `scripts/validate-codex-plugins.sh` passes locally and in CI.
- `README.md` and `docs/codex-marketplace-install.md` explain install, selective paths, and update flow.
- GitHub Release `v0.0.4` exists.
- Codex can install the marketplace from GitHub and display all four plugins.

---

## 10. Post-`v0.0.4` Backlog

- Add neutral `assets/icon.png` and `assets/logo.png` for each plugin when final visual branding is selected.
- Add lightweight screenshots for marketplace details pages if Codex App starts surfacing screenshots for third-party marketplaces.
- Add a small `agents/openai.yaml` per skill only if app-side skill UI metadata becomes necessary; keep plugin-level metadata as the primary install surface.
- Consider splitting `android-ui-migration` into `android-compose-migration` and `android-device-migration` if CameraX usage grows.
- Consider adding an Android docs MCP server only if the skills move from bundled static references to live docs lookup.
- Add automated install smoke tests when Codex CLI exposes a non-interactive plugin validation command.
