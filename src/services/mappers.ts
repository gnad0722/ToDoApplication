import type { PageResponse } from '@/types/api';
import type { Note, Project, Task, TodoList } from '@/types/models';

/** Converters from backend DTOs to frontend models. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

export function toTask(raw: Raw, fallbackTodoId?: number): Task {
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? '',
    // TaskDto declares `isDone`, but a Lombok `boolean isDone` field is
    // serialised by Jackson as `done`, so both names are accepted.
    done: Boolean(raw.isDone ?? raw.done ?? false),
    expectStart: raw.expectStart ?? null,
    expectEnd: raw.expectEnd ?? null,
    createdAt: raw.createdAt,
    lastModifiedAt: raw.lastModifiedAt,
    toDoId: raw.toDoId ?? fallbackTodoId ?? null,
  };
}

export function toTodo(raw: Raw): TodoList {
  return {
    id: raw.id,
    topic: raw.topic ?? '',
    startTime: raw.startTime ?? null,
    numTask: raw.numTask ?? 0,
    numCompleteTask: raw.numCompleteTask ?? 0,
    createdAt: raw.createdAt,
    lastModifiedAt: raw.lastModifiedAt,
  };
}

export function toProject(raw: Raw): Project {
  return {
    id: raw.id,
    topic: raw.topic ?? '',
    description: raw.description ?? '',
    startTime: raw.startTime ?? null,
    expectEnd: raw.expectEnd ?? null,
    numTask: raw.numTask ?? 0,
    numCompleteTask: raw.numCompleteTask ?? 0,
    createdAt: raw.createdAt,
    lastModifiedAt: raw.lastModifiedAt,
  };
}

export function toNote(raw: Raw): Note {
  return {
    id: raw.id,
    description: raw.description ?? '',
    taskId: raw.taskId,
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
