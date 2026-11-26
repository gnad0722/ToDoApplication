import type { AppNotification } from '@/types/models';
import { http, unwrap } from './http';
import { toNotification } from './mappers';

export const notificationService = {
  /** The 5 most recent notifications, newest first. */
  getRecent: async (): Promise<AppNotification[]> => {
    const list = await unwrap<Record<string, unknown>[]>(http.get('/api/notification/recent'));
    return (list ?? []).map(toNotification);
  },

  getUnreadCount: async (): Promise<number> => Number((await unwrap<number>(http.get('/api/notification/unread-count'))) ?? 0),

  markRead: async (id: number) => toNotification(await unwrap(http.patch(`/api/notification/${id}/read`))),

  markUnread: async (id: number) => toNotification(await unwrap(http.patch(`/api/notification/${id}/unread`))),

  /** Returns how many notifications were changed. */
  markAllRead: async (): Promise<number> => Number((await unwrap<number>(http.patch('/api/notification/read-all'))) ?? 0),

  /** Registers this browser's FCM token for the current user. */
  registerPushToken: (token: string) => unwrap<void>(http.post('/push-token', { token })),
};
