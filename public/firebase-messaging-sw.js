/* global self, clients */
/**
 * Service worker for Firebase Cloud Messaging (web push).
 *
 * It does not load the Firebase SDK: an FCM web push arrives as JSON
 * `{ notification: { title, body }, data: {...}, fcmOptions: { link } }`.
 *  - If a tab of the app is visible, the message is forwarded to the tabs
 *    (they refresh the notification badge and show a toast) and no system
 *    notification is shown.
 *  - Otherwise a system notification is shown; clicking it focuses / opens the app.
 * The message type must match PUSH_MESSAGE_TYPE in src/services/pushService.ts.
 */
const PUSH_MESSAGE_TYPE = 'todo-app:push';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

function readPayload(event) {
  if (!event.data) return null;
  try {
    return event.data.json();
  } catch {
    return { notification: { body: event.data.text() } };
  }
}

self.addEventListener('push', (event) => {
  const payload = readPayload(event);
  if (!payload) return;

  const data = payload.data || {};
  const title = (payload.notification && payload.notification.title) || data.title || 'ToDo App';
  const body = (payload.notification && payload.notification.body) || data.body || '';
  const link = (payload.fcmOptions && payload.fcmOptions.link) || data.link || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      windows.forEach((w) => w.postMessage({ type: PUSH_MESSAGE_TYPE, title, body }));
      if (windows.some((w) => w.visibilityState === 'visible')) return undefined;
      return self.registration.showNotification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: data.notificationId ? `notification-${data.notificationId}` : undefined,
        data: { link },
      });
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.link) || '/dashboard', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (existing) return existing.focus().then((w) => (w && 'navigate' in w && w.url !== target ? w.navigate(target) : w));
      return clients.openWindow(target);
    }),
  );
});
