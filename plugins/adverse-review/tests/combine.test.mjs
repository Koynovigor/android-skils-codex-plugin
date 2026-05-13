// Tests for the native skill bridge combine.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const COMBINE = path.join(ROOT, 'skills', 'adverse-review', 'scripts', 'combine.mjs');
const SYNTHESIZE = path.join(ROOT, 'skills', 'adverse-review', 'scripts', 'synthesize.mjs');

function freshTmp() {
  return mkdtempSync(path.join(tmpdir(), 'adverse-combine-'));
}

function writeJson(dir, name, payload) {
  const target = path.join(dir, name);
  writeFileSync(target, JSON.stringify(payload), 'utf-8');
  return target;
}

const round1 = (persona) => ({
  persona,
  verdict: 'approve',
  summary: 'ok',
  findings: [],
});

const round2 = (persona) => ({
  persona,
  validate: [],
  challenge: [],
  added: [],
});

function runCombine(args) {
  return spawnSync('node', [COMBINE, ...args], {
    cwd: ROOT,
    encoding: 'utf-8',
    timeout: 60_000,
  });
}

function runSynthesize(args) {
  return spawnSync('node', [SYNTHESIZE, ...args], {
    cwd: ROOT,
    encoding: 'utf-8',
    timeout: 60_000,
  });
}

function mode(filePath) {
  return statSync(filePath).mode & 0o777;
}

test('round1 accepts documented multi-file syntax after one flag', () => {
  const dir = freshTmp();
  try {
    const auditor = writeJson(dir, 'auditor.json', round1('auditor'));
    const adversary = writeJson(dir, 'adversary.json', round1('adversary'));
    const out = path.join(dir, 'round1.json');

    const r = runCombine(['--round1', auditor, adversary, '--out', out]);
    assert.equal(r.status, 0, r.stderr);
    assert.ok(existsSync(out));
    const combined = JSON.parse(readFileSync(out, 'utf-8'));
    assert.deepEqual(Object.keys(combined).sort(), ['adversary', 'auditor']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('round1 writes combined output privately and refuses existing output paths', () => {
  const dir = freshTmp();
  try {
    const auditor = writeJson(dir, 'auditor.json', round1('auditor'));
    const adversary = writeJson(dir, 'adversary.json', round1('adversary'));
    const out = path.join(dir, 'round1.json');

    const r = runCombine(['--round1', auditor, adversary, '--out', out]);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(mode(out), 0o600);

    const second = runCombine(['--round1', auditor, adversary, '--out', out]);
    assert.notEqual(second.status, 0);
    assert.match(second.stderr, /cannot write/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('round1 refuses symlink output paths without clobbering the target', () => {
  const dir = freshTmp();
  try {
    const auditor = writeJson(dir, 'auditor.json', round1('auditor'));
    const adversary = writeJson(dir, 'adversary.json', round1('adversary'));
    const victim = path.join(dir, 'victim.txt');
    const out = path.join(dir, 'round1.json');
    writeFileSync(victim, 'do not overwrite', 'utf-8');
    symlinkSync(victim, out);

    const r = runCombine(['--round1', auditor, adversary, '--out', out]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /cannot write/);
    assert.equal(readFileSync(victim, 'utf-8'), 'do not overwrite');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('round1 skips a missing dropped-reviewer artifact when two reviews survive', () => {
  const dir = freshTmp();
  try {
    const auditor = writeJson(dir, 'auditor.json', round1('auditor'));
    const adversary = writeJson(dir, 'adversary.json', round1('adversary'));
    const missing = path.join(dir, 'pragmatist.json');
    const out = path.join(dir, 'round1.json');

    const r = runCombine(['--round1', auditor, adversary, missing, '--out', out]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /skipping missing input/);
    const combined = JSON.parse(readFileSync(out, 'utf-8'));
    assert.deepEqual(Object.keys(combined).sort(), ['adversary', 'auditor']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('round1 rejects missing artifacts when fewer than two reviews survive', () => {
  const dir = freshTmp();
  try {
    const auditor = writeJson(dir, 'auditor.json', round1('auditor'));
    const missing = path.join(dir, 'adversary.json');
    const out = path.join(dir, 'round1.json');

    const r = runCombine(['--round1', auditor, missing, '--out', out]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /at least 2 round1 reviews/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('round2 accepts documented glob-expanded multi-file syntax after one flag', () => {
  const dir = freshTmp();
  try {
    const auditor = writeJson(dir, 'auditor.json', round2('auditor'));
    const adversary = writeJson(dir, 'adversary.json', round2('adversary'));
    const out = path.join(dir, 'round2.json');

    const r = runCombine(['--round2', auditor, adversary, '--out', out]);
    assert.equal(r.status, 0, r.stderr);
    const combined = JSON.parse(readFileSync(out, 'utf-8'));
    assert.deepEqual(Object.keys(combined).sort(), ['adversary', 'auditor']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('round2 writes an empty object when every listed cross-review artifact is missing', () => {
  const dir = freshTmp();
  try {
    const out = path.join(dir, 'round2.json');
    const r = runCombine(['--round2', path.join(dir, 'auditor.json'), '--out', out]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /skipping missing input/);
    assert.deepEqual(JSON.parse(readFileSync(out, 'utf-8')), {});
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('round1 rejects findings missing required nullable keys', () => {
  const dir = freshTmp();
  try {
    const invalid = writeJson(dir, 'auditor.json', {
      persona: 'auditor',
      verdict: 'conditional',
      summary: 'bad',
      findings: [{ severity: 'warning', title: 'Missing fix', detail: 'No fix key.' }],
    });
    const out = path.join(dir, 'round1.json');

    const r = runCombine(['--round1', invalid, '--out', out]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /missing key "file"/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('round2 rejects added findings missing required nullable keys', () => {
  const dir = freshTmp();
  try {
    const invalid = writeJson(dir, 'adversary.json', {
      persona: 'adversary',
      validate: [],
      challenge: [],
      added: [{ severity: 'warning', title: 'Missing fix', detail: 'No fix key.' }],
    });
    const out = path.join(dir, 'round2.json');

    const r = runCombine(['--round2', invalid, '--out', out]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /missing key "file"/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('synthesize treats a missing round2 artifact as an empty cross-review', () => {
  const dir = freshTmp();
  try {
    const round1Path = writeJson(dir, 'round1.json', {
      auditor: round1('auditor'),
      adversary: round1('adversary'),
    });
    const out = path.join(dir, 'report.md');

    const r = runSynthesize([
      '--round1', round1Path,
      '--round2', path.join(dir, 'round2.json'),
      '--out', out,
    ]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /skipping missing round2/);
    assert.ok(existsSync(out));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('synthesize writes report outputs privately', () => {
  const dir = freshTmp();
  try {
    const round1Path = writeJson(dir, 'round1.json', {
      auditor: round1('auditor'),
      adversary: round1('adversary'),
    });
    const md = path.join(dir, 'report.md');
    const json = path.join(dir, 'report.json');
    const html = path.join(dir, 'report.html');

    const r = runSynthesize([
      '--round1', round1Path,
      '--out', md,
      '--json-out', json,
      '--html-out', html,
    ]);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(mode(md), 0o600);
    assert.equal(mode(json), 0o600);
    assert.equal(mode(html), 0o600);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
