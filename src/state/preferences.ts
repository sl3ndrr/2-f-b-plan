import { read, write } from './storage';

export type Motion = 'calm' | 'normal' | 'off';

const motionKey = 'zfb2_motion';

export function loadMotion(storage: () => Storage): Motion {
  const value = read(storage, motionKey);
  return value === 'normal' || value === 'off' ? value : 'calm';
}

export function saveMotion(storage: () => Storage, value: Motion) {
  write(storage, motionKey, value);
}

export type Theme = 'light' | 'dark';
const themeKey = 'zfb2_theme';

export function loadTheme(storage: () => Storage): Theme | null {
  const value = read(storage, themeKey);
  return value === 'light' || value === 'dark' ? value : null;
}

export function saveTheme(storage: () => Storage, value: Theme) {
  write(storage, themeKey, value);
}
