import { Check } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { useMarkTaskDone } from '@/hooks/useTasks';
import type { Task } from '@/types/models';
import { cn } from '@/utils/cn';

/** Round checkbox that calls PATCH /api/task/done/{id}. */
export function TaskCheckbox({ task, size = 'md' }: { task: Task; size?: 'sm' | 'md' }) {
  const markDone = useMarkTaskDone();
  const dim = size === 'sm' ? 'size-5' : 'size-6';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={task.done}
      aria-label={task.done ? `Mark "${task.name}" as not done` : `Mark "${task.name}" as done`}
      disabled={markDone.isPending}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        markDone.mutate(task.id);
      }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border-2 transition-colors cursor-pointer',
        dim,
        task.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-brand-500 hover:bg-brand-50',
      )}
    >
      {markDone.isPending ? <Spinner className="size-3 text-slate-400" /> : task.done && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  );
}
