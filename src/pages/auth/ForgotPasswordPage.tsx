import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';
import { authService } from '@/services/authService';
import {
  emailSchema,
  LIMITS,
  otpSchema,
  resetPasswordSchema,
  type EmailForm,
  type OtpForm,
  type ResetPasswordForm,
} from '@/schemas';
import { cn } from '@/utils/cn';
import { getErrorMessage, toApiError } from '@/utils/errors';
import { applyServerErrors } from '@/utils/formErrors';

type Step = 0 | 1 | 2;
const steps = [
  { label: 'Email', icon: Mail },
  { label: 'Verify', icon: ShieldCheck },
  { label: 'New password', icon: KeyRound },
];
const RESEND_SECONDS = 60;

function Stepper({ current }: { current: Step }) {
  return (
    <ol className="mb-8 flex items-center gap-2">
      {steps.map(({ label, icon: Icon }, i) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              i < current && 'bg-emerald-500 text-white',
              i === current && 'bg-brand-600 text-white',
              i > current && 'bg-slate-200 text-slate-500',
            )}
          >
            {i < current ? <Check className="size-4" /> : <Icon className="size-4" />}
          </span>
          <span className={cn('hidden text-xs font-medium sm:block', i === current ? 'text-slate-900' : 'text-slate-400')}>{label}</span>
          {i < steps.length - 1 && <span className={cn('h-px flex-1', i < current ? 'bg-emerald-400' : 'bg-slate-200')} />}
        </li>
      ))}
    </ol>
  );
}

/**
 * 3-step password reset:
 *   1. POST /api/auth/forgot-password  (email)       -> OTP sent
 *   2. POST /api/auth/verify-otp       (email, otp)  -> reset token
 *   3. POST /api/auth/reset-password   (token, pwd)
 */
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { status, user, logout } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [email, setEmail] = useState(user?.email ?? '');
  const [resetToken, setResetToken] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema), defaultValues: { email } });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema), defaultValues: { otp: '' } });
  const passwordForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const sendCode = async (target: string) => {
    await authService.forgotPassword(target);
    setCooldown(RESEND_SECONDS);
    toast.success(`We sent a verification code to ${target}`);
  };

  const onEmail = async ({ email: value }: EmailForm) => {
    try {
      await sendCode(value.trim());
      setEmail(value.trim());
      setStep(1);
    } catch (e) {
      if (!applyServerErrors(e, emailForm.setError, ['email'])) emailForm.setError('email', { message: getErrorMessage(e) });
    }
  };

  const onOtp = async ({ otp }: OtpForm) => {
    try {
      const token = await authService.verifyOtp(email, otp.trim());
      setResetToken(token);
      setStep(2);
    } catch (e) {
      if (!applyServerErrors(e, otpForm.setError, ['otp'])) otpForm.setError('otp', { message: getErrorMessage(e) });
    }
  };

  const onReset = async ({ newPassword }: ResetPasswordForm) => {
    try {
      await authService.resetPassword({ newPassword, resetPasswordToken: resetToken });
      if (status === 'authenticated') await logout();
      toast.success('Password changed successfully');
      navigate(paths.login, { replace: true, state: { email, message: 'Password changed. Please log in with your new password.' } });
    } catch (e) {
      if (applyServerErrors(e, passwordForm.setError, ['newPassword'])) return;
      const apiError = toApiError(e);
      // Expired / invalid reset token (400): the user must request a new code.
      if (apiError.status === 400 && /reset|token|expired/i.test(apiError.message)) {
        toast.error(apiError.message);
        setResetToken('');
        otpForm.reset({ otp: '' });
        setStep(0);
        return;
      }
      passwordForm.setError('newPassword', { message: apiError.message });
    }
  };

  const resend = async () => {
    try {
      await sendCode(email);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const backLink = status === 'authenticated' ? paths.profile : paths.login;

  return (
    <div>
      <Link to={backLink} className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">{status === 'authenticated' ? 'Change password' : 'Reset your password'}</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        {step === 0 && 'Enter your email and we will send you a verification code.'}
        {step === 1 && (
          <>
            Enter the code we sent to <b className="text-slate-700">{email}</b>.
          </>
        )}
        {step === 2 && 'Choose a new password for your account.'}
      </p>

      <Stepper current={step} />

      {step === 0 && (
        <form onSubmit={emailForm.handleSubmit(onEmail)} className="space-y-4" noValidate>
          <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={emailForm.formState.errors.email?.message} {...emailForm.register('email')} />
          <Button type="submit" size="lg" className="w-full" loading={emailForm.formState.isSubmitting}>
            Send code
          </Button>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={otpForm.handleSubmit(onOtp)} className="space-y-4" noValidate>
          <Input
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            className="text-center text-lg tracking-[0.4em]"
            error={otpForm.formState.errors.otp?.message}
            {...otpForm.register('otp')}
          />
          <Button type="submit" size="lg" className="w-full" loading={otpForm.formState.isSubmitting}>
            Verify code
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" className="text-slate-500 hover:text-slate-700" onClick={() => setStep(0)}>
              Use another email
            </button>
            <button type="button" disabled={cooldown > 0} onClick={resend} className="font-medium text-brand-600 hover:text-brand-700 disabled:text-slate-400">
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={passwordForm.handleSubmit(onReset)} className="space-y-4" noValidate>
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            hint={`${LIMITS.passwordMin}–${LIMITS.passwordMax} characters`}
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword')}
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />
          <Button type="submit" size="lg" className="w-full" loading={passwordForm.formState.isSubmitting}>
            Change password
          </Button>
        </form>
      )}
    </div>
  );
}
