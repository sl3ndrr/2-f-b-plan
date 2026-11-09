import type { Data, Module, Selection } from './types';

export const sumCredits = (modules: readonly Module[], category: string) =>
  modules.reduce((sum, module) => sum + (module.credits[category] ?? 0), 0);

export function activeModules(data: Data, mode: Selection['mode']) {
  if (mode === 'all') return data.modules;
  const planned = new Set(data.plan);
  return data.modules.filter(({ id }) => planned.has(id));
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
    for (const sibling of data.modules) {
      if (sibling.group === module.group) next.delete(sibling.id);
    }
  }
  next.add(id);
  return next;
}

export function electiveNeed(data: Data, selection: Selection) {
  const required = data.categories.find(({ id }) => id === 'inf')?.required ?? 0;
  const mandatory = data.modules.filter(({ group }) => group === 'pf' || group === 'sp');
  const databases = activeModules(data, selection.mode).filter(({ group }) => group === 'db');
  const database =
    databases.find(({ id }) => selection.done.has(id)) ??
    databases.find(({ id }) => data.plan.includes(id));
  return Math.max(0, required - sumCredits(mandatory, 'inf') - (database?.credits.inf ?? 0));
}
