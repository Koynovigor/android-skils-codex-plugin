# Agent Skills for Codex

This plugin packages the upstream `agent-skills` engineering methodology as a
Codex plugin. It provides lifecycle skills for idea refinement, specification,
planning, implementation, testing, review, hardening, documentation, and launch.

The source material is from `addyosmani/agent-skills` and is licensed under MIT.
This repository packages it for the `Codex Dev Forge` marketplace.

## What Codex Gets

- 22 skills under `skills/`.
- Shared checklists under `references/`.
- Three specialist persona prompts under `agents/`.
- Codex-specific routing and subagent guidance in `AGENTS.md`.

## Lifecycle Skills

| Phase | Skills |
|-------|--------|
| Meta | `using-agent-skills` |
| Define | `idea-refine`, `spec-driven-development` |
| Plan | `planning-and-task-breakdown` |
| Build | `incremental-implementation`, `context-engineering`, `source-driven-development`, `doubt-driven-development`, `frontend-ui-engineering`, `api-and-interface-design` |
| Verify | `test-driven-development`, `browser-testing-with-devtools`, `debugging-and-error-recovery` |
| Review | `code-review-and-quality`, `code-simplification`, `security-and-hardening`, `performance-optimization` |
| Ship | `git-workflow-and-versioning`, `ci-cd-and-automation`, `deprecation-and-migration`, `documentation-and-adrs`, `shipping-and-launch` |

## Codex Usage

After installing this plugin, start a new Codex thread and use natural-language
prompts. Codex discovers skills through `name` and `description` metadata and
loads full skill instructions only when a skill is relevant.

Example prompts:

```text
Use Agent Skills to turn this idea into a spec.
Break this spec into implementation tasks.
Build this feature incrementally with tests.
Debug this failing test systematically.
Review this change across code quality, tests, and security.
Prepare this project for launch.
```

## Subagent Personas

The `agents/` directory contains:

- `code-reviewer.md`
- `security-auditor.md`
- `test-engineer.md`

Use these as focused review prompts when a task, skill, risk profile, or project
rule calls for specialist review. A fresh user request is not required for every
subagent pass after the plugin is active, as long as the current Codex runtime
and tool policy permit subagents. The main agent should keep ownership of final
synthesis, wait for requested subagent results, and close subagent threads after
processing their findings.

For large tasks, always run a read-only `security-auditor`
critical-vulnerability review before final handoff, even when the change does
not look security-focused at first glance. Also run at least one P0/P1 reviewer
pass for correctness, release-safety, privacy, and integration risk. For
security-sensitive work, include `security-auditor` regardless of task size and
focus on critical vulnerabilities, credential exposure, authorization bypasses,
unsafe dependencies or release changes, and data leaks.

## Unsupported Upstream Surfaces

The upstream repository also contains Claude/Gemini slash commands and hooks.
Those files are not installed as active Codex commands or hooks in this plugin.
Their workflow intent is represented through the bundled skills and the
Codex-specific `AGENTS.md` guidance.

## References

Shared reference files are kept at plugin root under `references/`. Skills refer
to them by relative path and should read only the needed reference for the active
task.

## License

Bundled upstream content is MIT licensed. See `LICENSE`.
