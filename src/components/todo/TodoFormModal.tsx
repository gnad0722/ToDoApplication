import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '@/components/ui';
import { useCreateTodo, useUpdateTodo } from '@/hooks/useTodos';
import { LIMITS, todoSchema, type TodoForm } from '@/schemas';
import type { TodoList } from '@/types/models';
import { toApiDateTime, toInputDateTime } from '@/utils/date';
import { applyServerErrors } from '@/utils/formErrors';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pass a list to edit it; omit to create a new one. */
  todo?: TodoList | null;
  onSaved?: (todo: TodoList) => void;
}

export function TodoFormModal({ open, onClose, todo, onSaved }: Props) {
  const isEdit = !!todo;
  const create = useCreateTodo();
  const update = useUpdateTodo();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<TodoForm>({ resolver: zodResolver(todoSchema) });

  useEffect(() => {
    if (open) reset({ topic: todo?.topic ?? '', startTime: toInputDateTime(todo?.startTime) });
  }, [open, todo, reset]);

  const onSubmit = (values: TodoForm) => {
    const payload = { topic: values.topic.trim(), startTime: toApiDateTime(values.startTime) };
    const options = {
      onSuccess: (saved: TodoList) => {
        onSaved?.(saved);
        onClose();
      },
      onError: (e: unknown) => applyServerErrors(e, setError, ['topic', 'startTime']),
    };
    if (isEdit) update.mutate({ id: todo.id, payload }, options);
    else create.mutate(payload, options);
  };

  const pending = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit to-do list' : 'New to-do list'}
      description={isEdit ? undefined : 'Group related tasks together, e.g. "Weekend house cleaning".'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="todo-form" loading={pending}>
            {isEdit ? 'Save changes' : 'Create list'}
          </Button>
        </>
      }
    >
      <form id="todo-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Topic"
          placeholder="What is this list about?"
          autoFocus
          error={errors.topic?.message}
          counter={{ value: watch('topic') ?? '', min: LIMITS.todoTopicMin }}
          {...register('topic')}
        />
        <Input label="Start time" type="datetime-local" hint="Optional: when you plan to start" error={errors.startTime?.message} {...register('startTime')} />
      </form>
    </Modal>
  );
}
