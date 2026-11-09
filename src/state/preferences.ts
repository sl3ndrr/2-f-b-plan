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
