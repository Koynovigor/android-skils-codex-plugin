#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MARKETPLACE="$ROOT/.agents/plugins/marketplace.json"
PLUGINS=(
  android-cli-tools
  android-build-and-release
  android-ui-migration
  android-xr-glimmer
)
LEGACY_ROOTS=(
  android-cli
  build
  camera
  jetpack-compose
  navigation
  performance
  play
  system
  xr
)

fail() {
  echo "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

grep_file() {
  local file="$1"
  local pattern="$2"
  local message="$3"

  grep -Eq "$pattern" "$file" || fail "$message"
}

require_command jq

for path in "${LEGACY_ROOTS[@]}"; do
  if [[ -e "$ROOT/$path" ]]; then
    fail "Legacy root path still exists: $path"
  fi
done

if [[ ! -f "$MARKETPLACE" ]]; then
  fail "Missing .agents/plugins/marketplace.json"
fi

jq -e '
  .name == "android-skills-codex" and
  .interface.displayName and
  (.plugins | length == 4)
' "$MARKETPLACE" >/dev/null

for plugin in "${PLUGINS[@]}"; do
  jq -e --arg plugin "$plugin" '
    any(.plugins[];
      .name == $plugin and
      .source.source == "local" and
      .source.path == ("./plugins/" + $plugin) and
      .policy.installation == "AVAILABLE" and
      .policy.authentication == "ON_INSTALL" and
      .category
    )
  ' "$MARKETPLACE" >/dev/null

  manifest="$ROOT/plugins/$plugin/.codex-plugin/plugin.json"
  codex_dir="$ROOT/plugins/$plugin/.codex-plugin"
  skills_dir="$ROOT/plugins/$plugin/skills"

  if [[ ! -f "$manifest" ]]; then
    fail "Missing manifest: $manifest"
  fi

  extra_manifest_files="$(find "$codex_dir" -type f ! -name plugin.json -print)"
  if [[ -n "$extra_manifest_files" ]]; then
    echo "Unexpected files inside $codex_dir:" >&2
    echo "$extra_manifest_files" >&2
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
    .interface.longDescription and
    .interface.composerIcon == "./assets/icon.svg" and
    .interface.logo == "./assets/icon.svg"
  ' "$manifest" >/dev/null

  for asset_field in composerIcon logo; do
    asset_path="$(jq -r --arg field "$asset_field" '.interface[$field]' "$manifest")"

    if [[ "$asset_path" != ./assets/* || "$asset_path" == *..* ]]; then
      fail "$plugin manifest $asset_field must point inside ./assets/"
    fi

    asset_file="$ROOT/plugins/$plugin/${asset_path#./}"
    if [[ ! -f "$asset_file" ]]; then
      fail "$plugin manifest $asset_field target is missing: $asset_file"
    fi
  done

  if [[ ! -d "$skills_dir" ]]; then
    fail "Missing skills directory: $skills_dir"
  fi
done

bad_paths="$(jq -r '.plugins[].source.path' "$MARKETPLACE" | awk '$0 !~ /^\.\/plugins\// { print }')"
if [[ -n "$bad_paths" ]]; then
  echo "Marketplace source paths must start with ./plugins/:" >&2
  echo "$bad_paths" >&2
  exit 1
fi

unexpected_plugin_configs="$(find "$ROOT/plugins" \( -name .app.json -o -name .mcp.json -o -path '*/hooks/*' \) -print)"
if [[ -n "$unexpected_plugin_configs" ]]; then
  echo "Unexpected plugin configs for v0.0.4 skills-only release:" >&2
  echo "$unexpected_plugin_configs" >&2
  exit 1
fi

skill_count="$(find "$ROOT/plugins" -name SKILL.md | wc -l | tr -d '[:space:]')"
if [[ "$skill_count" != "9" ]]; then
  fail "Expected 9 packaged skills, found $skill_count"
fi

reference_count="$(find "$ROOT/plugins" -path '*/references/*' -type f | wc -l | tr -d '[:space:]')"
if [[ "$reference_count" != "80" ]]; then
  fail "Expected 80 packaged reference files, found $reference_count"
fi

while IFS= read -r -d '' skill_file; do
  first_line="$(sed -n '1p' "$skill_file")"
  if [[ "$first_line" != "---" ]]; then
    fail "Skill missing opening frontmatter marker: $skill_file"
  fi

  header="$(sed -n '1,40p' "$skill_file")"
  grep -q '^name:' <<<"$header" || fail "Skill missing frontmatter name: $skill_file"
  grep -q '^description:' <<<"$header" || fail "Skill missing frontmatter description: $skill_file"
done < <(find "$ROOT/plugins" -name SKILL.md -print0)

bad_base="$(find "$ROOT/plugins" -name SKILL.md -print0 | xargs -0 grep -Hn '^name: base$' || true)"
if [[ -n "$bad_base" ]]; then
  echo "Packaged skills must not use generic name base:" >&2
  echo "$bad_base" >&2
  exit 1
fi

grep -q '^name: android-cli-base$' "$ROOT/plugins/android-cli-tools/skills/android-cli-base/SKILL.md" ||
  fail "Missing android-cli-base packaged skill name"

bad_checklists="$(find "$ROOT/plugins" -name SKILL.md -print0 | xargs -0 grep -HnF -- '- \[\]' || true)"
if [[ -n "$bad_checklists" ]]; then
  echo "Malformed checklist items found:" >&2
  echo "$bad_checklists" >&2
  exit 1
fi

bad_r8_step="$(find "$ROOT/plugins" -name SKILL.md -print0 | xargs -0 grep -HnF -- '  - \[ \] Step 4' || true)"
if [[ -n "$bad_r8_step" ]]; then
  echo "Nested r8-analyzer Step 4 checklist item found:" >&2
  echo "$bad_r8_step" >&2
  exit 1
fi

release_placeholders="$(
  find "$ROOT/plugins" -name SKILL.md -print0 | xargs -0 grep -HnE 'TODO|TBD|FIXME' || true
  grep -R -nE 'TODO|TBD|FIXME' "$ROOT/.agents" "$ROOT/README.md" "$ROOT/docs" 2>/dev/null || true
)"
if [[ -n "$release_placeholders" ]]; then
  echo "Release-facing placeholder markers found:" >&2
  echo "$release_placeholders" >&2
  exit 1
fi

grep_file "$ROOT/plugins/android-cli-tools/skills/android-cli-base/SKILL.md" \
  'Android CLI workflows' \
  "android-cli-base description must front-load Android CLI workflows"
grep_file "$ROOT/plugins/android-build-and-release/skills/agp-9-upgrade/SKILL.md" \
  'AGP 9|Android Gradle Plugin' \
  "agp-9-upgrade must mention AGP 9 migration"
grep_file "$ROOT/plugins/android-build-and-release/skills/play-billing-library-version-upgrade/SKILL.md" \
  'Play Billing Library|PBL' \
  "play-billing-library-version-upgrade must mention Play Billing Library"
grep_file "$ROOT/plugins/android-build-and-release/skills/r8-analyzer/SKILL.md" \
  'R8/ProGuard keep rules' \
  "r8-analyzer description must front-load R8/ProGuard keep rules"
grep_file "$ROOT/plugins/android-ui-migration/skills/edge-to-edge/SKILL.md" \
  'edge-to-edge Compose insets' \
  "edge-to-edge description must front-load edge-to-edge Compose insets"
grep_file "$ROOT/plugins/android-ui-migration/skills/migrate-xml-views-to-jetpack-compose/SKILL.md" \
  'XML View.*Compose|XML layout.*Compose|XML View to Jetpack' \
  "migrate-xml-views-to-jetpack-compose must mention XML View to Compose migration"
grep_file "$ROOT/plugins/android-ui-migration/skills/navigation-3/SKILL.md" \
  'Navigation 3' \
  "navigation-3 must mention Navigation 3"
grep_file "$ROOT/plugins/android-ui-migration/skills/camera1-to-camerax/SKILL.md" \
  'Camera1' \
  "camera1-to-camerax must mention Camera1"
grep_file "$ROOT/plugins/android-ui-migration/skills/camera1-to-camerax/SKILL.md" \
  'Camera2' \
  "camera1-to-camerax must mention Camera2"
grep_file "$ROOT/plugins/android-ui-migration/skills/camera1-to-camerax/SKILL.md" \
  'CameraX' \
  "camera1-to-camerax must mention CameraX"
grep_file "$ROOT/plugins/android-xr-glimmer/skills/display-ai-glasses-with-jetpack-compose-glimmer/SKILL.md" \
  'Android XR|Display AI Glasses|Glimmer' \
  "xr glimmer skill must mention Android XR, Display AI Glasses, or Glimmer"

echo "Codex plugin validation passed."
