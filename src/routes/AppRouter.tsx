import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { ProjectDetailPage } from '@/pages/project/ProjectDetailPage';
import { ProjectListPage } from '@/pages/project/ProjectListPage';
import { TodoDetailPage } from '@/pages/todo/TodoDetailPage';
import { TodoListPage } from '@/pages/todo/TodoListPage';
import { ProtectedRoute, PublicOnlyRoute } from './guards';
import { paths } from './paths';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to={paths.dashboard} replace /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.register, element: <RegisterPage /> },
        ],
      },
    ],
  },
  // Reachable both logged in (change password) and logged out (forgot password).
  { element: <AuthLayout />, children: [{ path: paths.forgotPassword, element: <ForgotPasswordPage /> }] },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.dashboard, element: <DashboardPage /> },
          { path: paths.todos, element: <TodoListPage /> },
          { path: '/lists/:id', element: <TodoDetailPage /> },
          { path: paths.projects, element: <ProjectListPage /> },
          { path: '/projects/:id', element: <ProjectDetailPage /> },
          { path: paths.profile, element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
