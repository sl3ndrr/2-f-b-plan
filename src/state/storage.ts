import type { Mode } from '../domain/types';

const doneKey = 'zfb2_done_v2';
const modeKey = 'zfb2_mode';

export function decodeDone(raw: unknown, knownIds: ReadonlySet<string>) {
  if (!Array.isArray(raw) || raw.some((id) => typeof id !== 'string')) return null;
  const ids: string[] = raw;
  return {
    done: new Set(ids.filter((id) => knownIds.has(id))),
    unknown: ids.filter((id) => !knownIds.has(id)),
  };
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
        unknown: [],
      }),
    };
  } catch {
    return { mode, done: new Set<string>(), unknown: [] as string[] };
  }
}

export function saveSelection(storage: () => Storage, done: ReadonlySet<string>, mode: Mode) {
  write(storage, doneKey, JSON.stringify([...done]));
  write(storage, modeKey, mode);
}
