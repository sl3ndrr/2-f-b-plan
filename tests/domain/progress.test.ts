import { test } from 'vitest';
import assert from 'node:assert/strict';
import { legacySnapshot } from '../legacy-snapshot.mjs';
import { progress } from '../../src/domain/progress';
import { electiveNeed, toggleModule } from '../../src/domain/rules';
import { loadSelection } from '../../src/state/storage';
import { loadData } from '../../scripts/data-loader';

const data = loadData();

for (const full of [false, true]) {
  test(`Neue Berechnung entspricht dem Original (${full ? 'vollständig' : 'leer'})`, () => {
    const result = progress(data, { mode: 'plan', done: new Set(full ? data.plan : []) });
    assert.deepEqual(
      {
        total: result.total.capped,
        categories: Object.fromEntries(
          Object.entries(result.categories).map(([key, value]) => [key, value.earned]),
        ),
      },
      JSON.parse(legacySnapshot(full)),
    );
  });
}

test('Geteilte Module zählen nur ihren jeweiligen Anteil', () => {
  const result = progress(data, { mode: 'plan', done: new Set(['p2701', 'i1601a']) });
  assert.equal(result.categories.phy.earned, 3);
  assert.equal(result.categories.did.earned, 3);
  assert.equal(result.categories.inf.earned, 3);
  assert.equal(result.total.earned, 9);
});

test('Überschuss bleibt sichtbar, erhöht aber nicht den Gesamtwert', () => {
  const result = progress(data, { mode: 'all', done: new Set([...data.plan, 'p2604']) });
  assert.equal(result.categories.phy.earned, 74);
  assert.equal(result.categories.phy.capped, 66);
  assert.equal(result.categories.phy.overflow, 8);
  assert.equal(result.total.capped, 180);
});

test('Datenbankwechsel ist exklusiv und ändert den Wahlbedarf', () => {
  const plan = { mode: 'plan' as const, done: new Set<string>() };
  assert.equal(electiveNeed(data, plan), 16);
  const all = { mode: 'all' as const, done: new Set(['i1605', 'p1301']) };
  assert.equal(electiveNeed(data, all), 16);
  const done = toggleModule(data, all, 'i1206');
  assert.deepEqual(done, new Set(['i1206', 'p1301']));
  assert.equal(electiveNeed(data, { ...all, done }), 14);
});

test('Migration behält bekannte IDs und verwirft fremde IDs', () => {
  const storage = () =>
    ({
      getItem: (key: string) => (key === 'zfb2_done_v2' ? '["p1301","i1605","xyz"]' : 'all'),
    }) as Storage;
  const selection = loadSelection(storage, new Set(data.modules.map(({ id }) => id)));
  assert.deepEqual(selection, { mode: 'all', done: new Set(['p1301', 'i1605']), unknown: ['xyz'] });
});
