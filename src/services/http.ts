import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import type { ApiResponse, PageQuery } from '@/types/api';
import type { AuthTokens } from '@/types/models';
import { ApiError, toApiError } from '@/utils/errors';
import { tokenStorage } from './tokenStorage';

/**
 * Shared axios instance.
 *  - Adds `Authorization: Bearer <token>` to every request.
 *  - On 401/403 it refreshes the access token once (shared between concurrent
 *    requests) and retries; if refreshing fails the session is ended.
 *  - Arrays are sent as repeated params (filters=a&filters=b), as Spring expects.
 */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: { indexes: null },
});

/** Endpoints that must never trigger a token refresh. */
const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/verify-otp',
  '/api/auth/reset-password',
];

let sessionExpiredHandler: (() => void) | null = null;
/** Registered by AuthProvider so the HTTP layer can end the session without importing React. */
export function onSessionExpired(handler: () => void) {
  sessionExpiredHandler = handler;
}

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const rawToken = tokenStorage.getRefreshToken();
  if (!rawToken) throw new ApiError('No refresh token', 401);
  // Plain axios (not `http`) so this call skips the interceptors.
  const res = await axios.post<ApiResponse<AuthTokens>>(`${env.apiBaseUrl}/api/auth/refresh`, { rawToken });
  const tokens = res.data?.data;
  if (!tokens?.accessToken) throw new ApiError('Refresh failed', 401);
  tokenStorage.save(tokens);
  return tokens.accessToken;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isAuthPath = PUBLIC_AUTH_PATHS.some((p) => original?.url?.startsWith(p));

    if (original && !original._retried && !isAuthPath && (status === 401 || status === 403) && tokenStorage.getRefreshToken()) {
      original._retried = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch {
        tokenStorage.clear();
        sessionExpiredHandler?.();
        return Promise.reject(new ApiError('Your session has expired. Please log in again.', 401));
      }
    }

    if (status === 401 && !isAuthPath) {
      tokenStorage.clear();
      sessionExpiredHandler?.();
    }
    return Promise.reject(error);
  },
);

/** Unwraps the `{ success, data, message }` envelope and normalises errors. */
export async function unwrap<T>(call: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  try {
    const res = await call;
    const body = res.data;
    if (body && body.success === false) {
      throw new ApiError(body.message || 'Request failed.', res.status, body.data);
    }
    return body?.data as T;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Builds Spring Pageable query params.
 * `filterParam` differs per endpoint in the backend: todo uses `filters`,
 * task and project use `filter`.
 */
export function pageParams(q: PageQuery, filterParam: 'filter' | 'filters') {
  return {
    page: q.page,
    size: q.size,
    ...(q.sort ? { sort: q.sort } : {}),
    ...(q.filters && q.filters.length ? { [filterParam]: q.filters } : {}),
  };
}
