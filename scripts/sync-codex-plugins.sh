#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_ROOT="${SOURCE_ROOT:-}"

if [[ -z "$SOURCE_ROOT" ]]; then
  echo "SOURCE_ROOT must point to an upstream Android Skills extraction." >&2
  echo "Example: SOURCE_ROOT=/tmp/android-skills-upstream scripts/sync-codex-plugins.sh" >&2
  exit 1
fi

if [[ ! -d "$SOURCE_ROOT" ]]; then
  echo "SOURCE_ROOT does not exist or is not a directory: $SOURCE_ROOT" >&2
  exit 1
fi

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

add_perfetto_download_guardrail() {
  local target_file="$1"

  perl -0pi -e 's/(\> \*\*Important:\*\* The file served at this URL is a `~10KB` Python wrapper script\. Don'\''t assume the download failed because it is human-readable text\. This is the intended behavior\. This script handles lazy-loading the precompiled binary automatically on its first run\. Use it directly\.)/$1\n\n> **Codex security guardrail:** Do not download, mark executable, or run `trace_processor` unless the user has explicitly approved this live download and execution in the current thread. Before asking, explain that `https:\/\/get.perfetto.dev\/trace_processor` is an official Perfetto wrapper that can lazy-load a precompiled binary on first run, that it is not pinned by this skill, and that the user may instead provide a preinstalled trusted `trace_processor` path. If approval is denied or unavailable, stop before running SQL and provide the exact command the user can run after installing a trusted local copy./m' "$ROOT/$target_file"
}

remove_obsolete_skill() {
  local target_dir="$1"

  rm -rf "$ROOT/$target_dir"
}

copy_skill "devtools/android-cli" "plugins/android-cli-tools/skills/android-cli-base"
copy_skill "device-ai/appfunctions" "plugins/android-app-capabilities/skills/appfunctions"
copy_skill "identity/verified-email" "plugins/android-app-capabilities/skills/verified-email"
copy_skill "play/engage-sdk-integration" "plugins/android-app-capabilities/skills/engage-sdk-integration"
copy_skill "build/agp/agp-9-upgrade" "plugins/android-build-and-release/skills/agp-9-upgrade"
copy_skill "play/play-billing-library-version-upgrade" "plugins/android-build-and-release/skills/play-billing-library-version-upgrade"
copy_skill "performance/r8-analyzer" "plugins/android-build-and-release/skills/r8-analyzer"
copy_skill "profilers/perfetto-sql" "plugins/android-build-and-release/skills/perfetto-sql"
copy_skill "profilers/perfetto-trace-analysis" "plugins/android-build-and-release/skills/perfetto-trace-analysis"
copy_skill "testing/testing-setup" "plugins/android-build-and-release/skills/testing-setup"
copy_skill "system/edge-to-edge" "plugins/android-ui-migration/skills/edge-to-edge"
copy_skill "jetpack-compose/adaptive" "plugins/android-ui-migration/skills/adaptive"
copy_skill "jetpack-compose/theming/styles" "plugins/android-ui-migration/skills/styles"
copy_skill "jetpack-compose/migration/migrate-xml-views-to-jetpack-compose" "plugins/android-ui-migration/skills/migrate-xml-views-to-jetpack-compose"
copy_skill "navigation/navigation-3" "plugins/android-ui-migration/skills/navigation-3"
copy_skill "camera/camera1-to-camerax" "plugins/android-ui-migration/skills/camera1-to-camerax"
copy_skill "xr/display-glasses-with-jetpack-compose-glimmer" "plugins/android-xr-glimmer/skills/display-glasses-with-jetpack-compose-glimmer"
remove_obsolete_skill "plugins/android-xr-glimmer/skills/display-ai-glasses-with-jetpack-compose-glimmer"

perl -0pi -e 's/^name: android-cli$/name: android-cli-base/m; s/^description: Orchestrates Android development tasks including project creation, deployment, SDK management, and environment diagnostics using the `android` command-line tool\.$/description: Use this skill for Android CLI workflows including project creation, deployment, SDK management, emulator management, device interaction, screenshots, layout inspection, Android documentation lookup, environment diagnostics, and Android CLI task orchestration./m' "$ROOT/plugins/android-cli-tools/skills/android-cli-base/SKILL.md"
perl -0pi -e 's/^description: Analyzes Android build files and R8 keep rules to identify redundancies,\n  broad package-wide rules, and rules that subsume library consumer keep rules\. Use\n  when developers want to optimize their app'\''s size, remove redundant or overly broad\n  keep rules, or troubleshoot Proguard configurations\.$/description: R8\/ProGuard keep rules analysis for Android build files to identify\n  redundancies, broad package-wide rules, and rules that subsume library consumer\n  keep rules. Use when developers want to optimize app size, remove redundant or\n  overly broad keep rules, or troubleshoot ProGuard configurations./m; s/^  - \\\[ \\\] Step 4:/- \\\[ \\\] Step 4:/m' "$ROOT/plugins/android-build-and-release/skills/r8-analyzer/SKILL.md"
perl -0pi -e 's/^description: Use this skill to migrate your Jetpack Compose app to add adaptive edge-to-edge\n  support and troubleshoot common issues\. Use this skill to fix UI components \(like\n  buttons or lists\) that are obscured by or overlapping with the navigation bar or\n  status bar, fix IME insets, and fix system bar legibility\.$/description: edge-to-edge Compose insets migration for Jetpack Compose apps that need\n  adaptive edge-to-edge support and troubleshooting. Use this skill to fix UI\n  components obscured by or overlapping with the navigation bar or status bar, fix\n  IME insets, and fix system bar legibility./m; s/- \\\[\\\]/- \\\[ \\\]/g' "$ROOT/plugins/android-ui-migration/skills/edge-to-edge/SKILL.md"
perl -0pi -e 's/Leave a TODO for developers to handle the app'\''s server-side validation and parsing\./Leave a clearly marked follow-up note for developers to handle the app'\''s server-side validation and parsing./m' "$ROOT/plugins/android-app-capabilities/skills/verified-email/SKILL.md"
add_perfetto_download_guardrail "plugins/android-build-and-release/skills/perfetto-sql/SKILL.md"
add_perfetto_download_guardrail "plugins/android-build-and-release/skills/perfetto-trace-analysis/references/sql.md"
