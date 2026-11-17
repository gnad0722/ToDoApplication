import type { PageQuery, PageResponse } from '@/types/api';
import type { CreateTaskPayload, UpdateTaskPayload } from '@/types/models';
import { http, pageParams, unwrap } from './http';
import { mapPage, toTask } from './mappers';

export const taskService = {
  getByTodo: async (todoId: number, q: PageQuery) => {
    const page = await unwrap<PageResponse<Record<string, unknown>>>(
      http.get(`/api/task/todo/${todoId}`, { params: pageParams(q, 'filter') }),
    );
    return mapPage(page, (raw) => toTask(raw, todoId));
  },

  getById: async (id: number) => toTask(await unwrap(http.get(`/api/task/${id}`))),

  create: async (payload: CreateTaskPayload) => toTask(await unwrap(http.post('/api/task', payload))),

  update: async (id: number, payload: UpdateTaskPayload) => toTask(await unwrap(http.patch(`/api/task/${id}`, payload))),

  /** PATCH /api/task/done/{id}. Whether this toggles or only sets done depends on the backend. */
  markDone: async (id: number) => toTask(await unwrap(http.patch(`/api/task/done/${id}`))),

  remove: (id: number) => unwrap<void>(http.delete(`/api/task/${id}`)),
};
