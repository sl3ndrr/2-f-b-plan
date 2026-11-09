import { activeModules } from './rules';
import type { Data, Filter, Selection } from './types';

export function visibleModules(data: Data, selection: Selection, filter: Filter) {
  const query = filter.query.trim().toLowerCase();
  return activeModules(data, selection.mode).filter(
    (module) =>
      (!filter.category || module.credits[filter.category]) &&
      (!query ||
        (module.title + module.code + (module.note ?? '')).toLowerCase().includes(query)) &&
      (filter.status === 'all' || (filter.status === 'done') === selection.done.has(module.id)),
  );
}
