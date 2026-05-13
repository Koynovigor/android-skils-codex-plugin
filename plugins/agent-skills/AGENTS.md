# Agent Skills Plugin Guidance

This plugin adapts the upstream `agent-skills` methodology for Codex.

## Skill Routing

At the start of substantial engineering work, prefer `using-agent-skills` to
choose the right workflow. Route user intent to bundled skills by phase:

- Vague idea or product direction: `idea-refine`.
- New project, feature, or significant change without a spec:
  `spec-driven-development`.
- Existing spec or clear requirements that need executable work items:
  `planning-and-task-breakdown`.
- Multi-file implementation: `incremental-implementation`.
- Logic changes, bug fixes, or behavior changes: `test-driven-development`.
- Broken tests, builds, or unexpected behavior:
  `debugging-and-error-recovery`.
- UI work: `frontend-ui-engineering`.
- API, module, or public contract design: `api-and-interface-design`.
- Framework or library work where docs may have changed:
  `source-driven-development`.
- Code review: `code-review-and-quality`.
- Security-sensitive changes: `security-and-hardening`.
- Performance work: `performance-optimization`.
- Git, CI/CD, docs, migrations, or launch work: use the corresponding bundled
  lifecycle skill.

## Codex Tool Adaptation

Some upstream skill text names tools from other agents. In Codex, map intent to
available Codex tools instead of treating those names literally:

- `Read`: use normal file reads such as `sed`, `rg`, `jq`, or Codex file tools.
- `Grep`: use `rg`.
- `Glob`: use `rg --files` or `find`.
- `AskUserQuestion`: ask one concise question in chat only when repository
  context cannot answer it safely.
- `/spec`, `/plan`, `/build`, `/test`, `/review`, `/ship`: these are lifecycle
  entry points from other harnesses. In Codex, invoke or follow the matching
  bundled skills directly.
- `/mnt/skills/user/<skill>/scripts/...`: resolve to the installed skill
  directory under this plugin when the script exists.

Do not install upstream `.claude/commands`, `.gemini/commands`, or upstream
hooks as active Codex commands or hooks unless a future milestone explicitly
adds a Codex-supported command or hook surface.

## Subagent Personas

This plugin bundles three specialist persona prompts under `agents/`:

- `code-reviewer.md`
- `security-auditor.md`
- `test-engineer.md`

Use them as prompt material for Codex subagent review passes when the task,
active skill, risk profile, or project guidance calls for a specialist pass.
Do not require a fresh user request for every subagent. Installing and invoking
this plugin is durable guidance to use subagents when they materially improve
quality, subject to the active Codex runtime and tool policy.

## Risk-Based Subagent Triggers

Spawn subagents proactively when permitted by the active runtime:

- After a large implementation, cross-module change, major refactor, release
  workflow change, marketplace packaging change, migration, or launch task.
- When an active skill calls for fresh-context review, adversarial review,
  independent test design, source verification, or specialist review.
- When the change touches authentication, authorization, secrets, payments,
  permissions, networking, dependency management, supply-chain configuration,
  release automation, user data, or untrusted input.
- When parallel read-only exploration can reduce risk without blocking the main
  agent's immediate next step.

Large-task critical-vulnerability review is mandatory. For large tasks, always
run a read-only `security-auditor`
critical-vulnerability review before the final answer, even when the change does
not look security-focused at first glance. The security pass must look for
critical vulnerabilities, credential exposure, authorization bypasses, injection
paths, unsafe dependency or release changes, and data-leak risks. Also run at
least one P0/P1 reviewer pass for correctness, release-safety, privacy, and
integration risk. For behavior-heavy or test-sensitive tasks, include
`test-engineer`.

For security-sensitive tasks, run `security-auditor` regardless of task size.

When using subagents:

- The main agent owns architecture, implementation sequencing, final synthesis,
  validation, and user communication.
- Spawn subagents only for independent work that can run in parallel without
  blocking the main agent's immediate next step.
- Do not delegate urgent critical-path work when the main agent needs the result
  before doing anything else.
- Give each subagent a bounded task, expected output, relevant files, and clear
  read/write ownership.
- For review passes, prefer read-only prompts and ask for P0/P1 issues first.
- Wait for requested subagent results before producing the final consolidated
  answer.
- Do not interrupt a running subagent unless the user changes scope, the result
  is no longer needed, or the subagent is clearly stuck.
- Close subagent threads after their results are processed.
- Personas do not invoke other personas. Composition belongs to the main agent
  or the user's explicit instruction.
- If the active Codex surface or tool policy blocks subagent use, do the closest
  local P0/P1 review and state that the subagent gate was unavailable.

These rules follow Codex subagent behavior: subagent workflows are deliberate,
Codex waits for requested results, and the main agent consolidates output.

## Source Boundaries

The bundled skill and persona content comes from `../agent-skills`. Keep upstream
metadata and MIT licensing intact. When refreshing the plugin, copy from a clean
upstream extraction and then reapply Codex-specific adaptation in this file and
any intentionally patched skill text.
