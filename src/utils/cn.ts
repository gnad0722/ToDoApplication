import clsx, { type ClassValue } from 'clsx';

/** Joins conditional class names. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function percent(done: number, total: number): number {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}
