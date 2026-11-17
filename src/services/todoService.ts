import type { PageQuery, PageResponse } from '@/types/api';
import type { TodoList, TodoPayload } from '@/types/models';
import { http, pageParams, unwrap } from './http';
import { mapPage, toTodo } from './mappers';

export const todoService = {
  getMine: async (q: PageQuery): Promise<PageResponse<TodoList>> => {
    const page = await unwrap<PageResponse<Record<string, unknown>>>(
      http.get('/api/todo/me', { params: pageParams(q, 'filters') }),
    );
    return mapPage(page, toTodo);
  },

  getById: async (id: number) => toTodo(await unwrap(http.get(`/api/todo/${id}`))),

  create: async (payload: TodoPayload) => toTodo(await unwrap(http.post('/api/todo/', payload))),

  update: async (id: number, payload: Partial<TodoPayload>) =>
    toTodo(await unwrap(http.patch(`/api/todo/${id}`, payload))),

  remove: (id: number) => unwrap<void>(http.delete(`/api/todo/${id}`)),
};
