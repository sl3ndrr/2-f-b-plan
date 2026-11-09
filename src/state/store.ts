import { toggleModule } from '../domain/rules';
import type { Data, Filter, Mode, Selection } from '../domain/types';
import { loadSelection, saveSelection } from './storage';

export interface State extends Selection {
  filter: Filter;
}

export function createStore(data: Data, storage: () => Storage) {
  const knownIds = new Set(data.modules.map(({ id }) => id));
  const { done, mode, unknown } = loadSelection(storage, knownIds);
  let state: State = { done, mode, filter: { category: null, status: 'all', query: '' } };
  const listeners = new Set<(state: State, previous: State) => void>();

  function update(next: Partial<State>) {
    const previous = state;
    state = { ...state, ...next };
    if (previous.done !== state.done || previous.mode !== state.mode) {
      saveSelection(storage, state.done, state.mode);
    }
    for (const listener of listeners) listener(state, previous);
  }

  return {
    get: () => state,
    unknown,
    knownIds,
    subscribe(listener: (state: State, previous: State) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setMode: (mode: Mode) => update({ mode }),
    setFilter: (filter: Partial<Filter>) => update({ filter: { ...state.filter, ...filter } }),
    toggle: (id: string) => update({ done: toggleModule(data, state, id) }),
    fillPlan: () => update({ done: new Set(data.plan) }),
    reset: () => update({ done: new Set<string>() }),
  };
}

export type Store = ReturnType<typeof createStore>;
