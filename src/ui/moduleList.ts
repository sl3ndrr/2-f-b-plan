// Renders the filtered sections and owns each module row and its selection control.
import { visibleModules } from '../domain/filter';
import type { Progress } from '../domain/progress';
import type { Data } from '../domain/types';
import type { State } from '../state/store';
import { color, element } from './dom';
import { createRow, type ModuleRow } from './moduleRow';
import { creditLabel, remainingLabel } from './progressText';

export function createModuleList(
  data: Data,
  root: HTMLElement,
  select: (id: string, exclusive: boolean) => void,
  clear: (group: string) => void,
) {
  const rows: ModuleRow[] = [];
  let animation: number;

  const headings = new Map<
    string,
    { header: HTMLElement; text: HTMLElement; bar: HTMLProgressElement }
  >();
  const groupCounts: {
    category: string;
    group: string;
    text: HTMLElement;
    reset: HTMLButtonElement | null;
    conflict: HTMLElement | null;
  }[] = [];

  function sync(state: State, progress: Progress) {
    for (const [id, { header, text, bar }] of headings) {
      const category = progress.categories[id];
      const label = `${creditLabel(category)} · ${remainingLabel(category)}`;
      if (text.textContent !== label) text.textContent = label;
      header.classList.toggle('complete', category.remaining === 0);
      bar.max = category.required;
      bar.value = category.capped;
    }
    for (const { category, group, text, reset, conflict } of groupCounts) {
      const { credits, completedModules, targetModules, availability } =
        progress.groups[category][group];
      const label = `${creditLabel(credits)} · ${completedModules} / ${targetModules} Module${availability ? ' (verfügbar)' : ''}`;
      if (text.textContent !== label) text.textContent = label;
      if (reset) reset.disabled = completedModules === 0;
      if (conflict) conflict.hidden = completedModules <= 1;
    }
    const checkedRadios = new Set<string>();
    for (const { row, id, input, radioName } of rows) {
      const done = state.done.has(id);
      // Legacy saves can hold two alternatives. Preserve both until the user changes the group.
      const checked = done && (!radioName || !checkedRadios.has(radioName));
      if (checked && radioName) checkedRadios.add(radioName);
      input.checked = checked;
      row.classList.toggle('d', done);
    }
  }

  function render(state: State, progress: Progress, animate: boolean) {
    const focused = root.contains(document.activeElement);
    const lastIndex = rows.findIndex(({ input }) => input === document.activeElement);
    const previous = rows[lastIndex];
    rows.length = 0;
    groupCounts.length = 0;
    headings.clear();
    const visible = visibleModules(data, state, state.filter);
    const sections = data.categories.flatMap((category) => {
      const matches = visible.filter((module) => module.credits[category.id]);
      if (!matches.length || (state.filter.category && state.filter.category !== category.id))
        return [];
      const section = color(element('section', 'sec'), category.colorToken);
      section.dataset.category = category.id;
      section.dataset.band = category.band;
      const header = element('div', 'sh');
      header.style.setProperty('--i', String(rows.length));
      const title = element('h2', '', `${category.symbol} ${category.name}`);
      const text = element('span', 'section-count');
      text.setAttribute('aria-live', 'polite');
      const bar = element('progress', 'section-progress');
      bar.setAttribute('aria-label', `Fortschritt ${category.name}`);
      header.append(title, text, bar);
      headings.set(category.id, { header, text, bar });
      section.append(header);
      for (const group of data.groups) {
        const modules = matches.filter((module) => module.group === group.id);
        if (!modules.length) continue;
        const label = group.labels[state.mode];
        const fieldset = element('fieldset', 'module-group');
        fieldset.append(element('legend', 'sr-only', label));
        const heading = element('div', 'gl', label);
        const text = element('em', 'group-count');
        text.setAttribute('aria-live', 'polite');
        heading.append(text);

        const radioName =
          state.mode === 'all' && group.exclusive ? `choice-${category.id}-${group.id}` : null;
        const reset = radioName ? element('button', 'btn group-reset', 'Auswahl aufheben') : null;
        const conflict = radioName
          ? element(
              'p',
              'group-conflict',
              'Mehrere Haken gespeichert. Wähle eine andere Option oder hebe die Auswahl auf.',
            )
          : null;
        if (reset) {
          reset.type = 'button';
          reset.setAttribute('aria-label', `Auswahl aufheben: ${label}`);
          reset.addEventListener('click', () => {
            clear(group.id);
            if (!root.contains(document.activeElement)) {
              fieldset.querySelector('input')?.focus({ preventScroll: true });
            }
          });
          heading.append(reset);
        }
        fieldset.append(heading);
        if (conflict) fieldset.append(conflict);
        section.append(fieldset);
        groupCounts.push({ category: category.id, group: group.id, text, reset, conflict });

        for (const module of modules) {
          const row = createRow(module, category, radioName, select);
          row.row.style.setProperty('--i', String(rows.length + 1));
          rows.push(row);
          fieldset.append(row.row);
        }
      }
      return section;
    });
    const subjects = sections.filter((section) => section.dataset.band === 'subjects');
    const professional = sections.filter((section) => section.dataset.band !== 'subjects');
    const group = element('div', 'module-professional');
    group.append(...professional);
    root.replaceChildren(
      ...(sections.length
        ? [...subjects, ...(professional.length ? [group] : [])]
        : [element('div', 'empty', 'Kein Treffer. Ändere Suche oder Filter.')]),
    );
    root.classList.toggle('enter', animate);
    window.clearTimeout(animation);
    if (animate) animation = window.setTimeout(() => root.classList.remove('enter'), 1800);
    sync(state, progress);
    if (focused) {
      const same = rows.find(
        ({ id, category }) => id === previous?.id && category === previous.category,
      );
      const nearby = rows[Math.max(0, Math.min(lastIndex, rows.length - 1))];
      (same?.input ?? nearby?.input ?? root).focus({ preventScroll: true });
    }
  }

  function highlight(id: string) {
    for (const { row, id: rowId } of rows) {
      if (rowId !== id) continue;
      row.classList.remove('pop');
      void row.offsetWidth;
      row.classList.add('pop');
    }
  }

  return { render, sync, highlight };
}
