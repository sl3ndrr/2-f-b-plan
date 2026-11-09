import { decodeDone } from './storage';

const version = 1;

export function exportBackup(done: ReadonlySet<string>) {
  return JSON.stringify({ version, done: [...done] }, null, 2) + '\n';
}

export function importBackup(text: string, knownIds: ReadonlySet<string>) {
  const raw: unknown = JSON.parse(text);
  if (
    !raw ||
    typeof raw !== 'object' ||
    !('version' in raw) ||
    raw.version !== version ||
    !('done' in raw) ||
    !Array.isArray(raw.done) ||
    raw.done.some((id) => typeof id !== 'string')
  ) {
    throw new Error('Ungültiges Sicherungsformat.');
  }
  const result = decodeDone(raw.done, knownIds);
  if (!result || (result.unknown && !result.done.size)) {
    throw new Error('Die Datei enthält keine bekannten Modul-IDs.');
  }
  return result;
}
