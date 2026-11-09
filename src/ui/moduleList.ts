// Renders the filtered sections and owns each module row and its selection control.
import { visibleModules } from '../domain/filter';
import type { Progress } from '../domain/progress';
import type { Data } from '../domain/types';
import type { State } from '../state/store';
import { color, element } from './dom';
import { createRow } from './moduleRow';
import { creditLabel, remainingLabel } from './progressText';

export function createModuleList(data: Data, root: HTMLElement, toggle: (id: string) => void) {
  const rows: HTMLElement[] = [];
  let animation: number;

  const headings = new Map<
    string,
    { header: HTMLElement; text: HTMLElement; bar: HTMLProgressElement }
  >();
  const groupCounts: { category: string; group: string; text: HTMLElement }[] = [];

  function sync(state: State, progress: Progress) {
    for (const [id, { header, text, bar }] of headings) {
      const category = progress.categories[id];
      const label = `${creditLabel(category)} · ${remainingLabel(category)}`;
      if (text.textContent !== label) text.textContent = label;
      header.classList.toggle('complete', category.remaining === 0);
      bar.max = category.required;
      bar.value = category.capped;
    }
    for (const { category, group, text } of groupCounts) {
      const { credits, completedModules, targetModules, availability } =
        progress.groups[category][group];
      const label = `${creditLabel(credits)} · ${completedModules} / ${targetModules} Module${availability ? ' verfügbar' : ''}`;
      if (text.textContent !== label) text.textContent = label;
    }
    for (const row of rows) {
      const done = state.done.has(row.dataset.id ?? '');
      row.classList.toggle('d', done);
      row.setAttribute('aria-checked', String(done));
    }
  }

  function render(state: State, progress: Progress, animate: boolean) {
    rows.length = 0;
    groupCounts.length = 0;
    headings.clear();
    const visible = visibleModules(data, state, state.filter);
    const sections = data.categories.flatMap((category) => {
      const matches = visible.filter((module) => module.credits[category.id]);
      if (!matches.length || (state.filter.category && state.filter.category !== category.id))
        return [];
      const section = color(element('section', 'sec'), category.colorToken);
      const header = element('div', 'sh');
      header.style.setProperty('--i', String(rows.length));
      const title = element('h3', '', `${category.symbol} ${category.name}`);
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
        const heading = element('div', 'gl', group.labels[state.mode]);
        const text = element('em', 'group-count');
        text.setAttribute('aria-live', 'polite');
        heading.append(text);
        section.append(heading);
        groupCounts.push({ category: category.id, group: group.id, text });
        for (const module of modules) {
          const row = createRow(module, category, state.mode === 'all' && group.exclusive, toggle);
          row.style.setProperty('--i', String(rows.length + 1));
          rows.push(row);
          section.append(row);
        }
      }
      return section;
    });
    root.replaceChildren(
      ...(sections.length
        ? sections
        : [element('div', 'empty', 'Kein Treffer. Ändere Suche oder Filter.')]),
    );
    root.classList.toggle('enter', animate);
    window.clearTimeout(animation);
    if (animate) animation = window.setTimeout(() => root.classList.remove('enter'), 1800);
    sync(state, progress);
  }

  return { render, sync };
}
