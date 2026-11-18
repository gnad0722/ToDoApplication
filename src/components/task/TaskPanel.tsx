import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Badge, Button, ConfirmDialog, Drawer, ErrorState, Skeleton } from '@/components/ui';
import { useDeleteTask, useMarkTaskDone, useTask, useUpdateTask } from '@/hooks/useTasks';
import { taskSchema, type TaskForm } from '@/schemas';
import { formatDateTime, fromNow, isOverdue } from '@/utils/date';
import { applyServerErrors } from '@/utils/formErrors';
import { NoteSection } from './NoteSection';
import { formToTaskPatch, TASK_FORM_FIELDS, TaskFields, taskToForm } from './TaskFields';

interface Props {
  taskId: number | null;
  /** Open directly in the edit form (e.g. from the pencil button on a row). */
  startInEdit?: boolean;
  onClose: () => void;
}

/** Side panel with task details, editing, completion, note and delete. */
export function TaskPanel({ taskId, startInEdit = false, onClose }: Props) {
  const { data: task, isLoading, error, refetch } = useTask(taskId);
  const update = useUpdateTask();
  const markDone = useMarkTaskDone();
  const remove = useDeleteTask();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const form = useForm<TaskForm>({ resolver: zodResolver(taskSchema) });

  // When another task is opened: show its details, or its edit form if requested.
  // Keyed on the loaded task's id (not the object) so a refetch after saving
  // does not reopen the form.
  const loadedId = task?.id;
  useEffect(() => {
    if (startInEdit && task && task.id === taskId) {
      form.reset(taskToForm(task));
      setEditing(true);
    } else {
      setEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, loadedId, startInEdit]);

  const startEditing = () => {
    form.reset(taskToForm(task));
    setEditing(true);
  };

  const onSubmit = (values: TaskForm) => {
    if (!task) return;
    const payload = formToTaskPatch(taskToForm(task), values);
    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }
    update.mutate(
      { id: task.id, payload },
      {
        onSuccess: () => setEditing(false),
        onError: (e) => applyServerErrors(e, form.setError, TASK_FORM_FIELDS),
      },
    );
  };

  const overdue = task && !task.done && isOverdue(task.expectEnd);

  return (
    <Drawer
      open={taskId != null}
      onClose={onClose}
      title={editing ? 'Edit task' : 'Task details'}
      footer={
        task &&
        (editing ? (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={update.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="edit-task-form" loading={update.isPending}>
              Save changes
            </Button>
          </div>
        ) : (
          <div className="flex justify-start gap-2">
            <Button variant="ghost" className="text-red-600 hover:bg-red-50" icon={<Trash2 className="size-4" />} onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </div>
        ))
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : task && editing ? (
        <form id="edit-task-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <TaskFields form={form} />
        </form>
      ) : task ? (
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {task.done ? <Badge tone="green">Completed</Badge> : <Badge tone="brand">In progress</Badge>}
              {overdue && <Badge tone="red">Overdue</Badge>}
            </div>
            <div className="flex items-start justify-between gap-3">
              <h2 className={task.done ? 'text-xl font-semibold text-slate-400 line-through' : 'text-xl font-semibold text-slate-900'}>{task.name}</h2>
              <Button variant="secondary" size="sm" icon={<Pencil className="size-4" />} onClick={startEditing}>
                Edit
              </Button>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap text-slate-600">{task.description || 'No description'}</p>
          </div>

          {/* Completion is one-way in the backend, so there is no "undo". */}
          {task.done ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="size-4" /> Completed
            </div>
          ) : (
            <Button className="w-full" loading={markDone.isPending} icon={<Circle className="size-4" />} onClick={() => markDone.mutate(task.id)}>
              Mark as done
            </Button>
          )}

          <dl className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm">
            <div>
              <dt className="flex items-center gap-1 text-xs text-slate-500">
                <CalendarClock className="size-3.5" /> Expected start
              </dt>
              <dd className="mt-1 font-medium text-slate-800">{formatDateTime(task.expectStart, 'Not set')}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-slate-500">
                <CalendarClock className="size-3.5" /> Expected end
              </dt>
              <dd className={overdue ? 'mt-1 font-medium text-red-600' : 'mt-1 font-medium text-slate-800'}>{formatDateTime(task.expectEnd, 'Not set')}</dd>
            </div>
            {task.createdAt && (
              <div className="col-span-2 text-xs text-slate-400">
                Created {fromNow(task.createdAt)}
                {task.lastModifiedAt && ` · updated ${fromNow(task.lastModifiedAt)}`}
              </div>
            )}
          </dl>

          <NoteSection taskId={task.id} />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete task?"
        message={
          <>
            <b className="text-slate-800">“{task?.name}”</b> and its note will be permanently deleted.
          </>
        }
        loading={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          task &&
          remove.mutate(task.id, {
            onSuccess: () => {
              setConfirmDelete(false);
              onClose();
            },
          })
        }
      />
    </Drawer>
  );
}
