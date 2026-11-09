import assert from 'node:assert/strict';
import { test } from 'node:test';
import { legacySnapshot } from './legacy-snapshot.mjs';

test('Original: leerer Plan', () => {
  assert.deepEqual(JSON.parse(legacySnapshot(false)), {
    total: 0,
    categories: { phy: 0, inf: 0, did: 0, bw: 0, opt: 0, th: 0 },
  });
});

test('Original: vollständiger Plan', () => {
  assert.deepEqual(JSON.parse(legacySnapshot(true)), {
    total: 180,
    categories: { phy: 66, inf: 66, did: 6, bw: 20, opt: 10, th: 12 },
  });
});
