import type { ComponentProps, ReactNode } from 'react';
import { cn, percent } from '@/utils/cn';

type Tone = 'slate' | 'brand' | 'green' | 'red' | 'amber';

const tones: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
};

export function Badge({ tone = 'slate', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

export function ProgressBar({ done, total, showLabel = true }: { done: number; total: number; showLabel?: boolean }) {
  const value = percent(done, total);
  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>
            {done}/{total} tasks done
          </span>
          <span className="font-medium text-slate-700">{value}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', value === 100 ? 'bg-emerald-500' : 'bg-brand-500')}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function Card({ className, children, ...rest }: ComponentProps<'div'>) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)} {...rest}>
      {children}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
