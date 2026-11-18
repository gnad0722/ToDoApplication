import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/config/queryKeys';
import { todoService } from '@/services/todoService';
import type { PageQuery } from '@/types/api';
import type { TodoPayload } from '@/types/models';
import { notifyMutationError } from '@/utils/formErrors';

export function useTodoPage(q: PageQuery) {
  return useQuery({
    queryKey: queryKeys.todos.list(q),
    queryFn: () => todoService.getMine(q),
    placeholderData: keepPreviousData,
  });
}

export function useTodo(id: number) {
  return useQuery({
    queryKey: queryKeys.todos.detail(id),
    queryFn: () => todoService.getById(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TodoPayload) => todoService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.todos.all });
      toast.success('To-do list created');
    },
    onError: notifyMutationError,
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TodoPayload> }) => todoService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.todos.all });
      toast.success('To-do list updated');
    },
    onError: notifyMutationError,
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => todoService.remove(id),
    onSuccess: (_d, id) => {
      qc.removeQueries({ queryKey: queryKeys.todos.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.todos.all });
      qc.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success('To-do list deleted');
    },
    onError: notifyMutationError,
  });
}
