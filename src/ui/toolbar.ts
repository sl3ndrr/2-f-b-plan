// Wires the existing mode, filter and action controls to the store and status region.
import { progress } from '../domain/progress';
import type { Data, Mode, Status } from '../domain/types';
import type { State, Store } from '../state/store';
import { get } from './dom';
import { formatProgressReport } from './progressReport';

export function connectToolbar(
  data: Data,
  store: Store,
  toast: (message: string) => void,
  celebrate: () => void,
) {
  const modes = Array.from(document.querySelectorAll<HTMLButtonElement>('#mode button'));
  const statuses = Array.from(document.querySelectorAll<HTMLButtonElement>('#seg button'));
  for (const button of modes) {
    button.addEventListener('click', () => {
      const mode = button.dataset.mode as Mode;
      store.setMode(mode);
      toast(mode === 'plan' ? 'Vincents Plan: Auswahl festgelegt' : 'Alle Optionen freigeschaltet');
    });
  }
  for (const button of statuses) {
    button.addEventListener('click', () =>
      store.setFilter({ status: button.dataset.st as Status }),
    );
  }
  const query = get<HTMLInputElement>('#q');
  query.addEventListener('input', () => store.setFilter({ query: query.value }));

  get('#bDemo').addEventListener('click', () => {
    store.fillPlan();
    const { total } = progress(data, store.get());
    toast(`Plan komplett abgehakt: ${total.required} C`);
    celebrate();
  });

  const reset = get('#bReset');
  let armed = false;
  let resetTimeout: number;
  function disarm() {
    armed = false;
    reset.textContent = 'Zurücksetzen';
  }
  reset.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      reset.textContent = 'Wirklich löschen?';
      resetTimeout = window.setTimeout(disarm, 3000);
      return;
    }
    window.clearTimeout(resetTimeout);
    disarm();
    store.reset();
    toast('rm -rf: alle Haken entfernt');
  });

  get('#bCopy').addEventListener('click', async () => {
    const state = store.get();
    const text = formatProgressReport(data, state, progress(data, state));
    try {
      await navigator.clipboard.writeText(text);
      toast('In die Zwischenablage kopiert');
    } catch {
      toast('Kopieren nicht möglich');
    }
  });

  return (state: State) => {
    for (const button of [...modes, ...statuses]) {
      const active =
        button.dataset.mode === state.mode || button.dataset.st === state.filter.status;
      button.classList.toggle('on', active);
      button.setAttribute('aria-pressed', String(active));
    }
  };
}
