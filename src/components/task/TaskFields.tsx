import type { UseFormReturn } from 'react-hook-form';
import { Input, Textarea } from '@/components/ui';
import { LIMITS, type TaskForm } from '@/schemas';
import type { Task } from '@/types/models';
import { toApiDateTime, toInputDateTime } from '@/utils/date';

/** Fields that can receive server validation messages (keys of the request JSON). */
export const TASK_FORM_FIELDS = ['name', 'description', 'expectStart', 'expectEnd'] as const;

/** Form fields shared by "create task" (modal) and "edit task" (panel). */
export function TaskFields({ form }: { form: UseFormReturn<TaskForm> }) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <Input
        label="Name"
        placeholder="e.g. Buy groceries"
        error={errors.name?.message}
        counter={{ value: watch('name') ?? '', min: LIMITS.taskNameMin }}
        {...register('name')}
      />
      <Textarea label="Description" rows={3} placeholder="What needs to be done?" error={errors.description?.message} {...register('description')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Expected start" type="datetime-local" error={errors.expectStart?.message} {...register('expectStart')} />
        <Input label="Expected end" type="datetime-local" error={errors.expectEnd?.message} {...register('expectEnd')} />
      </div>
    </div>
  );
}

export function taskToForm(task?: Task | null): TaskForm {
  return {
    name: task?.name ?? '',
    description: task?.description ?? '',
    expectStart: toInputDateTime(task?.expectStart),
    expectEnd: toInputDateTime(task?.expectEnd),
  };
}

export function formToTaskPayload(values: TaskForm) {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    expectStart: toApiDateTime(values.expectStart),
    expectEnd: toApiDateTime(values.expectEnd),
  };
}
