import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { NOTIFICATION_POLL_MS } from '@/config/env';
import { queryKeys } from '@/config/queryKeys';
import { notificationService } from '@/services/notificationService';
import type { AppNotification } from '@/types/models';
import { notifyMutationError } from '@/utils/formErrors';

/** Call after any action that makes the backend create a notification. */
export function invalidateNotifications(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
}

/** Badge count. Polled so notifications from the daily reminder also show up. */
export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: notificationService.getUnreadCount,
    enabled,
    refetchInterval: NOTIFICATION_POLL_MS,
    refetchOnWindowFocus: true,
  });
}

/** The 5 most recent notifications. Only fetched while the panel is open. */
export function useRecentNotifications(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.notifications.recent,
    queryFn: notificationService.getRecent,
    enabled,
    staleTime: 0,
    refetchInterval: enabled ? NOTIFICATION_POLL_MS : false,
  });
}

type Snapshot = { recent?: AppNotification[]; count?: number };

/** Applies a change to the cached list + badge right away; returns what to roll back to. */
async function optimistic(
  qc: QueryClient,
  change: (n: AppNotification) => AppNotification,
  countDelta: (recent: AppNotification[] | undefined) => number,
): Promise<Snapshot> {
  await qc.cancelQueries({ queryKey: queryKeys.notifications.all });
  const recent = qc.getQueryData<AppNotification[]>(queryKeys.notifications.recent);
  const count = qc.getQueryData<number>(queryKeys.notifications.unreadCount);
  const delta = countDelta(recent);
  if (recent) qc.setQueryData(queryKeys.notifications.recent, recent.map(change));
  if (count != null) qc.setQueryData(queryKeys.notifications.unreadCount, Math.max(0, count + delta));
  return { recent, count };
}

function rollback(qc: QueryClient, snap?: Snapshot) {
  if (!snap) return;
  if (snap.recent) qc.setQueryData(queryKeys.notifications.recent, snap.recent);
  if (snap.count != null) qc.setQueryData(queryKeys.notifications.unreadCount, snap.count);
}

/** Marks one notification as read (`read: true`) or unread (`read: false`). */
export function useSetNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, read }: { id: number; read: boolean }) =>
      read ? notificationService.markRead(id) : notificationService.markUnread(id),
    onMutate: ({ id, read }) =>
      optimistic(
        qc,
        (n) => (n.id === id ? { ...n, isRead: read, readAt: read ? new Date().toISOString() : null } : n),
        (recent) => {
          const target = recent?.find((n) => n.id === id);
          // Unknown state (not in cache): let the refetch fix the count.
          if (!target || target.isRead === read) return 0;
          return read ? -1 : 1;
        },
      ),
    onError: (error, _vars, snap) => {
      rollback(qc, snap);
      notifyMutationError(error);
    },
    onSettled: () => invalidateNotifications(qc),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onMutate: async () => {
      const snap = await optimistic(
        qc,
        (n) => (n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() }),
        () => 0,
      );
      qc.setQueryData(queryKeys.notifications.unreadCount, 0);
      return snap;
    },
    onError: (error, _vars, snap) => {
      rollback(qc, snap);
      notifyMutationError(error);
    },
    onSettled: () => invalidateNotifications(qc),
  });
}
