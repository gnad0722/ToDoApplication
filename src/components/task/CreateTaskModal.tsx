import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Modal } from '@/components/ui';
import { useCreateTask } from '@/hooks/useTasks';
import { taskSchema, type TaskForm } from '@/schemas';
import { formToTaskPayload, TaskFields, taskToForm } from './TaskFields';

interface Props {
  open: boolean;
  onClose: () => void;
  todoId: number;
  /** Pre-fills the name, e.g. from the quick-add bar. */
  initialName?: string;
}

export function CreateTaskModal({ open, onClose, todoId, initialName }: Props) {
  const create = useCreateTask();
  const form = useForm<TaskForm>({ resolver: zodResolver(taskSchema), defaultValues: taskToForm() });

  useEffect(() => {
    if (open) form.reset({ ...taskToForm(), name: initialName ?? '' });
  }, [open, initialName, form]);

  const onSubmit = (values: TaskForm) => {
    create.mutate({ ...formToTaskPayload(values), toDoListId: todoId }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New task"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="create-task-form" loading={create.isPending}>
            Add task
          </Button>
        </>
      }
    >
      <form id="create-task-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <TaskFields form={form} />
      </form>
    </Modal>
  );
}
