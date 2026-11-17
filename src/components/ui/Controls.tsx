import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, X } from 'lucide-react';
import type { PageMeta } from '@/types/api';
import { cn } from '@/utils/cn';
import { IconButton } from './Button';

/* ---------- Search ---------- */

export function SearchInput({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-9 pl-9 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

/* ---------- Select ---------- */

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ---------- Segmented tabs ---------- */

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1" role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          onClick={() => onChange(item.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
            item.value === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Pagination ---------- */

export function Pagination({ meta, onPageChange }: { meta: PageMeta; onPageChange: (page: number) => void }) {
  if (meta.totalPages <= 1) return null;
  const { page, totalPages, totalElements, size } = meta;
  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  return (
    <div className="mt-6 flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">
        Showing <b className="text-slate-700">{from}–{to}</b> of <b className="text-slate-700">{totalElements}</b>
      </span>
      <div className="flex items-center gap-1">
        <IconButton aria-label="Previous page" disabled={page === 0} onClick={() => onPageChange(page - 1)} className="disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </IconButton>
        {Array.from({ length: totalPages }, (_, i) => i)
          .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
          .map((i, idx, arr) => (
            <span key={i} className="flex items-center">
              {idx > 0 && i - arr[idx - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(i)}
                aria-current={i === page ? 'page' : undefined}
                className={cn(
                  'size-8 rounded-lg text-sm font-medium cursor-pointer',
                  i === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {i + 1}
              </button>
            </span>
          ))}
        <IconButton
          aria-label="Next page"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}

/* ---------- "More" menu ---------- */

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

export function DropdownMenu({ items, label = 'More actions' }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <IconButton
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <MoreHorizontal className="size-5" />
      </IconButton>
      {open && (
        <div className="animate-pop-in absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer',
                item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
