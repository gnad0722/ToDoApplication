import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, BellRing, CheckCheck } from 'lucide-react';
import { Button, ErrorState, Skeleton } from '@/components/ui';
import {
  useMarkAllNotificationsRead,
  useRecentNotifications,
  useSetNotificationRead,
  useUnreadNotificationCount,
} from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { AppNotification } from '@/types/models';
import { cn } from '@/utils/cn';
import { NotificationItem } from './NotificationItem';

function badgeText(count: number) {
  return count > 99 ? '99+' : String(count);
}

function PushBanner({ push }: { push: ReturnType<typeof usePushNotifications> }) {
  const { supported, permission, enabling, enable } = push;
  if (!supported || permission === 'granted') return null;

  if (permission === 'denied') {
    return (
      <div className="flex items-start gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
        <BellOff className="mt-0.5 size-3.5 shrink-0" />
        Push notifications are blocked for this site. Allow them in your browser settings to get alerts on this device.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 bg-brand-50/60 px-4 py-2.5">
      <BellRing className="size-4 shrink-0 text-brand-600" />
      <p className="flex-1 text-xs text-slate-600">Get notified on this device, even when the app is closed.</p>
      <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs" loading={enabling} onClick={enable}>
        Enable
      </Button>
    </div>
  );
}

/** Top-bar bell with the unread badge and a dropdown of the 5 most recent notifications. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unread = 0 } = useUnreadNotificationCount();
  const recent = useRecentNotifications(open);
  const setRead = useSetNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  // Called here (not in the panel) so device registration and foreground
  // messages keep working while the panel is closed.
  const push = usePushNotifications();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openItem = (n: AppNotification) => {
    if (!n.isRead) setRead.mutate({ id: n.id, read: true });
  };
  const toggleRead = (n: AppNotification) => setRead.mutate({ id: n.id, read: !n.isRead });

  const items = recent.data ?? [];
  const hasUnread = unread > 0 || items.some((n) => !n.isRead);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        className={cn(
          'relative inline-flex size-10 items-center justify-center rounded-lg text-slate-500 transition-colors cursor-pointer',
          'hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          open && 'bg-slate-100 text-slate-700',
        )}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-white">
            {badgeText(unread)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="animate-pop-in fixed inset-x-2 top-16 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
              {unread > 0 && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{unread} unread</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              icon={<CheckCheck className="size-3.5" />}
              disabled={!hasUnread || markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              Mark all as read
            </Button>
          </div>

          <PushBanner push={push} />

          <div className="max-h-[min(28rem,calc(100vh-10rem))] overflow-y-auto">
            {recent.isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-1/2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recent.error ? (
              <div className="p-3">
                <ErrorState error={recent.error} onRetry={() => recent.refetch()} />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Bell className="size-6" />
                </div>
                <p className="text-sm font-semibold text-slate-900">No notifications yet</p>
                <p className="mt-1 text-xs text-slate-500">Creating or updating lists and tasks will show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((n) => (
                  <NotificationItem key={n.id} notification={n} onOpen={openItem} onToggleRead={toggleRead} />
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <p className="border-t border-slate-100 px-4 py-2 text-center text-xs text-slate-400">Showing your latest notifications</p>
          )}
        </div>
      )}
    </div>
  );
}
