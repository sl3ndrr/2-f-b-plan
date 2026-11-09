// Renders category and exclusive-choice requirements into the checklist.
import type { Progress } from '../domain/progress';
import type { Data } from '../domain/types';
import { element } from './dom';

export function createChecklist(data: Data, parent: HTMLElement) {
  const checklist = element('div', 'chk');
  parent.append(checklist);

  return (progress: Progress) => {
    const entries = data.categories.flatMap(({ id, checklistLabel }) => {
      const checks: [string, boolean][] = [
        [checklistLabel, progress.categories[id].remaining === 0],
      ];
      if (id === 'phy' || id === 'inf') {
        const group = id === 'phy' ? 'wp' : 'db';
        checks.push([
          id === 'phy' ? 'Physik: Wahlpflicht' : 'Informatik: Datenbanken',
          progress.completed.some((module) => module.group === group),
        ]);
      }
      return checks.map(([text, ok]) => {
        const node = element('span', ok ? 'ok' : '', text);
        node.setAttribute('aria-label', `${text}: ${ok ? 'erfüllt' : 'offen'}`);
        return node;
      });
    });
    checklist.replaceChildren(...entries);
  };
}
