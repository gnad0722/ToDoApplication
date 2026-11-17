import type { AuthTokens } from '@/types/models';

const ACCESS_KEY = 'todo.accessToken';
const REFRESH_KEY = 'todo.refreshToken';

/** Persists JWT tokens. Swap the implementation here to change the storage strategy. */
export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_KEY),
  save(tokens: AuthTokens) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    if (tokens.refreshToken) localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
