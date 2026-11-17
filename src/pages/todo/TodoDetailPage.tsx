import { useState, type FormEvent } from 'react';
import { ArrowLeft, CalendarDays, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, ListSkeleton, Pagination, ProgressBar, Skeleton, Tabs } from '@/components/ui';
import { CreateTaskModal } from '@/components/task/CreateTaskModal';
import { TaskPanel } from '@/components/task/TaskPanel';
import { TaskRow } from '@/components/task/TaskRow';
import { TodoFormModal } from '@/components/todo/TodoFormModal';
import { PAGE_SIZE } from '@/config/env';
import { useTasksByTodo } from '@/hooks/useTasks';
import { useDeleteTodo, useTodo } from '@/hooks/useTodos';
import { paths } from '@/routes/paths';
import { formatDateTime } from '@/utils/date';
import { buildFilter, compactFilters } from '@/utils/filters';

type StatusTab = 'all' | 'active' | 'done';
const tabs: { value: StatusTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Completed' },
];

export function TodoDetailPage() {
  const todoId = Number(useParams().id);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const openTaskId = searchParams.get('task') ? Number(searchParams.get('task')) : null;

  const [tab, setTab] = useState<StatusTab>('all');
  const [page, setPage] = useState(0);
  const [quickName, setQuickName] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const todoQuery = useTodo(todoId);
  const tasksQuery = useTasksByTodo(todoId, {
    page,
    size: PAGE_SIZE.tasks,
    sort: 'createdAt,asc',
    filters: compactFilters(tab !== 'all' && buildFilter('done', tab === 'done')),
  });
  const deleteTodo = useDeleteTodo();

  const openTask = (id: number) => setSearchParams({ task: String(id) });
  const closeTask = () => setSearchParams({}, { replace: true });

  const onQuickAdd = (e: FormEvent) => {
    e.preventDefault();
    setCreateOpen(true);
  };

  if (todoQuery.error) {
    return (
      <>
        <BackLink />
        <ErrorState error={todoQuery.error} onRetry={todoQuery.refetch} />
      </>
    );
  }

  const todo = todoQuery.data;
  const tasks = tasksQuery.data?.content ?? [];

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

      {/* Quick add */}
      <form onSubmit={onQuickAdd} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Plus className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-brand-500" />
          <input
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Add a task… (press Enter)"
            aria-label="New task name"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-11 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
          />
        </div>
        <Button type="submit" size="lg" className="h-12">
          Add
        </Button>
      </form>

      <div className="mb-4 flex items-center justify-between">
        <Tabs value={tab} onChange={(v) => { setTab(v); setPage(0); }} items={tabs} />
        {tasksQuery.data && <span className="text-sm text-slate-500">{tasksQuery.data.meta.totalElements} tasks</span>}
      </div>

      {/* Tasks */}
      {tasksQuery.isLoading ? (
        <ListSkeleton />
      ) : tasksQuery.error ? (
        <ErrorState error={tasksQuery.error} onRetry={tasksQuery.refetch} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-7" />}
          title={tab === 'all' ? 'No tasks yet' : tab === 'active' ? 'Nothing left to do 🎉' : 'No completed tasks yet'}
          description={tab === 'all' ? 'Add your first task using the box above.' : undefined}
        />
      ) : (
        <div className={tasksQuery.isFetching ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onOpen={(t) => openTask(t.id)} />
            ))}
          </div>
          {tasksQuery.data && <Pagination meta={tasksQuery.data.meta} onPageChange={setPage} />}
        </div>
      )}

      <CreateTaskModal
        open={createOpen}
        initialName={quickName}
        todoId={todoId}
        onClose={() => {
          setCreateOpen(false);
          setQuickName('');
        }}
      />
      <TaskPanel taskId={openTaskId} onClose={closeTask} />
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
