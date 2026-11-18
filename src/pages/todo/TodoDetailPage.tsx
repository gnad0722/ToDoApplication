import { useState } from 'react';
import { ArrowLeft, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, ConfirmDialog, ErrorState, ProgressBar, Skeleton } from '@/components/ui';
import { TaskListSection } from '@/components/task/TaskListSection';
import { TodoFormModal } from '@/components/todo/TodoFormModal';
import { useDeleteTodo, useTodo } from '@/hooks/useTodos';
import { paths } from '@/routes/paths';
import { formatDateTime } from '@/utils/date';

export function TodoDetailPage() {
  const todoId = Number(useParams().id);
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const todoQuery = useTodo(todoId);
  const deleteTodo = useDeleteTodo();

  if (todoQuery.error) {
    return (
      <>
        <BackLink />
        <ErrorState error={todoQuery.error} onRetry={todoQuery.refetch} />
      </>
    );
  }

  const todo = todoQuery.data;

  return (
    <>
      <BackLink />

      {/* Header */}
      <Card className="mb-6 p-6">
        {!todo ? (
          <div className="space-y-3">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{todo.topic}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <CalendarDays className="size-4" /> Starts {formatDateTime(todo.startTime, 'anytime')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={<Pencil className="size-4" />} onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" icon={<Trash2 className="size-4" />} onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              </div>
            </div>
            <div className="mt-5">
              <ProgressBar done={todo.numCompleteTask} total={todo.numTask} />
            </div>
          </>
        )}
      </Card>

      <TaskListSection listId={todoId} />

      <TodoFormModal open={editOpen} onClose={() => setEditOpen(false)} todo={todo} />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete to-do list?"
        message={
          <>
            <b className="text-slate-800">“{todo?.topic}”</b> and all of its tasks will be permanently deleted.
          </>
        }
        loading={deleteTodo.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteTodo.mutate(todoId, { onSuccess: () => navigate(paths.todos, { replace: true }) })}
      />
    </>
  );
}

function BackLink() {
  return (
    <Link to={paths.todos} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
      <ArrowLeft className="size-4" /> All lists
    </Link>
  );
}
