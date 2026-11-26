import { env } from '@/config/env';

/**
 * Browser side of Firebase Cloud Messaging.
 *
 * Firebase is imported lazily, so it is only downloaded when push is configured
 * (VITE_FIREBASE_* in .env) and the browser supports it. The service worker in
 * public/firebase-messaging-sw.js shows pushes while the app is in the background
 * and forwards them to open tabs (see PUSH_MESSAGE_TYPE).
 */

const SW_URL = '/firebase-messaging-sw.js';

/** `postMessage` type the service worker uses to hand a push to open tabs. */
export const PUSH_MESSAGE_TYPE = 'todo-app:push';

export interface PushMessage {
  type: typeof PUSH_MESSAGE_TYPE;
  title?: string;
  body?: string;
}

export type PushPermission = NotificationPermission | 'unsupported';

const { vapidKey, ...firebaseConfig } = env.firebase;

export const isPushConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId && vapidKey,
);

let supportPromise: Promise<boolean> | null = null;

/** True when push is configured and this browser can receive web push. */
export function isPushSupported(): Promise<boolean> {
  supportPromise ??= (async () => {
    if (!isPushConfigured) return false;
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return false;
    try {
      const { isSupported } = await import('firebase/messaging');
      return await isSupported();
    } catch {
      return false;
    }
  })();
  return supportPromise;
}

export function currentPermission(): PushPermission {
  return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
}

/**
 * Registers the service worker and returns this browser's FCM registration
 * token. Requires notification permission to be granted already.
 */
export async function getPushToken(): Promise<string> {
  const [{ getApps, initializeApp }, { getMessaging, getToken }] = await Promise.all([
    import('firebase/app'),
    import('firebase/messaging'),
  ]);
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const registration = await navigator.serviceWorker.register(SW_URL);
  await navigator.serviceWorker.ready;
  return getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: registration });
}

export function isPushMessage(data: unknown): data is PushMessage {
  return typeof data === 'object' && data !== null && (data as { type?: unknown }).type === PUSH_MESSAGE_TYPE;
}
