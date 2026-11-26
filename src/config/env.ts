/**
 * Central place for runtime configuration.
 *  - Development: requests go to the Vite dev server (same origin) and are proxied
 *    to VITE_API_BASE_URL (see vite.config.ts), so no CORS setup is needed.
 *  - Production build: requests go straight to VITE_API_BASE_URL.
 */
export const env = {
  apiBaseUrl: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'),
  /**
   * Firebase web app config, used only for push notifications (FCM).
   * Leave these empty to disable push: in-app notifications still work.
   */
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY ?? '',
  },
} as const;

/** Polling interval for the unread-notification badge. */
export const NOTIFICATION_POLL_MS = 30_000;

/** Default page sizes used across list pages. */
export const PAGE_SIZE = {
  todos: 9,
  tasks: 10,
  projects: 9,
} as const;
