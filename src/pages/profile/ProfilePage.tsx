import { CalendarDays, KeyRound, LogOut, Mail, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, PageHeader } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';
import { formatDate } from '@/utils/date';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const rows = [
    { icon: UserRound, label: 'Username', value: user.username },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: CalendarDays, label: 'Member since', value: formatDate(user.createdAt) },
  ];

  return (
    <>
      <PageHeader title="Profile" description="Your account information" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center p-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{user.username}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold text-slate-900">Account details</h3>
          <dl className="divide-y divide-slate-100">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-3">
                <Icon className="size-4 text-slate-400" />
                <dt className="w-32 text-sm text-slate-500">{label}</dt>
                <dd className="truncate text-sm font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <Button variant="secondary" icon={<KeyRound className="size-4" />} onClick={() => navigate(paths.forgotPassword)}>
              Change password
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              icon={<LogOut className="size-4" />}
              onClick={async () => {
                await logout();
                navigate(paths.login, { replace: true });
              }}
            >
              Log out
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
