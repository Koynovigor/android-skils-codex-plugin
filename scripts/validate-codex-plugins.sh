#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MARKETPLACE="$ROOT/.agents/plugins/marketplace.json"
PLUGINS=(
  android-cli-tools
  android-app-capabilities
  android-build-and-release
  android-ui-migration
  android-xr-glimmer
  agent-skills
  adverse-review
)
LEGACY_ROOTS=(
  android-cli
  build
  camera
  device-ai
  devtools
  identity
  jetpack-compose
  navigation
  performance
  play
  profilers
  system
  testing
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
  .name == "codex-dev-forge" and
  .interface.displayName and
  (.plugins | length == 7)
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

  if [[ "$plugin" == "agent-skills" ]]; then
    jq -e --arg plugin "$plugin" '
      .name == $plugin and
      .version and
      .description and
      .license == "MIT" and
      .skills == "./skills/" and
      .interface.displayName == "Agent Skills" and
      .interface.shortDescription and
      .interface.longDescription and
      .interface.category == "Coding" and
      .interface.composerIcon == "./assets/icon.svg" and
      .interface.logo == "./assets/icon.svg"
    ' "$manifest" >/dev/null

    [[ -d "$ROOT/plugins/$plugin/agents" ]] ||
      fail "Missing agent personas directory: $ROOT/plugins/$plugin/agents"
    [[ -f "$ROOT/plugins/$plugin/AGENTS.md" ]] ||
      fail "Missing Codex plugin guidance: $ROOT/plugins/$plugin/AGENTS.md"
    [[ -f "$ROOT/plugins/$plugin/LICENSE" ]] ||
      fail "Missing upstream license: $ROOT/plugins/$plugin/LICENSE"
  elif [[ "$plugin" == "adverse-review" ]]; then
    jq -e --arg plugin "$plugin" '
      .name == $plugin and
      .version and
      .description and
      .license == "MIT" and
      .skills == "./skills/" and
      .interface.displayName == "Adverse Review" and
      .interface.shortDescription and
      .interface.longDescription and
      .interface.category == "Coding" and
      .interface.composerIcon == "./assets/icon.svg" and
      .interface.logo == "./assets/icon.svg"
    ' "$manifest" >/dev/null

    [[ -f "$ROOT/plugins/$plugin/AGENTS.md" ]] ||
      fail "Missing Codex plugin guidance: $ROOT/plugins/$plugin/AGENTS.md"
    [[ -f "$ROOT/plugins/$plugin/LICENSE" ]] ||
      fail "Missing upstream license: $ROOT/plugins/$plugin/LICENSE"
    [[ -f "$ROOT/plugins/$plugin/UPSTREAM.md" ]] ||
      fail "Missing upstream README snapshot: $ROOT/plugins/$plugin/UPSTREAM.md"
    [[ -f "$ROOT/plugins/$plugin/package.json" ]] ||
      fail "Missing upstream package metadata: $ROOT/plugins/$plugin/package.json"
    [[ -f "$ROOT/plugins/$plugin/bin/adverse.mjs" ]] ||
      fail "Missing upstream CLI entrypoint: $ROOT/plugins/$plugin/bin/adverse.mjs"
    [[ -d "$ROOT/plugins/$plugin/src" ]] ||
      fail "Missing upstream CLI source directory: $ROOT/plugins/$plugin/src"
    [[ -d "$ROOT/plugins/$plugin/tests" ]] ||
      fail "Missing upstream test suite: $ROOT/plugins/$plugin/tests"
    [[ -f "$ROOT/plugins/$plugin/skills/adverse-review/scripts/prompts/auditor.txt" ]] ||
      fail "Missing adverse auditor persona prompt"
    [[ -f "$ROOT/plugins/$plugin/skills/adverse-review/scripts/prompts/adversary.txt" ]] ||
      fail "Missing adverse adversary persona prompt"
    [[ -f "$ROOT/plugins/$plugin/skills/adverse-review/scripts/prompts/pragmatist.txt" ]] ||
      fail "Missing adverse pragmatist persona prompt"
  else
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
  fi

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
  echo "Unexpected plugin configs for skills-only marketplace release:" >&2
  echo "$unexpected_plugin_configs" >&2
  exit 1
fi

skill_count="$(find "$ROOT/plugins" -name SKILL.md | wc -l | tr -d '[:space:]')"
if [[ "$skill_count" != "40" ]]; then
  fail "Expected 40 packaged skills, found $skill_count"
fi

reference_count="$(find "$ROOT/plugins" -path '*/references/*' -type f | wc -l | tr -d '[:space:]')"
if [[ "$reference_count" != "153" ]]; then
  fail "Expected 153 packaged reference files, found $reference_count"
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

destructive_git_guidance="$(
  find "$ROOT/plugins" -name SKILL.md -print0 |
    xargs -0 grep -HnE 'git reset --hard|git checkout --|git clean -fd|rm -rf' || true
)"
if [[ -n "$destructive_git_guidance" ]]; then
  echo "Packaged skills must not recommend destructive recovery commands:" >&2
  echo "$destructive_git_guidance" >&2
  exit 1
