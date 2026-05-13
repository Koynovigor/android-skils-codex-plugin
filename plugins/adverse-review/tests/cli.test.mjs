// End-to-end CLI smoke tests via subprocess. Uses fake-agent.mjs to simulate
// a coding agent so no real model is spawned.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const BIN = path.join(ROOT, 'bin', 'adverse.mjs');
const COLLECT_SCRIPT = path.join(ROOT, 'skills', 'adverse-review', 'scripts', 'collect.mjs');
const FAKE = path.join(ROOT, 'tests', 'fixtures', 'fake-agent.mjs');
const FLAKY = path.join(ROOT, 'tests', 'fixtures', 'flaky-agent.mjs');

function freshTmp() {
  return mkdtempSync(path.join(tmpdir(), 'adverse-cli-'));
}

function buildBuggyTarget() {
  const dir = freshTmp();
  writeFileSync(path.join(dir, 'auth.py'),
    "import hashlib\n\n" +
    "def hash_password(p, salt=''):\n" +
    "    return hashlib.md5((p+salt).encode()).hexdigest()\n\n" +
    "def check_user(name, conn):\n" +
    "    q = \"SELECT * FROM users WHERE name = '\" + name + \"'\"\n" +
    "    return conn.execute(q).fetchone()\n");
  return dir;
}

function runCli(args, opts = {}) {
  return spawnSync('node', [BIN, ...args], {
    cwd: ROOT, encoding: 'utf-8', timeout: 60_000, ...opts,
  });
}

