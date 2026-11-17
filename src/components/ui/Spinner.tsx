import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin', className ?? 'size-5')} aria-hidden />;
}

export function FullPageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner className="size-8 text-brand-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
