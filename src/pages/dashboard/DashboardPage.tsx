import { useMemo, type ReactNode } from 'react';
import { ArrowRight, CheckCircle2, ClipboardList, FolderKanban, ListTodo, PartyPopper, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DeadlineBadge } from '@/components/project/DeadlineBadge';
import { TaskCheckbox } from '@/components/task/TaskCheckbox';
import { TaskMeta } from '@/components/task/TaskMeta';
import { Button, Card, EmptyState, ErrorState, ProgressBar, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useProjectPage } from '@/hooks/useProjects';
import { useTodoPage } from '@/hooks/useTodos';
import { paths } from '@/routes/paths';
import type { Task, TodoList } from '@/types/models';
import { percent } from '@/utils/cn';
import { parseDate } from '@/utils/date';

/**
 * The backend has no "all my tasks" endpoint, so the dashboard reads the
 * `taskList` embedded in each to-do list (first DASHBOARD_LIMIT lists).
 */
const DASHBOARD_LIMIT = 50;
const UPCOMING_LIMIT = 8;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

type TaskWithList = Task & { listTopic: string; listId: number };

function collectUpcoming(todos: TodoList[]): TaskWithList[] {
  const all = todos.flatMap((todo) => todo.tasks.map((t) => ({ ...t, listTopic: todo.topic, listId: todo.id })));
  const time = (t: Task) => (parseDate(t.expectStart) ?? parseDate(t.expectEnd))?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return all.filter((t) => !t.done).sort((a, b) => time(a) - time(b)).slice(0, UPCOMING_LIMIT);
}

function StatCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: ReactNode; tone: string }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={`flex size-12 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

function SectionHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
        View all <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const todosQuery = useTodoPage({ page: 0, size: DASHBOARD_LIMIT, sort: 'lastModifiedAt,desc' });
  const projectsQuery = useProjectPage({ page: 0, size: 4, sort: 'expectEnd,asc' });

  const todos = useMemo(() => todosQuery.data?.content ?? [], [todosQuery.data]);
  const stats = useMemo(() => {
    const total = todos.reduce((s, t) => s + t.numTask, 0);
    const done = todos.reduce((s, t) => s + t.numCompleteTask, 0);
    return { total, done, rate: percent(done, total) };
  }, [todos]);
  const upcoming = useMemo(() => collectUpcoming(todos), [todos]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {greeting()}, {user?.username} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here is what is going on with your work today.</p>
        </div>
        <Button icon={<ListTodo className="size-4" />} onClick={() => navigate(paths.todos)}>
          Go to my lists
        </Button>
      </div>

      {/* Stats */}
      {todosQuery.isLoading ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : todosQuery.error ? (
        <div className="mb-8">
          <ErrorState error={todosQuery.error} onRetry={todosQuery.refetch} />
        </div>
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<ListTodo className="size-6" />} label="To-do lists" value={todosQuery.data?.meta.totalElements ?? 0} tone="bg-brand-50 text-brand-600" />
          <StatCard icon={<ClipboardList className="size-6" />} label="Total tasks" value={stats.total} tone="bg-sky-50 text-sky-600" />
          <StatCard icon={<CheckCircle2 className="size-6" />} label="Completed" value={stats.done} tone="bg-emerald-50 text-emerald-600" />
          <StatCard icon={<TrendingUp className="size-6" />} label="Completion rate" value={`${stats.rate}%`} tone="bg-amber-50 text-amber-600" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Upcoming tasks */}
        <section className="lg:col-span-3">
          <SectionHeader title="Upcoming tasks" to={paths.todos} />
          {todosQuery.isLoading ? (
            <Skeleton className="h-72" />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={<PartyPopper className="size-7" />}
              title={stats.total ? 'All caught up!' : 'No tasks yet'}
              description={stats.total ? 'Every task is done. Enjoy your free time.' : 'Create a list and add a few tasks to get started.'}
            />
          ) : (
            <Card className="divide-y divide-slate-100">
              {upcoming.map((task) => (
                <Link key={task.id} to={paths.todoDetail(task.listId, task.id)} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                  <TaskCheckbox task={task} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{task.name}</p>
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="truncate text-xs text-brand-600">{task.listTopic}</span>
                      <TaskMeta task={task} />
                    </div>
                  </div>
                </Link>
              ))}
            </Card>
          )}
        </section>

        {/* Recent lists + projects */}
        <div className="space-y-6 lg:col-span-2">
          <section>
            <SectionHeader title="Recent lists" to={paths.todos} />
            {todosQuery.isLoading ? (
              <Skeleton className="h-48" />
            ) : todos.length === 0 ? (
              <Card className="p-5 text-center text-sm text-slate-500">
                No lists yet.{' '}
                <Link to={paths.todos} className="font-medium text-brand-600">
                  Create one
                </Link>
              </Card>
            ) : (
              <Card className="divide-y divide-slate-100">
                {todos.slice(0, 4).map((todo) => (
                  <Link key={todo.id} to={paths.todoDetail(todo.id)} className="block px-4 py-3 transition-colors hover:bg-slate-50">
                    <p className="mb-2 truncate text-sm font-medium text-slate-900">{todo.topic}</p>
                    <ProgressBar done={todo.numCompleteTask} total={todo.numTask} showLabel={false} />
                    <p className="mt-1 text-xs text-slate-500">
                      {todo.numCompleteTask}/{todo.numTask} done
                    </p>
                  </Link>
                ))}
              </Card>
            )}
          </section>

          <section>
            <SectionHeader title="Projects" to={paths.projects} />
            {projectsQuery.isLoading ? (
              <Skeleton className="h-40" />
            ) : projectsQuery.error ? (
              <ErrorState error={projectsQuery.error} onRetry={projectsQuery.refetch} />
            ) : (projectsQuery.data?.content.length ?? 0) === 0 ? (
              <Card className="p-5 text-center text-sm text-slate-500">
                <FolderKanban className="mx-auto mb-2 size-6 text-slate-300" />
                No projects yet.{' '}
                <Link to={paths.projects} className="font-medium text-brand-600">
                  Create one
                </Link>
              </Card>
            ) : (
              <Card className="divide-y divide-slate-100">
                {projectsQuery.data?.content.map((p) => (
                  <Link key={p.id} to={paths.projectDetail(p.id)} className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                    <span className="truncate text-sm font-medium text-slate-900">{p.topic}</span>
                    <DeadlineBadge expectEnd={p.expectEnd} completed={p.numTask > 0 && p.numCompleteTask === p.numTask} />
                  </Link>
                ))}
              </Card>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
