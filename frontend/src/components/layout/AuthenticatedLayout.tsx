import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Silent Help', to: '/silent-help' },
  { label: 'SkillMap', to: '/skill-map' },
  { label: 'ExamStress', to: '/stress-tracker' },
  { label: 'MoodCampus', to: '/mood-campus' },
  { label: 'Lost & Found', to: '/lost-found' },
  { label: 'Profile', to: '/profile' }
];

function roleLabel(role?: string) {
  if (role === 'admin') {
    return 'Admin dashboard and management actions';
  }

  if (role === 'mentor') {
    return 'Mentor support view';
  }

  return 'Student workspace';
}

function initials(name?: string) {
  return (
    name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CC'
  );
}

export function AuthenticatedLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-8 rounded-lg bg-slate-950 p-4 text-white">
          <p className="text-xl font-semibold">CampusCare</p>
          <p className="mt-1 text-sm text-slate-300">Student support platform</p>
          <p className="mt-3 text-xs leading-5 text-slate-400">{roleLabel(user?.role)}</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                {initials(user?.fullName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.fullName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                {user?.role} view
              </span>
              <button className="btn-secondary" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
