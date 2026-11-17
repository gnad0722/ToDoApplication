import { differenceInCalendarDays } from 'date-fns';
import { Badge } from '@/components/ui';
import { parseDate } from '@/utils/date';

/** "12 days left", "Due today" or "Overdue". */
export function DeadlineBadge({ expectEnd, completed }: { expectEnd?: string | null; completed?: boolean }) {
  if (completed) return <Badge tone="green">Completed</Badge>;
  const end = parseDate(expectEnd);
  if (!end) return <Badge>No deadline</Badge>;

  const days = differenceInCalendarDays(end, new Date());
  if (days < 0) return <Badge tone="red">Overdue by {Math.abs(days)}d</Badge>;
  if (days === 0) return <Badge tone="amber">Due today</Badge>;
  if (days <= 7) return <Badge tone="amber">{days} day{days > 1 ? 's' : ''} left</Badge>;
  return <Badge tone="brand">{days} days left</Badge>;
}
