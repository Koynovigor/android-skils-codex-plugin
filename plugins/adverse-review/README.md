# Adverse Review Codex Plugin

This plugin packages the upstream
[`addyosmani/adverse`](https://github.com/addyosmani/adverse) adversarial code
review tool for Codex.

It includes one Codex skill, `adverse-review`, plus the upstream Node.js CLI
core. The skill routes Codex to a three-lens review panel:

- `auditor`: correctness, logic, and algorithmic soundness.
- `adversary`: security, abuse, and trust boundaries.
- `pragmatist`: maintainability, complexity, and design fit.

The plugin adapts upstream Claude Code instructions into Codex-native behavior.
Unsupported upstream command and hook surfaces are not installed. The Codex App
workflow is primary: when Codex subagents are available and permitted, the skill
uses native Codex subagent orchestration for the reviewer panel and uses the
bundled Node helpers only for deterministic collection and synthesis. The CLI is
a fallback for shell or CI-like environments where a subprocess coding agent is
known to work.
If the active Codex tool policy requires explicit permission before subagents,
the skill must ask before starting the reviewer panel.

## What Is Bundled

- `.codex-plugin/plugin.json`: Codex plugin manifest.
- `skills/adverse-review/SKILL.md`: Codex routing and execution workflow.
- `skills/adverse-review/scripts/`: deterministic collection, combination, and
  synthesis bridge scripts.
- `skills/adverse-review/scripts/prompts/`: persona and round prompts.
- `src/` and `bin/adverse.mjs`: upstream standalone CLI implementation.
- `tests/`: upstream Node test suite and CLI fixture agents.
- `UPSTREAM.md`: upstream README snapshot.
- `LICENSE`: upstream MIT license.

## Runtime

Requires Node.js 20 or newer. The bundled CLI has no runtime dependencies.

Example local CLI use from this plugin root:

```bash
node bin/adverse.mjs personas
node bin/adverse.mjs review . --agent "codex exec --sandbox read-only -c approval_policy=never -"
```

For git targets, `review .` defaults to uncommitted changes against `HEAD` when
the target has any, including reviewable untracked text files. Use `--diff
[base]` for an explicit branch/base diff and `--full-tree` when the user
explicitly wants a full directory review instead.

The skill should summarize reports and ask before applying fixes.
