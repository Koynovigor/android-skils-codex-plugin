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
perl -0pi -e 's/^description: Analyzes Android build files and R8 keep rules to identify redundancies,\n  broad package-wide rules, and rules that subsume library consumer keep rules\. Use\n  when developers want to optimize their app'\''s size, remove redundant or overly broad\n  keep rules, or troubleshoot Proguard configurations\.$/description: R8\/ProGuard keep rules analysis for Android build files to identify\n  redundancies, broad package-wide rules, and rules that subsume library consumer\n  keep rules. Use when developers want to optimize app size, remove redundant or\n  overly broad keep rules, or troubleshoot ProGuard configurations./m; s/^  - \\\[ \\\] Step 4:/- \\\[ \\\] Step 4:/m' "$ROOT/plugins/android-build-and-release/skills/r8-analyzer/SKILL.md"
perl -0pi -e 's/^description: Use this skill to migrate your Jetpack Compose app to add adaptive edge-to-edge\n  support and troubleshoot common issues\. Use this skill to fix UI components \(like\n  buttons or lists\) that are obscured by or overlapping with the navigation bar or\n  status bar, fix IME insets, and fix system bar legibility\.$/description: edge-to-edge Compose insets migration for Jetpack Compose apps that need\n  adaptive edge-to-edge support and troubleshooting. Use this skill to fix UI\n  components obscured by or overlapping with the navigation bar or status bar, fix\n  IME insets, and fix system bar legibility./m; s/- \\\[\\\]/- \\\[ \\\]/g' "$ROOT/plugins/android-ui-migration/skills/edge-to-edge/SKILL.md"
