import { chmodSync, closeSync, mkdirSync, openSync, writeFileSync } from 'node:fs';

export function ensurePrivateDir(dir) {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  chmodSync(dir, 0o700);
}

export function writePrivateFile(filePath, data) {
  const fd = openSync(filePath, 'wx', 0o600);
  try {
    writeFileSync(fd, data, { encoding: 'utf-8' });
  } finally {
    closeSync(fd);
  }
}

export function writePrivateJson(filePath, payload) {
  writePrivateFile(filePath, JSON.stringify(payload, null, 2));
}
