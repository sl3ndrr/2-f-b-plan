// Owns the category tiles and reports category filter changes.
import type { Progress } from '../domain/progress';
import type { Category, Data } from '../domain/types';
import { color, element } from './dom';
import { creditLabel, remainingLabel } from './progressText';

const bands = [
  { id: 'subjects', label: 'Fachstudium', className: 'band' },
  { id: 'professional', label: 'Professionalisierung', className: 'band prof' },
  { id: 'thesis', label: '', className: 'band full' },
] as const;

function createTile(category: Category, choose: (id: string) => void) {
  const { id, name, symbol, tileDescription, colorToken, required } = category;
  const button = color(element('button', 't'), colorToken);
  button.type = 'button';
  const heading = element('span', 'th2');
  heading.append(
    element('u', '', symbol),
    element('b', '', name),
    element('em', '', `${required} C`),
  );
  const bar = element('span', 'bar');
  const fill = element('i');
  bar.append(fill);
  const numbers = element('span', 'tn');
  const credits = element('span');
  const percent = element('span');
  const remaining = element('span', 'tile-remaining');
  numbers.append(credits, percent);
  button.append(heading, element('small', '', tileDescription), bar, numbers, remaining);
  button.addEventListener('click', () => choose(id));
  return { button, fill, credits, percent, remaining, id, name };
}

export function createTiles(data: Data, parent: HTMLElement, choose: (id: string) => void) {
  const root = element('div', 'sch');
  const sections = bands.map(({ id, label, className }) => {
    const band = element('div', className);
    const subtotal = element('b');
    if (label) {
      const heading = element('h2', '', label);
      heading.append(subtotal);
      band.append(heading);
    }
    const rows = element('div', 'row2');
    const tiles = data.categories
      .filter(({ band }) => band === id)
      .map((category) => createTile(category, choose));
    rows.append(...tiles.map(({ button }) => button));
    band.append(rows);
    root.append(band);
    return { subtotal, tiles };
  });
  parent.append(root);

  return ({ categories }: Progress, selected: string | null) => {
    for (const { subtotal, tiles } of sections) {
      let earned = 0;
      let required = 0;
      for (const { button, fill, credits, percent, remaining, id, name } of tiles) {
        const status = categories[id];
        credits.textContent = creditLabel(status);
        remaining.textContent = remainingLabel(status);
        button.setAttribute(
          'aria-label',
          `${name}: ${credits.textContent}, ${status.percent} %, ${remaining.textContent}`,
        );
        percent.textContent = `${status.percent}%`;
        fill.style.width = `${status.percent}%`;
        button.classList.toggle('on', selected === id);
        button.setAttribute('aria-pressed', String(selected === id));
        earned += status.capped;
        required += status.required;
      }
      subtotal.textContent = `${earned} / ${required} C`;
    }
  };
}
