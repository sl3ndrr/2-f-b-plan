import { activeModules, electiveNeed, exclusiveChoice, sumCredits } from './rules';
import type { Data, Group, Selection } from './types';

export function creditProgress(earned: number, required: number) {
  // Cap each category independently so surplus cannot satisfy another requirement.
  const capped = Math.min(earned, required);
  return {
    earned,
    required,
    capped,
    remaining: required - capped,
    overflow: earned - capped,
    percent: required ? Math.round((capped / required) * 100) : 100,
  };
}

export function groupProgress(data: Data, selection: Selection, category: string, group: Group) {
  const modules = activeModules(data, selection.mode).filter(
    (module) => module.group === group.id && module.credits[category],
  );
  const completed = modules.filter(({ id }) => selection.done.has(id));
  let required = sumCredits(modules, category);
  let targetModules = modules.length;
  const availability = selection.mode === 'all' && category === 'inf' && group.id === 'w';

  if (selection.mode === 'all') {
    required = group.fixedCredits[category] ?? required;
    if (group.exclusive) {
      targetModules = Math.min(1, modules.length);
      const choice = exclusiveChoice(modules, data.plan, selection.done);
      required = group.fixedCredits[category] ?? choice?.credits[category] ?? 0;
    }
    if (availability) required = electiveNeed(data, selection);
  }

  return {
    credits: creditProgress(sumCredits(completed, category), required),
    completedModules: completed.length,
    targetModules,
    availability,
  };
}

export function progress(data: Data, selection: Selection) {
  const completed = activeModules(data, selection.mode).filter(({ id }) => selection.done.has(id));
  const categories = Object.fromEntries(
    data.categories.map(({ id, required }) => [
      id,
      creditProgress(sumCredits(completed, id), required),
    ]),
  );
  const total = creditProgress(
    Object.values(categories).reduce((sum, category) => sum + category.capped, 0),
    data.categories.reduce((sum, category) => sum + category.required, 0),
  );
  const groups = Object.fromEntries(
    data.categories.map(({ id }) => [
      id,
      Object.fromEntries(
        data.groups.map((group) => [group.id, groupProgress(data, selection, id, group)]),
      ),
    ]),
  );
  return { categories, groups, total, completed };
}

export type Progress = ReturnType<typeof progress>;
export type CreditProgress = ReturnType<typeof creditProgress>;