fi

release_placeholders="$(
  find "$ROOT/plugins" -name SKILL.md -print0 | xargs -0 grep -HnE '(^|[^[:alnum:]_])(TODO|TBD|FIXME)([^[:alnum:]_]|$)' || true
  grep -R -nE '(^|[^[:alnum:]_])(TODO|TBD|FIXME)([^[:alnum:]_]|$)' "$ROOT/.agents" "$ROOT/README.md" "$ROOT/docs" 2>/dev/null || true
)"
if [[ -n "$release_placeholders" ]]; then
  echo "Release-facing placeholder markers found:" >&2
  echo "$release_placeholders" >&2
  exit 1
fi

hardcoded_initial_version_refs="$(
  grep -R -nE 'v0\.0\.4|0\.0\.4' "$ROOT/README.md" "$ROOT/docs" 2>/dev/null || true
)"
if [[ -n "$hardcoded_initial_version_refs" ]]; then
  echo "Public docs must not hard-code the initial release version; use latest, <release-tag>, or GitHub release links:" >&2
  echo "$hardcoded_initial_version_refs" >&2
  exit 1
fi

grep_file "$ROOT/plugins/android-cli-tools/skills/android-cli-base/SKILL.md" \
  'Android CLI workflows' \
  "android-cli-base description must front-load Android CLI workflows"
grep_file "$ROOT/plugins/android-app-capabilities/skills/appfunctions/SKILL.md" \
  'AppFunctions|on-device' \
  "appfunctions must mention AppFunctions or on-device workflows"
grep_file "$ROOT/plugins/android-app-capabilities/skills/verified-email/SKILL.md" \
  'verified email|Credential Manager|Digital Credentials' \
  "verified-email must mention verified email, Credential Manager, or Digital Credentials"
grep_file "$ROOT/plugins/android-app-capabilities/skills/engage-sdk-integration/SKILL.md" \
  'Play Engage SDK|Engage SDK' \
  "engage-sdk-integration must mention Play Engage SDK"
grep_file "$ROOT/plugins/android-build-and-release/skills/agp-9-upgrade/SKILL.md" \
  'AGP 9|Android Gradle Plugin' \
  "agp-9-upgrade must mention AGP 9 migration"
grep_file "$ROOT/plugins/android-build-and-release/skills/play-billing-library-version-upgrade/SKILL.md" \
  'Play Billing Library|PBL' \
  "play-billing-library-version-upgrade must mention Play Billing Library"
grep_file "$ROOT/plugins/android-build-and-release/skills/r8-analyzer/SKILL.md" \
  'R8/ProGuard keep rules' \
  "r8-analyzer description must front-load R8/ProGuard keep rules"
grep_file "$ROOT/plugins/android-build-and-release/skills/perfetto-sql/SKILL.md" \
  'Perfetto SQL|trace_processor|Android Perfetto' \
  "perfetto-sql must mention Perfetto SQL, trace_processor, or Android Perfetto"
grep_file "$ROOT/plugins/android-build-and-release/skills/perfetto-sql/SKILL.md" \
  'Codex security guardrail.*explicitly approved this live download and execution' \
  "perfetto-sql must require explicit approval before live trace_processor download and execution"
grep_file "$ROOT/plugins/android-build-and-release/skills/perfetto-trace-analysis/SKILL.md" \
  'Perfetto traces|trace analysis|latency|jank' \
  "perfetto-trace-analysis must mention Perfetto traces, trace analysis, latency, or jank"
grep_file "$ROOT/plugins/android-build-and-release/skills/perfetto-trace-analysis/references/sql.md" \
  'Codex security guardrail.*explicitly approved this live download and execution' \
  "perfetto-trace-analysis SQL reference must require explicit approval before live trace_processor download and execution"
grep_file "$ROOT/plugins/android-build-and-release/skills/testing-setup/SKILL.md" \
  'testing strategy|unit tests|UI tests|screenshot tests' \
  "testing-setup must mention Android testing strategy or test types"
grep_file "$ROOT/plugins/android-ui-migration/skills/edge-to-edge/SKILL.md" \
  'edge-to-edge Compose insets' \
  "edge-to-edge description must front-load edge-to-edge Compose insets"
