import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';
import { LIMITS, registerSchema, type RegisterForm } from '@/schemas';
import { ApiError, getErrorMessage } from '@/utils/errors';
import { applyServerErrors } from '@/utils/formErrors';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ username, email, password }: RegisterForm) => {
    setServerError(null);
    try {
      await registerUser({ username: username.trim(), email: email.trim(), password });
      toast.success('Account created. Welcome to TaskFlow! 🎉');
      navigate(paths.dashboard, { replace: true });
    } catch (e) {
      // If registration worked but the automatic login failed, send the user to log in.
      if (e instanceof ApiError && e.status === 401) {
        navigate(paths.login, { state: { email: getValues('email'), message: 'Account created. Please log in.' } });
        return;
      }
      // 400: messages under the inputs. 409 (email/username taken) and others: banner.
      if (applyServerErrors(e, setError, ['username', 'email', 'password'])) return;
      setServerError(getErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Start organising your work in less than a minute.</p>

      {serverError && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input label="Username" autoComplete="username" placeholder="johndoe" error={errors.username?.message} hint={`At least ${LIMITS.usernameMin} characters`} {...register('username')} />
        <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          hint={`${LIMITS.passwordMin}–${LIMITS.passwordMax} characters`}
          {...register('password')}
        />
        <Input label="Confirm password" type="password" autoComplete="new-password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to={paths.login} className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
