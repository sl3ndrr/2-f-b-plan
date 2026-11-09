import { activeModules, sumCredits } from './rules';
import type { Data, Selection } from './types';

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
  return { categories, total, completed };
}

export type Progress = ReturnType<typeof progress>;
export type CreditProgress = ReturnType<typeof creditProgress>;
