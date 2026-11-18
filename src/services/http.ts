import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import type { ApiResponse, PageQuery } from '@/types/api';
import type { AuthTokens } from '@/types/models';
import { ApiError, fromErrorBody, toApiError } from '@/utils/errors';
import { tokenStorage } from './tokenStorage';

/**
 * Shared axios instance. Error handling follows docs/error-response-format.md:
 *  - Adds `Authorization: Bearer <token>` to every request.
 *  - 401 on a protected endpoint -> refresh the access token once (shared
 *    between concurrent requests) and retry. If the refresh is rejected the
 *    session is ended and the user is sent to the login page.
 *  - 403 means "no permission" (expired tokens are 401), so it is NOT retried.
 *  - Arrays are sent as repeated params (filters=a&filters=b), as Spring expects.
 */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: { indexes: null },
});

/** Endpoints whose 401 is a normal answer (e.g. wrong password), never a reason to refresh. */
const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/verify-otp',
  '/api/auth/reset-password',
];

let sessionExpiredHandler: ((message: string) => void) | null = null;
/** Registered by AuthProvider so the HTTP layer can end the session without importing React. */
export function onSessionExpired(handler: (message: string) => void) {
  sessionExpiredHandler = handler;
}

function endSession(message: string): ApiError {
  tokenStorage.clear();
  sessionExpiredHandler?.(message);
  return new ApiError(message, 401);
}

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

/**
 * POST /api/auth/refresh. Throws an ApiError; `status` is undefined when the
 * server could not be reached (the session is then kept).
 */
async function refreshAccessToken(): Promise<string> {
  const rawToken = tokenStorage.getRefreshToken();
  if (!rawToken) throw new ApiError('Session expired, please log in again', 401);
  try {
    // Plain axios (not `http`) so this call skips the interceptors.
    const res = await axios.post<ApiResponse<AuthTokens>>(`${env.apiBaseUrl}/api/auth/refresh`, { rawToken });
    const tokens = res.data?.data;
    if (!tokens?.accessToken) throw new ApiError('Session expired, please log in again', 401);
    tokenStorage.save(tokens);
    return tokens.accessToken;
  } catch (e) {
    throw toApiError(e);
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isAuthPath = PUBLIC_AUTH_PATHS.some((p) => original?.url?.startsWith(p));

    if (status !== 401 || isAuthPath || !original) return Promise.reject(error);

    // Already retried with a fresh token, or nothing to refresh with.
    if (original._retried || !tokenStorage.getRefreshToken()) {
      return Promise.reject(endSession(toApiError(error).message));
    }

    original._retried = true;
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return http(original);
    } catch (e) {
      const refreshError = toApiError(e);
      // Backend down: keep the session, just report the network problem.
      if (refreshError.isNetworkError) return Promise.reject(refreshError);
      return Promise.reject(endSession(refreshError.message));
    }
  },
);

/** Unwraps the `{ success, data, message }` envelope and normalises errors to ApiError. */
export async function unwrap<T>(call: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  try {
    const res = await call;
    const body = res.data;
    // Errors should come with a 4xx/5xx status, but stay safe if one arrives as 200.
    if (body && body.success === false) throw fromErrorBody(res.status, body);
    return body?.data as T;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Builds Spring Pageable + filter query params, e.g.
 *   ?page=0&size=20&sort=expectStart,asc&filters=isDone:EQ:false
 * `filterParam` differs per endpoint in the backend: todo and task use
 * `filters`, project uses `filter`.
 */
export function pageParams(q: PageQuery, filterParam: 'filter' | 'filters') {
  return {
    page: q.page,
    size: q.size,
    ...(q.sort && q.sort.length ? { sort: q.sort } : {}),
    ...(q.filters && q.filters.length ? { [filterParam]: q.filters } : {}),
  };
}
