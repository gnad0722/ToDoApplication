import type { PageQuery } from '@/types/api';

/**
 * Query key factory. Keeping every key here makes cache invalidation
 * predictable: invalidating `todos.all` refreshes every to-do query, etc.
 */
export const queryKeys = {
  me: ['auth', 'me'] as const,
  todos: {
    all: ['todos'] as const,
    list: (q: PageQuery) => ['todos', 'list', q] as const,
    detail: (id: number) => ['todos', 'detail', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    byTodo: (todoId: number, q: PageQuery) => ['tasks', 'todo', todoId, q] as const,
    detail: (id: number) => ['tasks', 'detail', id] as const,
  },
  notes: {
    all: ['notes'] as const,
    byTask: (taskId: number) => ['notes', 'task', taskId] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: (q: PageQuery) => ['projects', 'list', q] as const,
    detail: (id: number) => ['projects', 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    recent: ['notifications', 'recent'] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
} as const;
