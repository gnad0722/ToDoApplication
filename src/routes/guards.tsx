import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullPageSpinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { paths } from './paths';

/** Only logged-in users pass; others go to /login and come back afterwards. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner label="Restoring your session…" />;
  if (status === 'unauthenticated') {
    return <Navigate to={paths.login} replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

/** Login/register pages: logged-in users are sent to the dashboard. */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'authenticated') return <Navigate to={paths.dashboard} replace />;
  return <Outlet />;
}
