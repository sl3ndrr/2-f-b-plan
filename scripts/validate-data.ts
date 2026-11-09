import { sumCredits } from '../src/domain/rules.ts';
import { loadData } from './data-loader.ts';

const data = loadData();
const issues: string[] = [];
const required = { phy: 66, inf: 66, did: 6, bw: 20, opt: 10, th: 12 };
const plan = data.modules.filter(({ id }) => data.plan.includes(id));

function expect(file: string, id: string, expected: unknown, actual: unknown, fix: string) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    issues.push(
      `data/${file}.json [${id}]: erwartet ${JSON.stringify(expected)}, gefunden ${JSON.stringify(actual)}. ${fix}`,
    );
  }
}

for (const [file, entries] of Object.entries({
  categories: data.categories,
  groups: data.groups,
  modules: data.modules,
})) {
  const seen = new Set();
  for (const { id } of entries) {
    if (seen.has(id)) expect(file, id, 'eindeutige ID', id, 'Doppelten Eintrag entfernen.');
    seen.add(id);
  }
}

const categories = new Set(data.categories.map(({ id }) => id));
const groups = new Set(data.groups.map(({ id }) => id));
const modules = new Set(data.modules.map(({ id }) => id));
for (const { id, credits, group } of data.modules) {
  for (const key of Object.keys(credits)) {
    if (!categories.has(key))
      expect(
        'modules',
        id,
        'bekannte Kategorie',
        key,
        'Schlüssel in credits mit categories.json abgleichen.',
      );
  }
  if (!groups.has(group))
    expect('modules', id, 'bekannte Gruppe', group, 'group mit groups.json abgleichen.');
}
for (const { id, fixedCredits } of data.groups) {
  for (const key of Object.keys(fixedCredits)) {
    if (!categories.has(key))
      expect(
        'groups',
        id,
        'bekannte Kategorie',
        key,
        'Schlüssel in fixedCredits mit categories.json abgleichen.',
      );
  }
}
for (const id of data.plan) {
  if (!modules.has(id))
    expect('plan', id, 'bekannte Modul-ID', id, 'ID mit modules.json abgleichen.');
}

expect(
  'categories',
  'alle',
  Object.keys(required).sort(),
  [...categories].sort(),
  'Kategorien mit der Studienordnung abgleichen.',
);
for (const [id, credits] of Object.entries(required)) {
  expect(
    'categories',
    id,
    credits,
    data.categories.find((category) => category.id === id)?.required,
    'Soll laut Studienordnung prüfen.',
  );
  expect(
    'plan',
    id,
    credits,
    sumCredits(plan, id),
    'Plan-IDs und Credit-Anteile der Kategorie abgleichen.',
  );
}
const total = Object.values(required).reduce((sum, credits) => sum + credits, 0);
expect(
  'plan',
  'gesamt',
  total,
  plan.reduce((sum, { credits }) => sum + Object.values(credits).reduce((a, b) => a + b, 0), 0),
  'Plan-IDs und Credit-Anteile prüfen.',
);
for (const [group, id] of Object.entries({ wp: 'p2571', db: 'i1605' })) {
  expect(
    'plan',
    group,
    [id],
    plan.filter((module) => module.group === group).map((module) => module.id),
    'Genau das vorgesehene Modul auswählen.',
  );
}
const optional = data.modules.filter(({ group }) => group === 'o');
expect(
  'modules',
  'o',
  required.opt,
  sumCredits(optional, 'opt'),
  'Credits der Optionalmodule prüfen.',
);
expect(
  'plan',
  'o',
  optional.map(({ id }) => id).sort(),
  plan
    .filter(({ group }) => group === 'o')
    .map(({ id }) => id)
    .sort(),
  'Alle Optionalmodule in den Plan aufnehmen.',
);

if (issues.length) throw new Error(issues.join('\n'));
console.log(`Daten geprüft: ${data.modules.length} Module, ${plan.length} im Plan, ${total} C.`);