function git(repo, ...args) {
  execFileSync('git', ['-C', repo, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
}

function mode(filePath) {
  return statSync(filePath).mode & 0o777;
}

function buildGitReviewTarget() {
  const dir = freshTmp();
  git(dir, 'init', '-q');
  git(dir, 'config', 'user.email', 't@t.t');
  git(dir, 'config', 'user.name', 'Test');
  git(dir, 'config', 'commit.gpgsign', 'false');
  writeFileSync(path.join(dir, 'a.py'), 'x = 1\n');
  git(dir, 'add', 'a.py');
  git(dir, 'commit', '-q', '-m', 'initial');
  writeFileSync(path.join(dir, 'a.py'), 'x = 1\ny = 2\n');
  return dir;
}

test('full pipeline produces a report', () => {
  const target = buildBuggyTarget();
  try {
    const r = runCli(['review', target, '--agent', `node ${FAKE}`]);
    assert.ok(r.status === 0 || r.status === 1, `unexpected status ${r.status}: ${r.stderr}`);
    assert.match(r.stdout, /Adversarial Code Review/);
    assert.match(r.stdout, /Reviewer verdicts/);
    for (const persona of ['auditor', 'adversary', 'pragmatist']) {
      assert.match(r.stdout, new RegExp(persona));
    }
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('--out, --json-out, --html-out write to disk', () => {
  const target = buildBuggyTarget();
  const out = freshTmp();
  try {
    const r = runCli([
      'review', target, '--agent', `node ${FAKE}`,
      '--out', path.join(out, 'report.md'),
      '--json-out', path.join(out, 'report.json'),
      '--html-out', path.join(out, 'report.html'),
    ]);
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
    assert.ok(existsSync(path.join(out, 'report.md')));
    assert.ok(existsSync(path.join(out, 'report.json')));
    assert.ok(existsSync(path.join(out, 'report.html')));
    const json = JSON.parse(readFileSync(path.join(out, 'report.json'), 'utf-8'));
    assert.equal(typeof json.consensus_label, 'string');
    assert.ok(Array.isArray(json.findings));
    const html = readFileSync(path.join(out, 'report.html'), 'utf-8');
    assert.match(html, /<!doctype html>/i);
    assert.match(html, /Adversarial Code Review/);
  } finally {
    rmSync(target, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test('--single-round skips round 2', () => {
  const target = buildBuggyTarget();
  try {
    const r = runCli(['review', target, '--agent', `node ${FAKE}`, '--single-round']);
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
    assert.ok(!r.stderr.toLowerCase().includes('round 2'));
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('--diff without value reviews uncommitted changes', () => {
  const target = buildGitReviewTarget();
  try {
    const r = runCli([
      'review', target, '--diff', '--single-round', '--agent', `node ${FAKE}`,
    ]);
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
    assert.match(r.stderr, /diff vs HEAD/);
    assert.match(r.stdout, /Adversarial Code Review/);
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('review defaults to uncommitted git diff when present', () => {
  const target = buildGitReviewTarget();
  const artifacts = freshTmp();
  try {
    writeFileSync(path.join(target, 'new.py'), 'z = 3\n');

    const r = runCli([
      'review', target, '--single-round', '--agent', `node ${FAKE}`,
      '--save-artifacts', artifacts,
    ]);
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
    assert.match(r.stderr, /diff vs HEAD/);

    const source = readFileSync(path.join(artifacts, 'source.txt'), 'utf-8');
    assert.match(source, /unified git diff/i);
    assert.match(source, /\+y = 2/);
    assert.match(source, /new\.py/);
    assert.match(source, /new file mode/);
    assert.doesNotMatch(source, /=== FILE:/);
  } finally {
    rmSync(target, { recursive: true, force: true });
    rmSync(artifacts, { recursive: true, force: true });
  }
});

test('--full-tree forces directory review when git changes exist', () => {
  const target = buildGitReviewTarget();
  const artifacts = freshTmp();
  try {
    const r = runCli([
      'review', target, '--full-tree', '--single-round', '--agent', `node ${FAKE}`,
      '--save-artifacts', artifacts,
    ]);
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
    assert.match(r.stderr, /files in/);

    const source = readFileSync(path.join(artifacts, 'source.txt'), 'utf-8');
    assert.match(source, /=== FILE: a\.py ===/);
    assert.doesNotMatch(source, /unified git diff/i);
  } finally {
    rmSync(target, { recursive: true, force: true });
    rmSync(artifacts, { recursive: true, force: true });
  }
});

test('--diff respects a file target path', () => {
  const target = buildGitReviewTarget();
  const artifacts = freshTmp();
  try {
    writeFileSync(path.join(target, 'b.py'), 'z = 1\n');
    git(target, 'add', 'b.py');
    git(target, 'commit', '-q', '-m', 'add b');
    writeFileSync(path.join(target, 'a.py'), 'x = 1\ny = 2\n');
    writeFileSync(path.join(target, 'b.py'), 'z = 2\n');

    const r = runCli([
      'review', path.join(target, 'a.py'), '--diff', '--single-round',
      '--agent', `node ${FAKE}`, '--save-artifacts', artifacts,
    ]);
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
    const source = readFileSync(path.join(artifacts, 'source.txt'), 'utf-8');
    assert.match(source, /a\.py/);
    assert.doesNotMatch(source, /b\.py/);
  } finally {
    rmSync(target, { recursive: true, force: true });
    rmSync(artifacts, { recursive: true, force: true });
  }
});

test('skill collect bridge accepts --diff without value', () => {
  const target = buildGitReviewTarget();
  const out = freshTmp();
  try {
    const r = spawnSync('node', [
      COLLECT_SCRIPT,
      '--target', target,
      '--diff',
      '--out', path.join(out, 'source.txt'),
      '--files-out', path.join(out, 'files.json'),
    ], { cwd: ROOT, encoding: 'utf-8', timeout: 60_000 });
    assert.equal(r.status, 0, r.stderr);
    const files = JSON.parse(readFileSync(path.join(out, 'files.json'), 'utf-8'));
    assert.ok(files.includes('a.py'));
    assert.match(readFileSync(path.join(out, 'source.txt'), 'utf-8'), /\+y = 2/);
  } finally {
    rmSync(target, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test('skill collect bridge writes private artifacts and refuses existing outputs', () => {
  const target = buildGitReviewTarget();
  const out = freshTmp();
  try {
    const source = path.join(out, 'source.txt');
    const files = path.join(out, 'files.json');
    const args = [
      COLLECT_SCRIPT,
      '--target', target,
      '--diff',
      '--out', source,
      '--files-out', files,
    ];
    const r = spawnSync('node', args, { cwd: ROOT, encoding: 'utf-8', timeout: 60_000 });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(mode(source), 0o600);
    assert.equal(mode(files), 0o600);

    const second = spawnSync('node', args, { cwd: ROOT, encoding: 'utf-8', timeout: 60_000 });
    assert.notEqual(second.status, 0);
    assert.match(second.stderr, /cannot write/);
  } finally {
    rmSync(target, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test('skill collect bridge refuses symlink output paths without clobbering the target', () => {
  const target = buildGitReviewTarget();
  const out = freshTmp();
  try {
    const victim = path.join(out, 'victim.txt');
    const source = path.join(out, 'source.txt');
    writeFileSync(victim, 'do not overwrite', 'utf-8');
    symlinkSync(victim, source);

    const r = spawnSync('node', [
      COLLECT_SCRIPT,
      '--target', target,
      '--diff',
      '--out', source,
    ], { cwd: ROOT, encoding: 'utf-8', timeout: 60_000 });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /cannot write/);
    assert.equal(readFileSync(victim, 'utf-8'), 'do not overwrite');
  } finally {
    rmSync(target, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test('--personas subset works', () => {
  const target = buildBuggyTarget();
  try {
    const r = runCli([
      'review', target, '--agent', `node ${FAKE}`,
      '--personas', 'auditor,adversary',
    ]);
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
    // Pragmatist must not appear in the verdicts table.
    assert.ok(!r.stdout.toLowerCase().includes('| pragmatist |'));
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('rejects single-persona run', () => {
  const target = buildBuggyTarget();
  try {
    const r = runCli([
      'review', target, '--agent', `node ${FAKE}`,
      '--personas', 'auditor',
    ]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /at least 2 personas/);
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('rejects unknown persona', () => {
  const target = buildBuggyTarget();
  try {
    const r = runCli([
      'review', target, '--agent', `node ${FAKE}`,
      '--personas', 'auditor,wizard',
    ]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /wizard/);
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('handles failed persona (degraded run)', () => {
  const target = buildBuggyTarget();
  try {
    const r = runCli(['review', target, '--agent', `node ${FLAKY}`, '--single-round']);
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
    assert.match(r.stdout, /Degraded run/);
    assert.match(r.stdout, /adversary/);
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('--save-artifacts saves per-persona JSON', async () => {
  const target = buildBuggyTarget();
  const artifacts = freshTmp();
  try {
    const r = runCli([
      'review', target, '--agent', `node ${FAKE}`,
      '--save-artifacts', artifacts,
    ]);
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
    const { readdirSync } = await import('node:fs');
    const files = readdirSync(artifacts);
    assert.ok(files.includes('source.txt'));
    assert.ok(files.some((f) => f.startsWith('round1_')));
    assert.ok(files.some((f) => f.startsWith('round2_')));
  } finally {
    rmSync(target, { recursive: true, force: true });
    rmSync(artifacts, { recursive: true, force: true });
  }
});

test('personas command lists all three', () => {
  const r = runCli(['personas']);
  assert.equal(r.status, 0);
  for (const n of ['auditor', 'adversary', 'pragmatist']) {
    assert.match(r.stdout, new RegExp(n));
  }
});

test('help documents sandboxed Codex fallback command', () => {
  const r = runCli(['help']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /codex exec --sandbox read-only -c approval_policy=never -/);
  assert.match(r.stdout, /--full-tree/);
  assert.doesNotMatch(r.stdout, /codex exec --quiet/);
});

test('target must exist', () => {
  const r = runCli(['review', '/path/that/does/not/exist']);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no such path/);
});

test('synthesize subcommand reads disk and emits report', () => {
  const out = freshTmp();
  try {
    const round1 = {
      auditor: {
        persona: 'auditor', verdict: 'conditional', summary: 'one bug',
        findings: [{ severity: 'critical', file: 'x.py', line: 1, title: 'B', detail: 'd', fix: null }],
      },
      adversary: { persona: 'adversary', verdict: 'approve', summary: 'ok', findings: [] },
    };
    writeFileSync(path.join(out, 'r1.json'), JSON.stringify(round1));
    const r = runCli([
      'synthesize',
      '--round1', path.join(out, 'r1.json'),
      '--out', path.join(out, 'report.md'),
      '--json-out', path.join(out, 'report.json'),
    ]);
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
    assert.ok(existsSync(path.join(out, 'report.md')));
    assert.ok(existsSync(path.join(out, 'report.json')));
  } finally { rmSync(out, { recursive: true, force: true }); }
});
