import type { PageResponse } from '@/types/api';
import type { Note, Project, Task, TodoList } from '@/types/models';

/**
 * Converters from backend DTOs to frontend models.
 * The backend sends tasks in two shapes:
 *   - TaskDto (task endpoints):          { desc, isDone, toDoId, note }
 *   - Task entity (inside lists/projects): { description, done, toDoList, note }
 * Both are accepted here so the rest of the app sees one `Task` shape.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

export function toTask(raw: Raw, fallbackTodoId?: number): Task {
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.desc ?? raw.description ?? '',
    done: Boolean(raw.isDone ?? raw.done ?? false),
    expectStart: raw.expectStart ?? null,
    expectEnd: raw.expectEnd ?? null,
    createdAt: raw.createdAt,
    lastModifiedAt: raw.lastModifiedAt,
    toDoId: raw.toDoId ?? raw.toDoList?.id ?? fallbackTodoId ?? null,
    hasNote: raw.note != null,
  };
}

export function toTodo(raw: Raw): TodoList {
  const tasks = Array.isArray(raw.taskList) ? raw.taskList.map((t: Raw) => toTask(t, raw.id)) : [];
  return {
    id: raw.id,
    topic: raw.topic ?? '',
    startTime: raw.startTime ?? null,
    numTask: raw.numTask ?? tasks.length,
    numCompleteTask: raw.numCompleteTask ?? tasks.filter((t: Task) => t.done).length,
    createdAt: raw.createdAt,
    lastModifiedAt: raw.lastModifiedAt,
    tasks,
  };
}

export function toProject(raw: Raw): Project {
  const tasks = Array.isArray(raw.taskList) ? raw.taskList.map((t: Raw) => toTask(t)) : [];
  return {
    id: raw.id,
    topic: raw.topic ?? '',
    description: raw.description ?? raw.desription ?? '',
    startTime: raw.startTime ?? null,
    expectEnd: raw.expectEnd ?? null,
    numTask: raw.numTask ?? tasks.length,
    numCompleteTask: raw.numCompleteTask ?? tasks.filter((t: Task) => t.done).length,
    createdAt: raw.createdAt,
    lastModifiedAt: raw.lastModifiedAt,
    tasks,
  };
}

export function toNote(raw: Raw): Note {
  return {
    id: raw.id,
    description: raw.description ?? '',
    taskId: raw.taskId ?? raw.task?.id,
    createdAt: raw.createdAt,
    lastModifiedAt: raw.lastModifiedAt,
  };
}

export function mapPage<R, T>(page: PageResponse<R> | null | undefined, fn: (r: R) => T): PageResponse<T> {
  return {
    content: (page?.content ?? []).map(fn),
    meta: page?.meta ?? { page: 0, size: 0, totalElements: 0, totalPages: 0 },
  };
}
