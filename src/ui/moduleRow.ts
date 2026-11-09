// Owns one module label, its native selection control and the displayed credit share.
import type { Category, Module } from '../domain/types';
import { element } from './dom';

export function createRow(
  module: Module,
  category: Category,
  radioName: string | null,
  select: (id: string, exclusive: boolean) => void,
) {
  const row = element('label', 'r');
  row.dataset.id = module.id;
  const input = element('input', 'cb');
  input.type = radioName ? 'radio' : 'checkbox';
  if (radioName) input.name = radioName;
  const title = element('span', 'mt');
  title.append(
    element('b', '', module.title),
    element('small', '', [module.code, module.note].filter(Boolean).join(' · ')),
  );
  const portion = module.credits[category.id];
  const total = Object.values(module.credits).reduce((sum, credits) => sum + credits, 0);
  const credits = element('span', 'cr', `${portion} C`);
  if (total > portion) credits.append(element('i', '', `von ${total}`));
  row.append(input, title, credits);
  input.addEventListener('change', () => select(module.id, Boolean(radioName)));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      input.click();
    }
  });
  return { row, input, id: module.id, category: category.id, radioName };
}

export type ModuleRow = ReturnType<typeof createRow>;
