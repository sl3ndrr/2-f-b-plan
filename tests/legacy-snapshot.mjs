import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { runInNewContext } from 'node:vm';

const original = readFileSync(
  new URL('../docs/legacy/index.original.html', import.meta.url),
  'utf8',
);
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
