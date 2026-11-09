import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const original = readFileSync(new URL('../docs/legacy/index.original.html', import.meta.url), 'utf8');
const script = original.split('<script>')[1].split('</script>')[0];

export function legacySnapshot(full) {
  // Run the original state and credit functions without starting its DOM or animation.
  return runInNewContext(
    script.slice(0, script.indexOf('const toast=')) +
      `\nif (full) done = new Set(M.filter(PL).map(({ id }) => id));
      JSON.stringify({ total: total(), categories: Object.fromEntries(
        Object.keys(REQ).map((key) => [key, earned(key)])) });`,
    { full, localStorage: { getItem: () => null } },
  );
}

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
