// Celebrates completion using category colors and owns its temporary particles.
import { color, element } from './dom';

export function burst(tokens: string[]) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !tokens.length) return;
  for (let index = 0; index < 44; index++) {
    const particle = color(element('div', 'cf'), tokens[index % tokens.length]);
    particle.setAttribute('aria-hidden', 'true');
    particle.style.setProperty('--x', `${(Math.random() - 0.5) * 600}px`);
    particle.style.setProperty('--y', `${Math.random() * 500 - 100}px`);
    particle.style.setProperty('--r', `${Math.random() * 720}deg`);
    document.body.append(particle);
    setTimeout(() => particle.remove(), 1600);
  }
}
