import assert from 'node:assert/strict';
import { test } from 'vitest';
import { exportBackup, importBackup } from '../../src/state/backup';

const known = new Set(['p1301', 'i1605']);

test('JSON-Sicherung kann mit denselben Haken wieder geladen werden', () => {
  assert.deepEqual(importBackup(exportBackup(known), known), { done: known, unknown: 0 });
});

test('Import filtert unbekannte IDs und erkennt ungültige Sicherungen', () => {
  assert.deepEqual(importBackup('{"version":1,"done":["p1301","xyz"]}', known), {
    done: new Set(['p1301']),
    unknown: 1,
  });
  for (const invalid of [
    '{"version":2,"done":[]}',
    '{"version":1,"done":[42]}',
    '{"version":1,"done":["xyz"]}',
    'invalid',
  ]) {
    assert.throws(() => importBackup(invalid, known));
  }
});
