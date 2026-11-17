import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

const controlBase =
  'w-full rounded-lg border bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-slate-50';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: ReactNode;
  /** Shows "current/min" next to the label, for fields with a minimum length. */
  counter?: { value: string; min: number };
}

function FieldShell({ id, label, error, hint, counter, children }: FieldProps & { id: string; children: ReactNode }) {
  const length = counter?.value.trim().length ?? 0;
  return (
    <div className="space-y-1.5">
      {(label || counter) && (
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={id} className="text-sm font-medium text-slate-700">
              {label}
            </label>
          )}
          {counter && (
            <span className={cn('text-xs tabular-nums', length >= counter.min ? 'text-emerald-600' : 'text-slate-400')}>
              {length}/{counter.min} min
            </span>
          )}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ label, error, hint, counter, className, id, ...rest }: FieldProps & ComponentProps<'input'>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} counter={counter}>
      <input
        id={fieldId}
        aria-invalid={!!error}
        className={cn(controlBase, 'h-10', error ? 'border-red-400' : 'border-slate-300', className)}
        {...rest}
      />
    </FieldShell>
  );
}

export function Textarea({ label, error, hint, counter, className, id, rows = 4, ...rest }: FieldProps & ComponentProps<'textarea'>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} counter={counter}>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={!!error}
        className={cn(controlBase, 'py-2 resize-y', error ? 'border-red-400' : 'border-slate-300', className)}
        {...rest}
      />
    </FieldShell>
  );
}
