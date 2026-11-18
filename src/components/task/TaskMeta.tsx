import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Task } from '@/types/models';
import { formatRelativeDay, isOverdue } from '@/utils/date';

/** Time range + status badges shown under a task name. */
export function TaskMeta({ task }: { task: Task }) {
  const overdue = !task.done && isOverdue(task.expectEnd);
  const hasTime = task.expectStart || task.expectEnd;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      {hasTime && (
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatRelativeDay(task.expectStart, '…')}
          {task.expectEnd && <> → {formatRelativeDay(task.expectEnd)}</>}
        </span>
      )}
      {overdue && <Badge tone="red">Overdue</Badge>}
    </div>
  );
}
