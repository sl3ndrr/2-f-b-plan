// Owns the theme button and applies the stored preference to the document root.
import { loadTheme, saveTheme } from '../state/preferences';
import { get } from './dom';

export function connectTheme(storage: () => Storage) {
  const root = document.documentElement;
  const button = get<HTMLButtonElement>('#bTheme');
  const system = matchMedia('(prefers-color-scheme: dark)');
  const saved = loadTheme(storage);
  if (saved) root.dataset.theme = saved;

  const dark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : system.matches);
  const update = () => button.setAttribute('aria-pressed', String(dark()));
  button.addEventListener('click', () => {
    const theme = dark() ? 'light' : 'dark';
    root.dataset.theme = theme;
    saveTheme(storage, theme);
    update();
  });
  system.addEventListener('change', update);
  update();
}
