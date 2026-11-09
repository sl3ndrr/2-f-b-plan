// Renders the filtered sections and owns each module row and its selection control.
import { visibleModules } from '../domain/filter';
import { electiveNeed } from '../domain/rules';
import type { Category, Data, Group, Module } from '../domain/types';
import type { State } from '../state/store';
import { color, element } from './dom';

function createRow(
  module: Module,
  category: Category,
  radio: boolean,
  toggle: (id: string) => void,
) {
  const row = element('div', radio ? 'r rad' : 'r');
  row.dataset.id = module.id;
  row.setAttribute('role', 'checkbox');
  row.tabIndex = 0;
  const title = element('div', 'mt');
  title.append(
    element('b', '', module.title),
    element('small', '', [module.code, module.note].filter(Boolean).join(' · ')),
  );
  const portion = module.credits[category.id];
  const total = Object.values(module.credits).reduce((sum, credits) => sum + credits, 0);
  const credits = element('span', 'cr', `${portion} C`);
  if (total > portion) credits.append(element('i', '', `von ${total}`));
  row.append(element('span', 'cb'), title, credits);
  const select = () => {
    toggle(module.id);
    for (const match of document.querySelectorAll<HTMLElement>('.r')) {
      if (match.dataset.id !== module.id) continue;
      match.classList.remove('pop');
      void match.offsetWidth;
      match.classList.add('pop');
    }
  };
  row.addEventListener('click', select);
  row.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    select();
  });
  return row;
}

export function createModuleList(data: Data, root: HTMLElement, toggle: (id: string) => void) {
  const rows: HTMLElement[] = [];
  let animation: number;

  function groupHeading(group: Group, category: Category, state: State) {
    const heading = element('div', 'gl', group.labels[state.mode]);
    if (state.mode === 'all' && category.id === 'inf' && group.id === 'w') {
      const selected = data.modules.filter(
        (module) => module.group === group.id && state.done.has(module.id),
      );
      const credits = selected.reduce((sum, module) => sum + (module.credits.inf ?? 0), 0);
      heading.append(
        element('em', '', ` Bedarf ${electiveNeed(data, state)} C, gewählt ${credits} C`),
      );
    }
    return heading;
  }

  function sync(state: State) {
    for (const row of rows) {
      const done = state.done.has(row.dataset.id ?? '');
      row.classList.toggle('d', done);
      row.setAttribute('aria-checked', String(done));
    }
  }

  function render(state: State, animate: boolean) {
    rows.length = 0;
    const visible = visibleModules(data, state, state.filter);
    const sections = data.categories.flatMap((category) => {
      const matches = visible.filter((module) => module.credits[category.id]);
      if (!matches.length || (state.filter.category && state.filter.category !== category.id))
        return [];
      const section = color(element('section', 'sec'), category.colorToken);
      const header = element('div', 'sh');
      header.style.setProperty('--i', String(rows.length));
      header.append(
        element('h3', '', `${category.symbol} ${category.name}`),
        element('span', '', `${category.required} C Soll`),
      );
      section.append(header);
      for (const group of data.groups) {
        const modules = matches.filter((module) => module.group === group.id);
        if (!modules.length) continue;
        section.append(groupHeading(group, category, state));
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
    sync(state);
  }

  return { render, sync };
}
