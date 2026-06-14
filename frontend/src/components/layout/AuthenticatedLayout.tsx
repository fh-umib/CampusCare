import type { ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CampusCareLogoMark } from '../brand/CampusCareLogoMark';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../../context/AuthContext';

type NavIconName = 'dashboard' | 'help' | 'stress' | 'mood' | 'skills' | 'lostFound' | 'profile' | 'logout';

type NavItem = {
  label: string;
  to: string;
  icon: NavIconName;
};

const navigationGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: 'dashboard' }]
  },
  {
    label: 'Support',
    items: [
      { label: 'Silent Help', to: '/silent-help', icon: 'help' },
      { label: 'ExamStress', to: '/stress-tracker', icon: 'stress' },
      { label: 'MoodCampus', to: '/mood-campus', icon: 'mood' }
    ]
  },
  {
    label: 'Campus',
    items: [
      { label: 'SkillMap', to: '/skill-map', icon: 'skills' },
      { label: 'Lost & Found', to: '/lost-found', icon: 'lostFound' }
    ]
  },
  {
    label: 'Account',
    items: [{ label: 'Profile', to: '/profile', icon: 'profile' }]
  }
];

const navItems = navigationGroups.flatMap((group) => group.items);
const mobileBottomItems = navItems.filter((item) =>
  ['dashboard', 'help', 'stress', 'mood', 'skills', 'profile'].includes(item.icon)
);

const iconPaths: Record<NavIconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  help: (
    <>
      <path d="M4 5.5h16v11H9l-5 4v-15Z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  stress: (
    <>
      <path d="M3 13h4l2-6 3.2 11 2.5-8 1.8 3H21" />
      <path d="M4 21h16" />
    </>
  ),
  mood: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.2 10h.1M15.7 10h.1M7.8 15c1.2 1.5 2.6 2.2 4.2 2.2s3-.7 4.2-2.2" />
    </>
  ),
  skills: (
    <>
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="6" r="2.3" />
      <circle cx="18" cy="18" r="2.3" />
      <path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8" />
    </>
  ),
  lostFound: (
    <>
      <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.5-4.5 2.8-7 7-7s6.5 2.5 7 7" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4H5v16h5" />
      <path d="M14 8l4 4-4 4M8 12h10" />
    </>
  )
};

function NavIcon({ name, size = 19 }: { name: NavIconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width={size}
    >
      {iconPaths[name]}
    </svg>
  );
}

function roleLabel(role?: string) {
  if (role === 'admin') return 'Admin workspace';
  if (role === 'mentor') return 'Mentor workspace';
  return 'Student workspace';
}

function roleBadgeClass(role?: string) {
  if (role === 'admin') return 'bg-slate-950 text-white ring-slate-800';
  if (role === 'mentor') return 'bg-sky-50 text-sky-700 ring-sky-100';
  return 'bg-teal-50 text-teal-700 ring-teal-100';
}

function sidebarRoleClass(role?: string) {
  if (role === 'admin') return 'border-slate-500/20 bg-slate-400/10 text-slate-200';
  if (role === 'mentor') return 'border-sky-300/20 bg-sky-300/10 text-sky-100';
  return 'border-teal-300/20 bg-teal-300/10 text-cyan-100';
}

function initials(name?: string) {
  return (
    name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  );
}

