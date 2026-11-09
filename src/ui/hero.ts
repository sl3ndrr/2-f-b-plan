// Renders total progress, category legend and oscilloscope into the status card.
import type { Progress } from '../domain/progress';
import type { Data } from '../domain/types';
import { color, element } from './dom';
import { createOscilloscope } from './oscilloscope';

export function createHero(data: Data, parent: HTMLElement) {
  const hero = element('section', 'hero');
  hero.setAttribute('aria-label', 'Gesamtfortschritt');
  const header = element('div', 'hh');
  const big = element('div', 'big');
  const count = element('span', '', '0');
  const target = element('small');
  big.append(count, target);
  const status = element('div', 'hr');
  const live = element('span', 'sr-only');
  live.setAttribute('role', 'status');
  header.append(live);
  header.append(big, status);

  const wave = createOscilloscope();
  const stack = element('div', 'stack');
  stack.setAttribute('aria-hidden', 'true');
  const legend = element('div', 'leg');
  const parts = data.categories.map(({ id, name, colorToken }) => {
    const segment = color(element('i'), colorToken);
    const label = color(element('span'), colorToken);
    const value = element('b');
    label.append(element('s'), name + ' ', value);
    stack.append(segment);
    legend.append(label);
    return { id, segment, value };
  });
  hero.append(header, wave.node, stack, legend);
  parent.append(hero);

  let lastTotal = -1;
  function update({ categories, total }: Progress) {
    if (lastTotal !== total.capped) {
      hero.classList.toggle('complete', total.remaining === 0);
      count.textContent = String(total.capped);
      target.textContent = `/ ${total.required} C`;
      status.replaceChildren(
        `${total.percent}% kompiliert`,
        element('br'),
        `noch ${total.remaining} C offen`,
      );
      live.textContent = `Gesamt: ${total.capped} / ${total.required} C, noch ${total.remaining} C offen`;
      lastTotal = total.capped;
    }
    for (const { id, segment, value } of parts) {
      segment.style.width = `${(categories[id].capped / total.required) * 100}%`;
      value.textContent = String(categories[id].capped);
    }
    const ratio = (id: string) => categories[id].capped / categories[id].required;
    wave.update(ratio('phy'), ratio('inf'));
  }

  return { node: hero, update };
}
