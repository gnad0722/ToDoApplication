import { z } from 'zod';

/**
 * Form validation schemas. Limits mirror the backend OpenAPI constraints so
 * users get instant feedback before a request is sent.
 */

const optionalDateTime = z.string().optional().or(z.literal(''));

/** End must be after start when both are set. */
function endAfterStart<T extends Record<string, unknown>>(startKey: keyof T, endKey: keyof T) {
  return (data: T, ctx: z.RefinementCtx) => {
    const start = data[startKey] as string | undefined;
    const end = data[endKey] as string | undefined;
    if (start && end && new Date(end) <= new Date(start)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [endKey as string], message: 'End time must be after start time' });
    }
  };
}

/* ---------- Auth ---------- */

export const LIMITS = {
  usernameMin: 4,
  passwordMin: 6,
  passwordMax: 72,
  todoTopicMin: 10,
  taskNameMin: 5,
  noteMin: 10,
  projectTopicMin: 5,
  projectDescriptionMin: 20,
} as const;

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');
const password = z
  .string()
  .min(LIMITS.passwordMin, `Password must be at least ${LIMITS.passwordMin} characters`)
  .max(LIMITS.passwordMax, `Password must be at most ${LIMITS.passwordMax} characters`);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z.string().trim().min(LIMITS.usernameMin, `Username must be at least ${LIMITS.usernameMin} characters`),
    email,
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
export type RegisterForm = z.infer<typeof registerSchema>;

export const emailSchema = z.object({ email });
export type EmailForm = z.infer<typeof emailSchema>;

export const otpSchema = z.object({ otp: z.string().trim().min(1, 'Enter the code from your email') });
export type OtpForm = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({ newPassword: password, confirmPassword: z.string().min(1, 'Please confirm your password') })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

/* ---------- To-do list ---------- */

export const todoSchema = z.object({
  topic: z.string().trim().min(LIMITS.todoTopicMin, `Topic must be at least ${LIMITS.todoTopicMin} characters`),
  startTime: optionalDateTime,
});
export type TodoForm = z.infer<typeof todoSchema>;

/* ---------- Task ---------- */

export const taskSchema = z
  .object({
    name: z.string().trim().min(LIMITS.taskNameMin, `Name must be at least ${LIMITS.taskNameMin} characters`),
    description: z.string().trim().min(1, 'Description is required'),
    expectStart: optionalDateTime,
    expectEnd: optionalDateTime,
  })
  .superRefine(endAfterStart('expectStart', 'expectEnd'));
export type TaskForm = z.infer<typeof taskSchema>;

/* ---------- Note ---------- */

export const noteSchema = z.object({
  description: z.string().trim().min(LIMITS.noteMin, `Note must be at least ${LIMITS.noteMin} characters`),
});
export type NoteForm = z.infer<typeof noteSchema>;

/* ---------- Project ---------- */

export const projectSchema = z
  .object({
    topic: z.string().trim().min(LIMITS.projectTopicMin, `Topic must be at least ${LIMITS.projectTopicMin} characters`),
    description: z
      .string()
      .trim()
      .min(LIMITS.projectDescriptionMin, `Description must be at least ${LIMITS.projectDescriptionMin} characters`),
    startTime: optionalDateTime,
    expectEnd: optionalDateTime,
  })
  .superRefine(endAfterStart('startTime', 'expectEnd'));
export type ProjectForm = z.infer<typeof projectSchema>;
