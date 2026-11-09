// Manages reduced motion and ambient animation flags for the hero and terminal cursor.
const cursorIdleAfter = 10_000;

export function connectMotion(hero: HTMLElement) {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = true;
  let lastActivity = performance.now();

  function update() {
    root.dataset.motion = reduced.matches ? 'off' : 'normal';
    root.toggleAttribute('data-motion-paused', document.hidden || !inView);
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
