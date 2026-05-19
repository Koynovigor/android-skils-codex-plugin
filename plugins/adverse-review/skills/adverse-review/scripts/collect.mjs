#!/usr/bin/env node
// Skill bridge: collect source code into a single text block + file list.
// The same logic powers the standalone CLI (`adverse review`).

import { parseArgs } from 'node:util';
import path from 'node:path';

import { collectDirectory, collectDiff } from '../../../src/collect.mjs';
import { writePrivateFile, writePrivateJson } from '../../../src/artifacts.mjs';

function normalizeOptionalStringFlag(args, flag) {
  const normalized = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === flag && (i === args.length - 1 || args[i + 1].startsWith('-'))) {
      normalized.push(`${flag}=`);
    } else {
      normalized.push(arg);
    }
  }
  return normalized;
}

const { values } = parseArgs({
  args: normalizeOptionalStringFlag(process.argv.slice(2), '--diff'),
  options: {
    target:      { type: 'string' },
    diff:        { type: 'string' },
    out:         { type: 'string' },
    'files-out': { type: 'string' },
  },
  strict: true,
});

if (!values.target || !values.out) {
  process.stderr.write('Usage: collect.mjs --target <path> [--diff [base]] --out <file> [--files-out <file>]\n');
  process.exit(2);
}

const target = path.resolve(values.target);
try {
  let block, files;
  if (values.diff !== undefined) {
    const base = values.diff === '' ? null : values.diff;
    ({ block, files } = collectDiff(target, base));
  } else {
    ({ block, files } = collectDirectory(target));
  }
  try {
    writePrivateFile(values.out, block);
    if (values['files-out']) writePrivateJson(values['files-out'], files);
  } catch (e) {
    process.stderr.write(`collect: cannot write output artifact: ${e.message}\n`);
    process.exit(1);
  }
  process.stdout.write(`collected ${files.length} files (${block.length} chars) -> ${values.out}\n`);
} catch (e) {
  process.stderr.write(`collect: ${e.message}\n`);
  process.exit(1);
}
