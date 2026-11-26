/**
 * Frontend domain models. Services convert backend DTOs into these shapes
 * (see services/mappers.ts), so components are isolated from backend naming.
 */

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
  lastModifiedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  done: boolean;
  expectStart?: string | null;
  expectEnd?: string | null;
  createdAt?: string;
  lastModifiedAt?: string;
  toDoId?: number | null;
}

export interface TodoList {
  id: number;
  topic: string;
  startTime?: string | null;
  numTask: number;
  numCompleteTask: number;
  createdAt?: string;
  lastModifiedAt?: string;
}

export interface Note {
  id: number;
  description: string;
  taskId: number;
  createdAt?: string;
  lastModifiedAt?: string;
}

export interface Project {
  id: number;
  topic: string;
  description: string;
  startTime?: string | null;
  expectEnd?: string | null;
  numTask: number;
  numCompleteTask: number;
  createdAt?: string;
  lastModifiedAt?: string;
}

/* ---------- Request payloads ---------- */

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}
export interface ResetPasswordPayload {
  newPassword: string;
  resetPasswordToken: string;
}

export interface TodoPayload {
  topic: string;
  startTime?: string | null;
}

export interface CreateTaskPayload {
  name: string;
  description: string;
  toDoListId: number;
  expectStart?: string | null;
  expectEnd?: string | null;
}
export type UpdateTaskPayload = Partial<Omit<CreateTaskPayload, 'toDoListId'>>;

export interface ProjectPayload {
  topic: string;
  description: string;
  startTime?: string | null;
  expectEnd?: string | null;
}

/* ---------- Notifications ---------- */

/** Backend `MessageType`: the event that produced a notification. */
export type NotificationType =
  | 'TODO_LIST_CREATED'
  | 'TODO_LIST_UPDATED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TODO_LIST_DUE';

export interface AppNotification {
  id: number;
  /** Kept as string so an unknown future type from the backend still renders. */
  type: NotificationType | (string & {});
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt?: string;
}
