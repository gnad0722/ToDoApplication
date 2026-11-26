import { Bell, CalendarClock, CirclePlus, ListPlus, Mail, MailOpen, PencilLine, SquarePen, type LucideIcon } from 'lucide-react';
import type { AppNotification, NotificationType } from '@/types/models';
import { cn } from '@/utils/cn';
import { formatDateTime, fromNow } from '@/utils/date';

const typeStyles: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  TODO_LIST_CREATED: { icon: ListPlus, className: 'bg-brand-50 text-brand-600' },
  TODO_LIST_UPDATED: { icon: SquarePen, className: 'bg-sky-50 text-sky-600' },
  TASK_CREATED: { icon: CirclePlus, className: 'bg-emerald-50 text-emerald-600' },
  TASK_UPDATED: { icon: PencilLine, className: 'bg-amber-50 text-amber-600' },
  TODO_LIST_DUE: { icon: CalendarClock, className: 'bg-rose-50 text-rose-600' },
};
const fallbackStyle = { icon: Bell, className: 'bg-slate-100 text-slate-500' };

interface NotificationItemProps {
  notification: AppNotification;
  /** Clicking the row marks it as read. */
  onOpen: (n: AppNotification) => void;
  onToggleRead: (n: AppNotification) => void;
}

export function NotificationItem({ notification: n, onOpen, onToggleRead }: NotificationItemProps) {
  const { icon: Icon, className } = typeStyles[n.type as NotificationType] ?? fallbackStyle;
  const ToggleIcon = n.isRead ? Mail : MailOpen;
  const toggleLabel = n.isRead ? 'Mark as unread' : 'Mark as read';

  return (
    <li className={cn('group relative flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50', !n.isRead && 'bg-brand-50/40')}>
      <button
        type="button"
        onClick={() => onOpen(n)}
        className="absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
        aria-label={`${n.title}${n.isRead ? '' : ' (unread)'}`}
      />
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', className)}>
        <Icon className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1 pr-6">
        <p className={cn('truncate text-sm', n.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900')}>{n.title}</p>
        <p className={cn('mt-0.5 line-clamp-2 text-sm break-words', n.isRead ? 'text-slate-500' : 'text-slate-600')}>{n.body}</p>
        <p className="mt-1 text-xs text-slate-400" title={formatDateTime(n.createdAt)}>
          {fromNow(n.createdAt)}
        </p>
      </div>

      {!n.isRead && <span className="absolute top-4 right-4 size-2 rounded-full bg-brand-600 group-hover:opacity-0 group-focus-within:opacity-0" aria-hidden />}

      <button
        type="button"
        onClick={() => onToggleRead(n)}
        aria-label={toggleLabel}
        title={toggleLabel}
        className={cn(
          'absolute top-2.5 right-2.5 z-10 inline-flex size-7 items-center justify-center rounded-md text-slate-400 transition cursor-pointer',
          'opacity-0 hover:bg-white hover:text-slate-700 hover:shadow-sm focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          'group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100',
        )}
      >
        <ToggleIcon className="size-4" />
      </button>
    </li>
  );
}
