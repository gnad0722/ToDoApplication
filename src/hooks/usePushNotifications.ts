import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';
import { currentPermission, getPushToken, isPushMessage, isPushSupported, type PushPermission } from '@/services/pushService';
import { getErrorMessage } from '@/utils/errors';
import { useAuth } from './useAuth';
import { invalidateNotifications } from './useNotifications';

/**
 * Push notifications for the logged-in user:
 *  - If permission was granted before, registers this device's FCM token
 *    (POST /push-token) on login / page load, as the backend expects.
 *  - `enable()` asks for permission (must be called from a click) and registers.
 *  - Pushes received while the app is open refresh the notification badge
 *    and are shown as a toast.
 */
export function usePushNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<PushPermission>(currentPermission);
  const [enabling, setEnabling] = useState(false);
  // User whose token was already sent. The hook unmounts on logout, so a
  // different user logging in on this tab registers the device again.
  // Holding the promise (not a flag) also merges concurrent calls into one request.
  const registration = useRef<{ userId: number; promise: Promise<void> } | null>(null);

  const registerDevice = useCallback((userId: number) => {
    if (registration.current?.userId === userId) return registration.current.promise;
    const promise = getPushToken()
      .then((token) => notificationService.registerPushToken(token))
      .catch((e) => {
        registration.current = null; // allow a retry
        throw e;
      });
    registration.current = { userId, promise };
    return promise;
  }, []);

  useEffect(() => {
    let active = true;
    isPushSupported().then((ok) => active && setSupported(ok));
    return () => {
      active = false;
    };
  }, []);

  // Re-register on every login when permission is already granted.
  useEffect(() => {
    if (!supported || !user || permission !== 'granted') return;
    registerDevice(user.id).catch((e) => console.warn('Push registration failed:', e));
  }, [supported, user, permission, registerDevice]);

  // Messages forwarded by the service worker while a tab is open.
  useEffect(() => {
    if (!supported) return;
    const onMessage = (event: MessageEvent) => {
      if (!isPushMessage(event.data)) return;
      invalidateNotifications(qc);
      if (document.visibilityState === 'visible' && event.data.title) {
        toast.info(event.data.title, { description: event.data.body });
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [supported, qc]);

  const enable = useCallback(async () => {
    if (!user) return;
    setEnabling(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        toast.error('Notifications are blocked. Allow them in your browser settings to get push notifications.');
        return;
      }
      await registerDevice(user.id);
      toast.success('Push notifications enabled on this device');
    } catch (e) {
      toast.error(`Could not enable push notifications: ${getErrorMessage(e)}`);
    } finally {
      setEnabling(false);
    }
  }, [user, registerDevice]);

  return { supported, permission, enabling, enable };
}
