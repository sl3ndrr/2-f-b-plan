// Owns the backup buttons and the file input for JSON progress transfers.
import { exportBackup, importBackup } from '../state/backup';
import type { Store } from '../state/store';
import { element, get } from './dom';

export function ignoredIdsLabel(count: number) {
  return count === 1 ? '1 unbekannte ID verworfen' : `${count} unbekannte IDs verworfen`;
}

export function connectBackup(store: Store, toast: (message: string) => void) {
  const fileInput = get<HTMLInputElement>('#backupFile');
  get('#bSave').addEventListener('click', () => {
    const file = new Blob([exportBackup(store.get().done)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = element('a');
    link.href = url;
    link.download = '2-f-b-plan-fortschritt.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Fortschritt gesichert');
  });

  get('#bLoad').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    try {
      const { done, unknown } = importBackup(await file.text(), store.knownIds);
      store.restore(done);
      toast(unknown ? `Fortschritt geladen · ${ignoredIdsLabel(unknown)}` : 'Fortschritt geladen');
    } catch (error) {
      const message =
        error instanceof SyntaxError
          ? 'Ungültiges JSON.'
          : 'Datei enthält keinen gültigen Fortschritt.';
      toast(`Laden nicht möglich. ${message}`);
    }
  });
}
