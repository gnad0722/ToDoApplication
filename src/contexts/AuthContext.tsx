import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { queryClient } from '@/config/queryClient';
import { authService } from '@/services/authService';
import { onSessionExpired } from '@/services/http';
import { tokenStorage } from '@/services/tokenStorage';
import type { LoginPayload, RegisterPayload, User } from '@/types/models';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(tokenStorage.getAccessToken() ? 'loading' : 'unauthenticated');

  const endSession = useCallback(() => {
    tokenStorage.clear();
    queryClient.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // Restore the session on first load.
  useEffect(() => {
    if (!tokenStorage.getAccessToken()) return;
    authService
      .me()
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch(endSession);
  }, [endSession]);

  // The HTTP layer calls this when the refresh token is no longer valid.
  useEffect(() => {
    onSessionExpired(() => {
      toast.error('Your session has expired. Please log in again.', { id: 'session-expired' });
      endSession();
    });
  }, [endSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await authService.login(payload);
    tokenStorage.save(tokens);
    const me = await authService.me();
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authService.register(payload);
      // Registration returns no tokens, so log in right away for a smooth start.
      return login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // Logging out locally is enough if the server call fails.
      }
    }
    endSession();
  }, [endSession]);

  const refreshUser = useCallback(async () => {
    setUser(await authService.me());
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout, refreshUser }),
    [user, status, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
