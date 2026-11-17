import type { AuthTokens, LoginPayload, RegisterPayload, ResetPasswordPayload, User } from '@/types/models';
import { http, unwrap } from './http';

export const authService = {
  login: (payload: LoginPayload) => unwrap<AuthTokens>(http.post('/api/auth/login', payload)),

  register: (payload: RegisterPayload) => unwrap<User>(http.post('/api/auth/register', payload)),

  me: () => unwrap<User>(http.get('/api/auth/me')),

  logout: (refreshToken: string) => unwrap<void>(http.post('/api/auth/logout', { rawToken: refreshToken })),

  /** Step 1 of password reset: send an OTP to the email. */
  forgotPassword: (email: string) => unwrap<void>(http.post('/api/auth/forgot-password', { email })),

  /** Step 2: exchange email + OTP for a reset-password token. */
  verifyOtp: async (email: string, otp: string) => {
    const data = await unwrap<{ token: string }>(http.post('/api/auth/verify-otp', { email, otp }));
    return data.token;
  },

  /** Step 3: set the new password. */
  resetPassword: (payload: ResetPasswordPayload) => unwrap<User>(http.post('/api/auth/reset-password', payload)),
};
