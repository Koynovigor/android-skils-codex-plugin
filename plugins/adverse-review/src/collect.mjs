// Collect source code from a target directory or a git diff.

import { execFileSync } from 'node:child_process';
import {
  closeSync,
  lstatSync,
  openSync,
  readSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

export const DEFAULT_MAX_TOTAL_CHARS = 250_000;
export const DEFAULT_MAX_FILE_CHARS = 30_000;

const EXCLUDE_DIRS = new Set([
  '.git', '.hg', '.svn',
  'node_modules', '.venv', 'venv', 'env', '__pycache__',
  'dist', 'build', 'target', 'out', '.next', '.nuxt',
  '.pytest_cache', '.mypy_cache', '.ruff_cache', '.tox',
  'vendor', 'bower_components',
]);

const EXCLUDE_EXTS = new Set([
  '.pyc', '.pyo', '.so', '.dylib', '.dll', '.exe', '.class', '.jar',
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.pdf', '.zip', '.tar',
  '.gz', '.tgz', '.bz2', '.xz', '.7z', '.rar', '.woff', '.woff2', '.ttf',
  '.eot', '.otf', '.mp3', '.mp4', '.wav', '.mov', '.webm', '.webp',
  '.lock',
]);

const SENSITIVE_DIRS = new Set([
  '.ssh',
  '.gnupg',
  '.aws',
  '.azure',
  '.config/gcloud',
]);

const SENSITIVE_BASENAMES = new Set([
  '.env',
  '.npmrc',
  '.pypirc',
  '.netrc',
  '.git-credentials',
  '.dockerconfigjson',
  'credentials',
  'credentials.json',
  'secret.json',
  'secrets.json',
  'token.json',
  'tokens.json',
  'service-account.json',
  'service_account.json',
  'google-services.json',
  'googleservice-info.plist',
]);

const SENSITIVE_EXTS = new Set([
  '.pem',
  '.key',
  '.p12',
  '.pfx',
  '.jks',
  '.keystore',
  '.kdbx',
  '.age',
  '.asc',
  '.gpg',
]);

function normalizedPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function isSensitivePath(filePath) {
  const normalized = normalizedPath(filePath);
  const lower = normalized.toLowerCase();
  const parts = lower.split('/').filter(Boolean);
  const base = parts.at(-1) ?? lower;

  if (base.startsWith('.env.')) return true;
  if (SENSITIVE_BASENAMES.has(base)) return true;
  if (/^id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/.test(base)) return true;
  if (SENSITIVE_EXTS.has(path.posix.extname(base))) return true;

  for (let i = 0; i < parts.length; i++) {
    if (SENSITIVE_DIRS.has(parts[i])) return true;
    const pair = `${parts[i]}/${parts[i + 1] ?? ''}`;
    if (SENSITIVE_DIRS.has(pair)) return true;
  }
  return false;
}

function isGitRepo(dir) {
  try {
    execFileSync('git', ['-C', dir, 'rev-parse', '--is-inside-work-tree'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

function gitRootFor(target) {
  const absTarget = realpathSync(path.resolve(target));
  let st;
  try {
    st = statSync(absTarget);
  } catch {
    throw new Error(`target not found: ${absTarget}`);
  }

  const cwd = st.isDirectory() ? absTarget : path.dirname(absTarget);
  let root;
  try {
    root = execFileSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000,
    }).trim();
    root = realpathSync(root);
  } catch {
    throw new Error(`${absTarget} is not a git repository (--diff requires git)`);
  }

  return { root, target: absTarget };
}

function pathspecFor(root, target) {
  const rel = path.relative(root, target).split(path.sep).join('/');
  return rel && rel !== '.' ? [rel] : [];
}

export function hasUncommittedChanges(target) {
  const { root, target: absTarget } = gitRootFor(target);
  const pathspec = pathspecFor(root, absTarget);
  const args = ['status', '--porcelain=v1'];
  if (pathspec.length) args.push('--', ...pathspec);
  const out = execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return out.trim().length > 0;
}

function gitTrackedFiles(dir) {
  const out = execFileSync(
    'git',
    ['-C', dir, 'ls-files', '--cached', '--others', '--exclude-standard'],
    { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  return out.split('\n').filter(Boolean).map((rel) => path.join(dir, rel));
}

function walkFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (ent.isDirectory()) {
        if (!EXCLUDE_DIRS.has(ent.name)) stack.push(path.join(dir, ent.name));
      } else if (ent.isFile()) {
        files.push(path.join(dir, ent.name));
      }
    }
  }
  return files;
}

function readPrefix(filePath, maxBytes) {
  const fd = openSync(filePath, 'r');
  try {
    const buffer = Buffer.allocUnsafe(maxBytes);
    const bytesRead = readSync(fd, buffer, 0, maxBytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    closeSync(fd);
  }
}

function readTextPrefix(filePath, maxChars) {
  const bytesToRead = Math.max(1, maxChars + 1);
  const chunk = readPrefix(filePath, bytesToRead);
  let text = chunk.toString('utf-8');
  const truncated = chunk.length > maxChars || text.length > maxChars;
  if (text.length > maxChars) text = text.slice(0, maxChars);
  return { text, truncated };
}

function looksBinary(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (EXCLUDE_EXTS.has(ext)) return true;
  if (filePath.endsWith('.min.js') || filePath.endsWith('.min.css')) return true;
  try {
    const head = readPrefix(filePath, 8192);
    for (const b of head) if (b === 0) return true;
  } catch {
    return true;
  }
  return false;
}

function untrackedFileDiff(root, rel, { maxFileChars = DEFAULT_MAX_FILE_CHARS } = {}) {
  const filePath = path.join(root, rel);
  if (isSensitivePath(rel)) return null;
  let st;
  try {
    st = lstatSync(filePath);
  } catch {
    return null;
  }
  if (!st.isFile()) return null;
  if (looksBinary(filePath)) return null;

  let text, truncated;
  try {
    ({ text, truncated } = readTextPrefix(filePath, maxFileChars));
  } catch {
    return null;
  }
  if (!text.trim()) return null;

  const lines = text.endsWith('\n') ? text.slice(0, -1).split('\n') : text.split('\n');
  const body = lines.map((line) => `+${line}`).join('\n');
  const lineCount = lines.length + (truncated ? 1 : 0);
  const truncationNote = truncated ? `\n+... (file truncated to ${maxFileChars} chars) ...` : '';

  return [
    `diff --git a/${rel} b/${rel}`,
    'new file mode 100644',
    'index 0000000..0000000',
    '--- /dev/null',
    `+++ b/${rel}`,
    `@@ -0,0 +1,${lineCount} @@`,
    body + truncationNote,
  ].join('\n');
}

function diffPathFromChunk(chunk) {
  const m = chunk.match(/^diff --git a\/(.+?) b\/(.+)$/m);
  return m ? [m[1], m[2]] : [];
}

function filterSensitiveDiff(diff) {
  if (!diff.trim()) return diff;
  const starts = [...diff.matchAll(/^diff --git /gm)].map((m) => m.index);
  if (!starts.length) return diff;
  const chunks = starts.map((start, i) => diff.slice(start, starts[i + 1] ?? diff.length));
  return chunks
    .filter((chunk) => diffPathFromChunk(chunk).every((p) => !isSensitivePath(p)))
    .join('')
    .trimEnd();
}

export function collectDirectory(
  target,
  { maxTotalChars = DEFAULT_MAX_TOTAL_CHARS, maxFileChars = DEFAULT_MAX_FILE_CHARS } = {},
) {
  const absRoot = path.resolve(target);
  const candidates = (isGitRepo(absRoot) ? gitTrackedFiles(absRoot) : walkFiles(absRoot)).sort();

  const parts = [];
  const included = [];
  const reviewable = [];
  let total = 0;
  let budgetReached = false;

  for (const filePath of candidates) {
    let st;
    try {
      st = lstatSync(filePath);
    } catch {
      continue;
    }
    if (!st.isFile()) continue;
    const rel = path.relative(absRoot, filePath).split(path.sep).join('/');
    if (isSensitivePath(rel)) continue;
    if (looksBinary(filePath)) continue;
    let text, truncated;
    try {
      ({ text, truncated } = readTextPrefix(filePath, maxFileChars));
    } catch {
      continue;
    }
    if (!text.trim()) continue;
    reviewable.push(rel);
    let header = `\n=== FILE: ${rel}`;
    if (truncated) header += ` (truncated to ${maxFileChars} chars)`;
    header += ' ===\n';
    const block = header + text + '\n';
    if (budgetReached) continue;
    if (total + block.length > maxTotalChars) {
      budgetReached = true;
      continue;
    }
    parts.push(block);
    included.push(rel);
    total += block.length;
  }

  if (budgetReached) {
    parts.push(
      `\n=== TRUNCATED: ${reviewable.length - included.length} more files omitted ` +
        `after ${maxTotalChars}-char budget reached ===\n`,
    );
  }

  if (!reviewable.length) {
    throw new Error(`no reviewable source files found under ${absRoot}`);
  }
  return { block: parts.join(''), files: reviewable };
}

export function collectDiff(
  target,
  base,
  { maxTotalChars = DEFAULT_MAX_TOTAL_CHARS, maxFileChars = DEFAULT_MAX_FILE_CHARS } = {},
) {
  const { root, target: absTarget } = gitRootFor(target);
  const pathspec = pathspecFor(root, absTarget);
  const diffArgs = base ? ['diff', `${base}...HEAD`] : ['diff', 'HEAD'];
  const namesArgs = base ? ['diff', '--name-only', `${base}...HEAD`] : ['diff', '--name-only', 'HEAD'];
  if (pathspec.length) {
    diffArgs.push('--', ...pathspec);
    namesArgs.push('--', ...pathspec);
  }

  const diff = execFileSync('git', ['-C', root, ...diffArgs], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 50 * 1024 * 1024,
  });
  const names = execFileSync('git', ['-C', root, ...namesArgs], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const trackedFiles = names.split('\n').filter(Boolean).filter((rel) => !isSensitivePath(rel));
  let files = [...trackedFiles];
  const parts = [];
  let total = 0;
  let budgetReached = false;

  function appendDiffPart(part) {
    if (budgetReached) return;
    const separatorLength = parts.length ? 2 : 0;
    const remaining = maxTotalChars - total - separatorLength;
    if (remaining <= 0) {
      budgetReached = true;
      return;
    }
    if (part.length > remaining) {
      parts.push(part.slice(0, remaining));
      total = maxTotalChars;
      budgetReached = true;
      return;
    }
    parts.push(part);
    total += separatorLength + part.length;
  }

  const filteredDiff = filterSensitiveDiff(diff);
  if (filteredDiff.trim()) appendDiffPart(filteredDiff);

  if (!base) {
    const untrackedArgs = ['ls-files', '--others', '--exclude-standard'];
    if (pathspec.length) untrackedArgs.push('--', ...pathspec);
    const untracked = execFileSync('git', ['-C', root, ...untrackedArgs], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).split('\n').filter(Boolean);

    for (const rel of untracked) {
      const fileDiff = untrackedFileDiff(root, rel, { maxFileChars });
      if (!fileDiff) continue;
      appendDiffPart(fileDiff);
      files.push(rel);
    }
  }

  const combinedDiff = parts.join('\n\n');
  if (!combinedDiff.trim()) throw new Error('no changes to review (git diff was empty)');
  files = [...new Set(files)].sort();

  let truncated = combinedDiff;
  if (budgetReached || truncated.length > maxTotalChars) {
    truncated = truncated.slice(0, maxTotalChars) + '\n... (diff truncated to fit context budget) ...\n';
  }
  const block =
    'The following is a unified git diff. Review the *changes*, not the surrounding code.\n\n```diff\n' +
    truncated +
    '\n```\n';
  return { block, files };
}
