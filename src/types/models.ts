/**
 * Frontend domain models. Services convert backend DTOs into these shapes,
 * so components never deal with backend naming inconsistencies
 * (e.g. TaskDto.desc vs Task.description, isDone vs done).
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
  hasNote: boolean;
}

export interface TodoList {
  id: number;
  topic: string;
  startTime?: string | null;
  numTask: number;
  numCompleteTask: number;
  createdAt?: string;
  lastModifiedAt?: string;
  tasks: Task[];
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
  tasks: Task[];
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
