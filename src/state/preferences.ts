import { read, write } from './storage';

export type Theme = 'light' | 'dark';
const themeKey = 'zfb2_theme';

export function loadTheme(storage: () => Storage): Theme | null {
  const value = read(storage, themeKey);
  return value === 'light' || value === 'dark' ? value : null;
}

export function saveTheme(storage: () => Storage, value: Theme) {
  write(storage, themeKey, value);
}
