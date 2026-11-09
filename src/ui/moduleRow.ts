// Owns one module row, its selection control and the displayed credit share.
import type { Category, Module } from '../domain/types';
import { element } from './dom';

export function createRow(
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