grep_file "$ROOT/plugins/android-ui-migration/skills/adaptive/SKILL.md" \
  'adaptive|MediaQuery|Grid|FlexBox' \
  "adaptive must mention adaptive UI, MediaQuery, Grid, or FlexBox"
grep_file "$ROOT/plugins/android-ui-migration/skills/styles/SKILL.md" \
  'Compose Styles API|Modifier.styleable|styleable' \
  "styles must mention Compose Styles API or styleable components"
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
grep_file "$ROOT/plugins/android-xr-glimmer/skills/display-glasses-with-jetpack-compose-glimmer/SKILL.md" \
  'Android XR|display glasses|Glimmer' \
  "xr glimmer skill must mention Android XR, display glasses, or Glimmer"
grep_file "$ROOT/plugins/agent-skills/skills/using-agent-skills/SKILL.md" \
  'Codex Adaptation' \
  "using-agent-skills must include Codex adaptation guidance"
grep_file "$ROOT/plugins/agent-skills/AGENTS.md" \
  'Subagent Personas' \
  "agent-skills AGENTS.md must describe subagent persona usage"
grep_file "$ROOT/plugins/agent-skills/AGENTS.md" \
  'Risk-Based Subagent Triggers' \
  "agent-skills AGENTS.md must describe risk-based subagent triggers"
grep_file "$ROOT/plugins/agent-skills/skills/using-agent-skills/SKILL.md" \
  'Large-task critical-vulnerability review is mandatory' \
  "using-agent-skills must require security-auditor critical-vulnerability review for large tasks"
grep_file "$ROOT/plugins/agent-skills/AGENTS.md" \
  'Large-task critical-vulnerability review is mandatory' \
  "agent-skills AGENTS.md must require security-auditor critical-vulnerability review for large tasks"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'Adversarial multi-perspective code review for Codex' \
  "adverse-review skill description must front-load Codex adversarial review routing"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'running inside Codex App or another Codex surface' \
  "adverse-review skill must prefer native Codex orchestration before CLI fallback"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'critical-vulnerability' \
  "adverse-review skill must mention critical-vulnerability checks"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'Codex subagents' \
  "adverse-review skill must include Codex subagent adaptation guidance"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'Subagent Permission Gate' \
  "adverse-review skill must ask for subagent permission when required by tool policy"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'Do not enter Phase 2' \
  "adverse-review skill must hard-stop before Phase 2 when subagent permission is required"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'May I use Codex subagents' \
  "adverse-review skill must provide an explicit subagent permission prompt"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'single-agent local review' \
  "adverse-review skill must define the no-subagents degraded local review path"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'CLI fallback' \
  "adverse-review skill must include CLI fallback guidance"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'diff truncated to fit context budget' \
  "adverse-review skill must define batched review handling for truncated source"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'close each subagent' \
  "adverse-review skill must close reviewer subagents after processing results"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'mktemp -d' \
  "adverse-review skill must use a per-run private temp directory"
grep_file "$ROOT/plugins/adverse-review/skills/adverse-review/SKILL.md" \
  'records every reviewable file' \
  "adverse-review skill must document complete files.json coverage for truncation recovery"
grep_file "$ROOT/plugins/adverse-review/AGENTS.md" \
  'Codex Adaptation' \
  "adverse-review AGENTS.md must describe Codex adaptation"
grep_file "$ROOT/plugins/adverse-review/AGENTS.md" \
  'Do not apply fixes' \
  "adverse-review AGENTS.md must prohibit automatic remediation"
grep_file "$ROOT/docs/codex-marketplace-install.md" \
  'Existing Android Skills Installs' \
  "install guide must describe migration from android-skills-codex to codex-dev-forge"
grep_file "$ROOT/docs/codex-marketplace-install.md" \
  'android-skills-codex' \
  "install guide migration guidance must mention the old marketplace id"
grep_file "$ROOT/docs/codex-marketplace-install.md" \
  'codex-dev-forge' \
  "install guide migration guidance must mention the new marketplace id"
grep_file "$ROOT/docs/release-process.md" \
  'Codex App path before CLI fallback' \
  "release process must validate the Adverse Review Codex App path before CLI fallback"
grep_file "$ROOT/docs/release-process.md" \
  'current Codex behavior' \
  "release process must document current adverse-review Codex behavior"
grep_file "$ROOT/docs/release-process.md" \
  'Subprocess output and collected source are bounded' \
  "release process must document bounded adverse-review runtime behavior"

echo "Codex plugin validation passed."
