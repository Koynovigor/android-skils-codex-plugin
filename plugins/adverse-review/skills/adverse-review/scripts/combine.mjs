#!/usr/bin/env node
// Skill bridge: combine N per-persona JSON files into a single keyed-by-persona
// JSON object that the synthesizer accepts.

import { parseArgs } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';

import { writePrivateJson } from '../../../src/artifacts.mjs';
import { PERSONAS } from '../../../src/personas.mjs';
import { validatePhase1, validatePhase2 } from '../../../src/prompts.mjs';

function normalizeMultiValueFlags(args) {
  const normalized = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg !== '--round1' && arg !== '--round2') {
      normalized.push(arg);
      continue;
    }

    let consumed = false;
    while (i + 1 < args.length && !args[i + 1].startsWith('-')) {
      normalized.push(arg, args[i + 1]);
      consumed = true;
      i++;
    }
    if (!consumed) normalized.push(arg);
  }
  return normalized;
}

const { values } = parseArgs({
  args: normalizeMultiValueFlags(process.argv.slice(2)),
  options: {
    round1: { type: 'string', multiple: true },
    round2: { type: 'string', multiple: true },
    out:    { type: 'string' },
  },
  strict: true,
});

if (!values.out) {
  process.stderr.write('Usage: combine.mjs (--round1 a.json b.json …) | (--round2 a.json b.json …) --out <combined.json>\n');
  process.exit(2);
}

if (values.round1 && values.round2) {
  process.stderr.write('combine: choose either --round1 or --round2, not both\n');
  process.exit(2);
}

const mode = values.round1 ? 'round1' : 'round2';
const inputs = values.round1 ?? values.round2 ?? [];
if (inputs.length === 0) {
  process.stderr.write('combine: at least one --round1 or --round2 input is required\n');
  process.exit(2);
}

const combined = {};
for (const path of inputs) {
  if (!existsSync(path)) {
    process.stderr.write(`combine: skipping missing input: ${path}\n`);
    continue;
  }
  let payload;
  try {
    payload = JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    process.stderr.write(`combine: ${path}: ${e.message}\n`);
    process.exit(1);
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || typeof payload.persona !== 'string') {
    process.stderr.write(`combine: ${path}: missing or invalid \`persona\` field\n`);
    process.exit(1);
  }
  if (!(payload.persona in PERSONAS)) {
    process.stderr.write(`combine: ${path}: unknown persona '${payload.persona}'\n`);
    process.exit(1);
  }
  const validationError = mode === 'round1'
    ? validatePhase1(payload, payload.persona)
    : validatePhase2(payload, payload.persona);
  if (validationError) {
    process.stderr.write(`combine: ${path}: ${validationError}\n`);
    process.exit(1);
  }
  if (combined[payload.persona]) {
    process.stderr.write(`combine: duplicate persona '${payload.persona}' across inputs\n`);
    process.exit(1);
  }
  combined[payload.persona] = payload;
}

const survivorCount = Object.keys(combined).length;
if (mode === 'round1' && survivorCount < 2) {
  process.stderr.write(`combine: at least 2 round1 reviews are required after skipping missing inputs; got ${survivorCount}\n`);
  process.exit(1);
}

try {
  writePrivateJson(values.out, combined);
} catch (e) {
  process.stderr.write(`combine: cannot write output artifact: ${e.message}\n`);
  process.exit(1);
}
process.stdout.write(`combined ${survivorCount} reviews -> ${values.out}\n`);
