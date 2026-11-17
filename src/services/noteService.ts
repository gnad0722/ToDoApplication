import type { Note } from '@/types/models';
import { ApiError } from '@/utils/errors';
import { http, unwrap } from './http';
import { toNote } from './mappers';

/** A task has at most one note; the note endpoints are keyed by taskId. */
export const noteService = {
  /** Returns null when the task has no note (404 or empty data). */
  getByTask: async (taskId: number): Promise<Note | null> => {
    try {
      const raw = await unwrap<Record<string, unknown> | null>(http.get(`/api/note/${taskId}`));
      return raw ? toNote(raw) : null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  create: async (taskId: number, description: string) =>
    toNote(await unwrap(http.post('/api/note/', { taskId, description }))),

  update: async (taskId: number, description: string) =>
    toNote(await unwrap(http.put(`/api/note/${taskId}`, { description }))),

  remove: (taskId: number) => unwrap<void>(http.delete(`/api/note/${taskId}`)),
};