export function AuthenticatedLayout() {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCurrentItem = (item: NavItem, isActive: boolean) =>
    isActive || (item.to === '/skill-map' && pathname === '/skillmap');

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-950 lg:flex lg:items-stretch">
      <a
        className="sr-only z-[10001] rounded-xl bg-[#0d9e8a] px-4 py-2 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#main-content"
      >
        Skip to content
      </a>
      <aside
        className="hidden min-h-screen w-[272px] shrink-0 flex-col border-r border-white/10 p-4 text-white shadow-[12px_0_36px_rgba(7,21,39,.12)] lg:flex"
        style={{
          background:
            'radial-gradient(circle at 22% 4%, rgba(13,158,138,.18), transparent 18rem), linear-gradient(180deg, #071527 0%, #0b1d35 60%, #06111f 100%)'
        }}
      >
        <div className="rounded-[18px] border border-white/10 bg-white/[0.045] p-3.5 shadow-lg shadow-black/10 backdrop-blur">
          <div className="flex items-center gap-3">
            <CampusCareLogoMark size={44} variant="dark" />
            <div className="min-w-0">
              <p className="truncate text-[1.02rem] font-extrabold leading-tight text-white">CampusCare</p>
              <p className="mt-1 truncate text-[0.72rem] text-white/50">Student support platform</p>
            </div>
          </div>
          <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] ${sidebarRoleClass(user?.role)}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(103,227,214,.08)]" />
            {roleLabel(user?.role)}
          </div>
        </div>

        <nav aria-label="Primary navigation" className="mt-4 min-h-0 flex-1 space-y-3.5">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[0.61rem] font-extrabold uppercase tracking-[0.16em] text-white/30">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group relative flex min-h-9 items-center gap-3 overflow-hidden rounded-xl border px-3 py-2 text-sm font-semibold transition duration-200 ${
                        isCurrentItem(item, isActive)
                          ? 'border-teal-300/20 bg-gradient-to-r from-teal-400/15 to-cyan-300/[0.06] text-white shadow-lg shadow-black/10'
                          : 'border-transparent text-white/55 hover:border-white/[0.06] hover:bg-white/[0.055] hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`absolute inset-y-2 left-0 w-[3px] rounded-r-full transition ${
                            isCurrentItem(item, isActive) ? 'bg-[#67e3d6]' : 'bg-transparent'
                          }`}
                        />
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                          isCurrentItem(item, isActive)
                            ? 'bg-teal-300/10 text-[#67e3d6]'
                            : 'text-white/35 group-hover:bg-white/[0.04] group-hover:text-cyan-100'
                        }`}>
                          <NavIcon name={item.icon} />
                        </span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 shrink-0 rounded-[18px] border border-white/10 bg-white/[0.05] p-3 shadow-lg shadow-black/10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-300/15 bg-teal-300/10 text-xs font-extrabold text-cyan-100">
              {initials(user?.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{user?.fullName}</p>
              <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[0.58rem] font-extrabold uppercase tracking-[0.07em] ${sidebarRoleClass(user?.role)}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
            <span className="flex items-center gap-2 text-[0.67rem] font-medium text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#67e3d6]" />
              24/7 support
            </span>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[0.68rem] font-bold text-white/60 transition hover:border-rose-300/20 hover:bg-rose-300/10 hover:text-rose-100"
              type="button"
              onClick={handleLogout}
            >
              <NavIcon name="logout" size={15} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="relative z-[100] overflow-visible border-b border-[#e5edf5] bg-white/90 px-4 py-3 shadow-[0_4px_20px_rgba(15,23,42,.04)] backdrop-blur-xl md:px-8">
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
              <NotificationBell />
              <span className={`rounded-full px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-wide ring-1 ${roleBadgeClass(user?.role)}`}>
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
          <nav
            aria-label="Mobile module navigation"
            className="mobile-module-nav mt-3 flex snap-x gap-2 overflow-x-auto px-0.5 pb-1 lg:hidden"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex min-h-10 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    isCurrentItem(item, isActive)
                      ? 'border-teal-200 bg-teal-50 text-teal-700'
                      : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-white'
                  }`
                }
              >
                <NavIcon name={item.icon} size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 pb-28 md:px-8 lg:pb-8" id="main-content">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Quick mobile navigation"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 gap-1 border-t border-slate-200 bg-white/95 px-2.5 py-2 shadow-[0_-8px_24px_rgba(15,23,42,.08)] backdrop-blur lg:hidden"
      >
        {mobileBottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-1.5 text-center text-[10px] font-bold transition ${
                isCurrentItem(item, isActive)
                  ? 'border-teal-100 bg-teal-50 text-teal-700 shadow-sm'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            <NavIcon name={item.icon} size={17} />
            <span className="max-w-full truncate">
              {item.label === 'ExamStress'
                ? 'Stress'
                : item.label === 'Silent Help'
                  ? 'Help'
                  : item.label === 'MoodCampus'
                    ? 'Mood'
                    : item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
