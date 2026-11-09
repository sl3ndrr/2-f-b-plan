import type { Data, Module, Selection } from './types';

export const sumCredits = (modules: readonly Module[], category: string) =>
  modules.reduce((sum, module) => sum + (module.credits[category] ?? 0), 0);

export function activeModules(data: Data, mode: Selection['mode']) {
  if (mode === 'all') return data.modules;
  const planned = new Set(data.plan);
  return data.modules.filter(({ id }) => planned.has(id));
}

export function clearGroup(data: Data, done: ReadonlySet<string>, group: string) {
  const siblings = new Set(
    data.modules.filter((module) => module.group === group).map(({ id }) => id),
  );
  return new Set([...done].filter((id) => !siblings.has(id)));
}

export function selectExclusive(data: Data, done: ReadonlySet<string>, id: string) {
  const module = data.modules.find((candidate) => candidate.id === id);
  if (!module || !data.groups.some((group) => group.id === module.group && group.exclusive))
    return new Set(done);
  return clearGroup(data, done, module.group).add(id);
}

export function toggleModule(data: Data, selection: Selection, id: string) {
  const next = new Set(selection.done);
  const module = data.modules.find((candidate) => candidate.id === id);
  if (!module) return next;
  if (next.delete(id)) return next;

  if (
    selection.mode === 'all' &&
    data.groups.some((group) => group.id === module.group && group.exclusive)
  ) {
    return selectExclusive(data, next, id);
  }
  return next.add(id);
}

export function exclusiveChoice(modules: Module[], plan: string[], done: ReadonlySet<string>) {
  return modules.find(({ id }) => done.has(id)) ?? modules.find(({ id }) => plan.includes(id));
}

export function electiveNeed(data: Data, selection: Selection) {
  const required = data.categories.find(({ id }) => id === 'inf')?.required ?? 0;
  const active = activeModules(data, selection.mode);
  const mandatory = active.filter(({ group }) => group === 'pf' || group === 'sp');
  const databases = active.filter(({ group }) => group === 'db');
  const database = exclusiveChoice(databases, data.plan, selection.done);
  return Math.max(0, required - sumCredits(mandatory, 'inf') - (database?.credits.inf ?? 0));
}
