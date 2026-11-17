/**
 * Central place for runtime configuration.
 *  - Development: requests go to the Vite dev server (same origin) and are proxied
 *    to VITE_API_BASE_URL (see vite.config.ts), so no CORS setup is needed.
 *  - Production build: requests go straight to VITE_API_BASE_URL.
 */
export const env = {
  apiBaseUrl: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'),
} as const;

/** Default page sizes used across list pages. */
export const PAGE_SIZE = {
  todos: 9,
  tasks: 10,
  projects: 9,
} as const;
