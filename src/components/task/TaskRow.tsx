import { ChevronRight, Pencil } from 'lucide-react';
import { IconButton } from '@/components/ui';
import type { Task } from '@/types/models';
import { cn } from '@/utils/cn';
import { TaskCheckbox } from './TaskCheckbox';
import { TaskMeta } from './TaskMeta';

interface Props {
  task: Task;
  onOpen: (task: Task) => void;
  /** Opens the task straight in the edit form. */
  onEdit?: (task: Task) => void;
}

export function TaskRow({ task, onOpen, onEdit }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ') && onOpen(task)}
      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-brand-200 hover:bg-brand-50/30 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
    >
      <TaskCheckbox task={task} />
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', task.done ? 'text-slate-400 line-through' : 'text-slate-900')}>{task.name}</p>
        {task.description && <p className="truncate text-xs text-slate-500">{task.description}</p>}
        <div className="mt-1">
          <TaskMeta task={task} />
        </div>
      </div>
      {onEdit && (
        <IconButton
          aria-label={`Edit "${task.name}"`}
          title="Edit task"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
        >
          <Pencil className="size-4" />
        </IconButton>
      )}
      <ChevronRight className="size-4 shrink-0 text-slate-300 group-hover:text-slate-500" />
    </div>
  );
}
