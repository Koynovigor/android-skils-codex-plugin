#!/usr/bin/env node
// Skill bridge: deterministic synthesis. Reads round-1 / round-2 combined
// JSON files and writes the markdown report (and optional JSON / HTML).
// Wraps the same `synthesize` and `renderMarkdown` used by the CLI, so the
// Skill and the standalone CLI produce byte-identical reports given the same
// inputs.

import { parseArgs } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';

import { writePrivateFile, writePrivateJson } from '../../../src/artifacts.mjs';
import { synthesize, renderMarkdown, toJsonReport } from '../../../src/synthesis.mjs';
import { renderHtml } from '../../../src/html.mjs';

const { values } = parseArgs({
  options: {
    round1:     { type: 'string' },
    round2:     { type: 'string' },
    out:        { type: 'string' },
    'json-out': { type: 'string' },
    'html-out': { type: 'string' },
  },
  strict: true,
});

if (!values.round1) {
  process.stderr.write('Usage: synthesize.mjs --round1 <combined.json> [--round2 <combined.json>] [--out report.md] [--json-out report.json] [--html-out report.html]\n');
  process.exit(2);
}

let round1, round2 = {};
try {
  round1 = JSON.parse(readFileSync(values.round1, 'utf-8'));
  if (values.round2) {
    if (existsSync(values.round2)) {
      round2 = JSON.parse(readFileSync(values.round2, 'utf-8'));
    } else {
      process.stderr.write(`synthesize: skipping missing round2 file: ${values.round2}\n`);
    }
  }
} catch (e) {
  process.stderr.write(`synthesize: ${e.message}\n`);
  process.exit(1);
}

const syn = synthesize(round1, round2);
const md = renderMarkdown(syn);

try {
  if (values.out) writePrivateFile(values.out, md);
  else process.stdout.write(md);

  if (values['json-out']) writePrivateJson(values['json-out'], toJsonReport(syn));
  if (values['html-out']) writePrivateFile(values['html-out'], renderHtml(syn));
} catch (e) {
  process.stderr.write(`synthesize: cannot write output artifact: ${e.message}\n`);
  process.exit(1);
}

process.stderr.write(`✅ verdict: ${syn.consensusLabel} · ${syn.findings.length} findings\n`);

if (syn.consensusLabel.startsWith('BLOCK')) {
  process.exit(1);
}
