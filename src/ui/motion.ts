// Owns the motion selector and ambient animation flags for the hero and terminal cursor.
import { loadMotion, saveMotion, type Motion } from '../state/preferences';
import { get } from './dom';

const cursorIdleAfter = 10_000;

export function connectMotion(hero: HTMLElement, storage: () => Storage) {
  const root = document.documentElement;
  const selector = get<HTMLSelectElement>('#motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let choice = loadMotion(storage);
  let inView = true;
  let lastActivity = performance.now();

  function update() {
    const effective = reduced.matches ? 'off' : choice;
    root.dataset.motion = effective;
    root.toggleAttribute('data-motion-paused', document.hidden || !inView);
    selector.value = effective;
    selector.disabled = reduced.matches;
    selector.title = reduced.matches ? 'Bewegung ist in den Systemeinstellungen reduziert.' : '';
  }

  function checkIdle() {
    const remaining = cursorIdleAfter - (performance.now() - lastActivity);
    if (remaining > 0) window.setTimeout(checkIdle, remaining);
    else root.setAttribute('data-cursor-idle', '');
  }

  function recordActivity() {
    lastActivity = performance.now();
    if (root.hasAttribute('data-cursor-idle')) {
      root.removeAttribute('data-cursor-idle');
      window.setTimeout(checkIdle, cursorIdleAfter);
    }
  }

  selector.addEventListener('change', () => {
    choice = selector.value as Motion;
    saveMotion(storage, choice);
    update();
  });
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  for (const event of ['pointerdown', 'pointermove', 'keydown', 'scroll']) {
    window.addEventListener(event, recordActivity, { passive: true });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }).observe(hero);
  }

  window.setTimeout(checkIdle, cursorIdleAfter);
  update();
  return () => root.dataset.motion !== 'off' && !root.hasAttribute('data-motion-paused');
}
