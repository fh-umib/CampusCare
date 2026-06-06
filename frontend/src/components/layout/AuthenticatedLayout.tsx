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
    return 'Admin workspace';
  }

  if (role === 'mentor') {
    return 'Mentor workspace';
  }

  return 'Student workspace';
}

function roleBadgeClass(role?: string) {
  if (role === 'admin') {
    return 'bg-slate-950 text-white ring-slate-800';
  }

  if (role === 'mentor') {
    return 'bg-sky-50 text-sky-700 ring-sky-100';
  }

  return 'bg-teal-50 text-teal-700 ring-teal-100';
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
    <div className="min-h-screen bg-[#f4f8fc] text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#dfeaf3] bg-white/90 p-5 shadow-sm lg:block">
        <div
          className="mb-6 rounded-[20px] p-4 text-white"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(13,158,138,.22), transparent 32%), linear-gradient(135deg, #071527 0%, #0b1d35 55%, #0f2f46 100%)',
            border: '1px solid rgba(255,255,255,.08)',
            boxShadow: '0 14px 34px rgba(11,29,53,.14)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] border border-teal-300/30 bg-teal-400/15 text-sm font-extrabold text-cyan-200">
              CC
            </div>
            <div className="min-w-0">
              <p className="truncate text-[1.05rem] font-extrabold leading-tight text-white">CampusCare</p>
              <p className="mt-1 truncate text-[0.78rem] leading-5 text-white/65">Student support platform</p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-400/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-cyan-100">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            {roleLabel(user?.role)}
          </div>
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'border-teal-200/80 bg-teal-50/90 text-[#0b1d35] shadow-sm shadow-teal-900/5'
                    : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[#e5edf5] bg-white/90 px-4 py-3 shadow-[0_4px_20px_rgba(15,23,42,.04)] backdrop-blur-xl md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-teal-100 bg-teal-50 text-sm font-extrabold text-teal-800 shadow-sm">
                {initials(user?.fullName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">{user?.fullName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className={`rounded-full px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-wide ring-1 ${roleBadgeClass(user?.role)}`}
              >
                {user?.role} view
              </span>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                type="button"
                onClick={handleLogout}
              >
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
        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:px-8 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-lg backdrop-blur lg:hidden">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-md px-2 py-2 text-center text-[11px] font-semibold ${
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'
              }`
            }
          >
            {item.label === 'ExamStress' ? 'Stress' : item.label === 'Silent Help' ? 'Help' : item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
