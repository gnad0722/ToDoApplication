import { CalendarClock, ListChecks, NotebookPen } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/Logo';

const highlights = [
  { icon: ListChecks, text: 'Organise your day into simple to-do lists' },
  { icon: CalendarClock, text: 'Plan every task with a start and end time' },
  { icon: NotebookPen, text: 'Keep notes right next to the work' },
];

/** Two-column layout for login, register and password reset. */
export function AuthLayout() {
  return (
    <div className="flex min-h-full">
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 to-indigo-800 p-12 lg:flex">
        <Logo light />
        <div>
          <h2 className="text-3xl leading-tight font-bold text-white">
            Get things done,
            <br />
            one task at a time.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-brand-100">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="size-5 text-white" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-brand-200">© {new Date().getFullYear()} TaskFlow</p>
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-white/5" />
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
