import type { Mode } from '../domain/types';

const doneKey = 'zfb2_done_v2';
const modeKey = 'zfb2_mode';

export function decodeDone(raw: unknown, knownIds: ReadonlySet<string>) {
  if (!Array.isArray(raw)) return null;
  const ids: unknown[] = raw;
  const known = ids.filter((id): id is string => typeof id === 'string' && knownIds.has(id));
  return { done: new Set(known), unknown: ids.length - known.length };
}

export function read(storage: () => Storage, key: string) {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

export function write(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value);
  } catch {
    // The app remains usable in memory when browser storage is unavailable.
  }
}

export function loadSelection(storage: () => Storage, knownIds: ReadonlySet<string>) {
  const savedMode = read(storage, modeKey);
  const mode: Mode = savedMode === 'all' ? 'all' : 'plan';
  try {
    return {
      mode,
      ...(decodeDone(JSON.parse(read(storage, doneKey) ?? '[]'), knownIds) ?? {
        done: new Set<string>(),
        unknown: 0,
      }),
    };
  } catch {
    return { mode, done: new Set<string>(), unknown: 0 };
  }
}

export function saveSelection(storage: () => Storage, done: ReadonlySet<string>, mode: Mode) {
  write(storage, doneKey, JSON.stringify([...done]));
  write(storage, modeKey, mode);
}
