import { useState, type FormEvent } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button, EmptyState, ErrorState, ListSkeleton, Pagination, Tabs } from '@/components/ui';
import { PAGE_SIZE } from '@/config/env';
import { useTasksByTodo } from '@/hooks/useTasks';
import { compactFilters, taskFilters } from '@/utils/filters';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskPanel } from './TaskPanel';
import { TaskRow } from './TaskRow';

type StatusTab = 'all' | 'active' | 'done';
const tabs: { value: StatusTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Completed' },
];

interface Props {
  /**
   * Id of the to-do list the tasks belong to. A project is a to-do list in the
   * backend (JOINED inheritance), so a project id works here too.
   */
  listId: number;
}

/** Quick-add bar, status tabs, paginated task list, create modal and detail panel. */
export function TaskListSection({ listId }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const openTaskId = searchParams.get('task') ? Number(searchParams.get('task')) : null;

  const [tab, setTab] = useState<StatusTab>('all');
  const [page, setPage] = useState(0);
  const [quickName, setQuickName] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const tasksQuery = useTasksByTodo(listId, {
    page,
    size: PAGE_SIZE.tasks,
    sort: 'createdAt,asc',
    filters: compactFilters(tab !== 'all' && taskFilters.done(tab === 'done')),
  });

  const editRequested = searchParams.get('edit') === '1';
  const openTask = (id: number, edit = false) => setSearchParams(edit ? { task: String(id), edit: '1' } : { task: String(id) });
  const closeTask = () => setSearchParams({}, { replace: true });

  const onQuickAdd = (e: FormEvent) => {
    e.preventDefault();
    setCreateOpen(true);
  };

  const tasks = tasksQuery.data?.content ?? [];

  return (
    <>
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
        <Tabs
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPage(0);
          }}
          items={tabs}
        />
        {tasksQuery.data && <span className="text-sm text-slate-500">{tasksQuery.data.meta.totalElements} tasks</span>}
      </div>

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
              <TaskRow key={task.id} task={task} onOpen={(t) => openTask(t.id)} onEdit={(t) => openTask(t.id, true)} />
            ))}
          </div>
          {tasksQuery.data && <Pagination meta={tasksQuery.data.meta} onPageChange={setPage} />}
        </div>
      )}

      <CreateTaskModal
        open={createOpen}
        initialName={quickName}
        todoId={listId}
        onClose={() => {
          setCreateOpen(false);
          setQuickName('');
        }}
      />
      <TaskPanel taskId={openTaskId} startInEdit={editRequested} onClose={closeTask} />
    </>
  );
}
