/** Single source of truth for URLs, so links never get out of sync with routes. */
export const paths = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  todos: '/lists',
  todoDetail: (id: number | string, taskId?: number) => `/lists/${id}${taskId ? `?task=${taskId}` : ''}`,
  projects: '/projects',
  projectDetail: (id: number | string) => `/projects/${id}`,
  profile: '/profile',
} as const;
