import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/config/queryKeys';
import { taskService } from '@/services/taskService';
import type { PageQuery } from '@/types/api';
import type { CreateTaskPayload, UpdateTaskPayload } from '@/types/models';
import { getErrorMessage } from '@/utils/errors';

/** Task changes affect task lists AND the counters shown on lists/projects/dashboard. */
function invalidateTaskRelated(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: queryKeys.tasks.all });
  qc.invalidateQueries({ queryKey: queryKeys.todos.all });
  qc.invalidateQueries({ queryKey: queryKeys.projects.all });
}

export function useTasksByTodo(todoId: number, q: PageQuery) {
  return useQuery({
    queryKey: queryKeys.tasks.byTodo(todoId, q),
    queryFn: () => taskService.getByTodo(todoId, q),
    enabled: Number.isFinite(todoId),
    placeholderData: keepPreviousData,
  });
}

export function useTask(id: number | null) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id ?? -1),
    queryFn: () => taskService.getById(id as number),
    enabled: id != null,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.create(payload),
    onSuccess: () => {
      invalidateTaskRelated(qc);
      toast.success('Task created');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTaskPayload }) => taskService.update(id, payload),
    onSuccess: () => {
      invalidateTaskRelated(qc);
      toast.success('Task updated');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useMarkTaskDone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskService.markDone(id),
    onSuccess: (task) => {
      invalidateTaskRelated(qc);
      toast.success(task.done ? 'Task completed 🎉' : 'Task marked as not done');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskService.remove(id),
    onSuccess: (_d, id) => {
      qc.removeQueries({ queryKey: queryKeys.tasks.detail(id) });
      invalidateTaskRelated(qc);
      toast.success('Task deleted');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
