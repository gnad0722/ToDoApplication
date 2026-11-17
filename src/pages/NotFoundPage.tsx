import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for does not exist or was moved.</p>
      <Link to={paths.dashboard} className="mt-6 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
        Go to dashboard
      </Link>
    </div>
  );
}
