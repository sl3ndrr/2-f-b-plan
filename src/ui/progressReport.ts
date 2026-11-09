// Formats the shared progress snapshot for the clipboard and the printed report.
import type { Progress } from '../domain/progress';
import type { Data, Selection } from '../domain/types';
import { creditLabel } from './progressText';

export function formatProgressReport(data: Data, selection: Selection, status: Progress) {
  const { categories, groups, total } = status;
  const lines = [
    'Studienfortschritt Physik × Informatik (Lehramt)',
    `Gesamt: ${creditLabel(total)} (noch ${total.remaining} C)`,
    `Ansicht: ${selection.mode === 'plan' ? 'Vincents Plan' : 'Alle Optionen'}`,
  ];

  for (const { id, name } of data.categories) {
    lines.push('', `${name}: ${creditLabel(categories[id])}`);
    for (const group of data.groups) {
      const entry = groups[id][group.id];
      if (!entry.targetModules) continue;
      const count = `${entry.completedModules} / ${entry.targetModules} Module`;
      lines.push(
        `  ${group.labels[selection.mode]} · ${creditLabel(entry.credits)} · ${count}${entry.availability ? ' (verfügbar)' : ''}`,
      );
    }
  }

  const open = data.modules.filter(
    ({ id, group }) =>
      data.plan.includes(id) && (group === 'pf' || group === 'sp') && !selection.done.has(id),
  );
  lines.push('', 'Offene Pflichtmodule des Plans');
  lines.push(
    ...(open.length ? open.map(({ code, title }) => `  • ${code} · ${title}`) : ['  Keine']),
  );
  return lines.join('\n');
}
