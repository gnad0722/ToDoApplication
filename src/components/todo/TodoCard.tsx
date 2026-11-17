import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Card, DropdownMenu, ProgressBar } from '@/components/ui';
import { paths } from '@/routes/paths';
import type { TodoList } from '@/types/models';
import { formatDateTime, fromNow } from '@/utils/date';

interface Props {
  todo: TodoList;
  onEdit: (todo: TodoList) => void;
  onDelete: (todo: TodoList) => void;
}

export function TodoCard({ todo, onEdit, onDelete }: Props) {
  const complete = todo.numTask > 0 && todo.numCompleteTask === todo.numTask;

  return (
    <Link to={paths.todoDetail(todo.id)} className="group block">
      <Card className="flex h-full flex-col p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-brand-200 group-hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-700">{todo.topic}</h3>
          <DropdownMenu
            items={[
              { label: 'Edit', icon: <Pencil className="size-4" />, onClick: () => onEdit(todo) },
              { label: 'Delete', icon: <Trash2 className="size-4" />, onClick: () => onDelete(todo), danger: true },
            ]}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {formatDateTime(todo.startTime, 'No start time')}
          </span>
          {complete && <Badge tone="green">Completed</Badge>}
        </div>

        <div className="mt-auto pt-5">
          {todo.numTask === 0 ? <p className="text-xs text-slate-400">No tasks yet</p> : <ProgressBar done={todo.numCompleteTask} total={todo.numTask} />}
          {todo.lastModifiedAt && <p className="mt-3 text-xs text-slate-400">Updated {fromNow(todo.lastModifiedAt)}</p>}
        </div>
      </Card>
    </Link>
  );
}
