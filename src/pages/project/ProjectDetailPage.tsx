import { useState } from 'react';
import { ArrowLeft, CalendarRange, ClipboardList, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DeadlineBadge } from '@/components/project/DeadlineBadge';
import { ProjectFormModal } from '@/components/project/ProjectFormModal';
import { TaskMeta } from '@/components/task/TaskMeta';
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, ProgressBar, Skeleton } from '@/components/ui';
import { useDeleteProject, useProject } from '@/hooks/useProjects';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { formatDateTime, fromNow } from '@/utils/date';

export function ProjectDetailPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { data: project, isLoading, error, refetch } = useProject(id);
  const deleteProject = useDeleteProject();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const back = (
    <Link to={paths.projects} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
      <ArrowLeft className="size-4" /> All projects
    </Link>
  );

  if (isLoading) {
    return (
      <>
        {back}
        <Skeleton className="mb-6 h-56" />
        <Skeleton className="h-40" />
      </>
    );
  }
  if (error || !project) {
    return (
      <>
        {back}
        <ErrorState error={error} onRetry={refetch} />
      </>
    );
  }

  const completed = project.numTask > 0 && project.numCompleteTask === project.numTask;

  return (
    <>
      {back}
      <Card className="mb-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <DeadlineBadge expectEnd={project.expectEnd} completed={completed} />
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{project.topic}</h1>
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

        <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-600">{project.description}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <CalendarRange className="size-3.5" /> Start
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">{formatDateTime(project.startTime, 'Not set')}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <CalendarRange className="size-3.5" /> Expected end
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">{formatDateTime(project.expectEnd, 'Not set')}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <ProgressBar done={project.numCompleteTask} total={project.numTask} />
          </div>
        </div>
        {project.lastModifiedAt && <p className="mt-4 text-xs text-slate-400">Updated {fromNow(project.lastModifiedAt)}</p>}
      </Card>

      <h2 className="mb-3 text-lg font-semibold text-slate-900">Tasks</h2>
      {project.tasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-7" />}
          title="No tasks linked to this project"
          description="The backend does not provide an endpoint to link tasks to a project yet."
        />
      ) : (
        <div className="space-y-2">
          {project.tasks.map((task) => {
            const inner = (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span className={cn('size-2.5 shrink-0 rounded-full', task.done ? 'bg-emerald-500' : 'bg-slate-300')} />
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm font-medium', task.done ? 'text-slate-400 line-through' : 'text-slate-900')}>{task.name}</p>
                  <TaskMeta task={task} />
                </div>
              </div>
            );
            return task.toDoId ? (
              <Link key={task.id} to={paths.todoDetail(task.toDoId, task.id)} className="block hover:opacity-80">
                {inner}
              </Link>
            ) : (
              <div key={task.id}>{inner}</div>
            );
          })}
        </div>
      )}

      <ProjectFormModal open={editOpen} onClose={() => setEditOpen(false)} project={project} />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete project?"
        message={
          <>
            <b className="text-slate-800">“{project.topic}”</b> will be permanently deleted.
          </>
        }
        loading={deleteProject.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteProject.mutate(project.id, { onSuccess: () => navigate(paths.projects, { replace: true }) })}
      />
    </>
  );
}
