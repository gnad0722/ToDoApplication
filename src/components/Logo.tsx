import { CheckCheck } from 'lucide-react';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        <CheckCheck className="size-5" />
      </div>
      <span className={light ? 'text-lg font-bold text-white' : 'text-lg font-bold text-slate-900'}>TaskFlow</span>
    </div>
  );
}
