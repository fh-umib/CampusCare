import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roles = [
  {
    title: 'Student',
    badge: 'Personal workspace',
    to: '/register?role=student',
    description: 'For active students who need academic support, collaboration, wellbeing check-ins, and campus assistance.',
    canDo: ['Ask for help anonymously', 'Track stress and weekly mood', 'Add skills for collaboration', 'Report lost or found items'],
    reason: 'Continue as a student if you want one place to ask, check in, and follow your own campus activity.',
    accent: 'from-teal-50 to-cyan-50'
  },
  {
    title: 'Mentor',
    badge: 'Support workspace',
    to: '/register?role=mentor',
    description: 'For mentors who guide students, respond to help requests, and understand support trends.',
    canDo: ['Reply to student requests', 'Notice repeated support topics', 'View SkillMap activity', 'Support academic progress'],
    reason: 'Continue as a mentor if you want to help students earlier and with better context.',
    accent: 'from-sky-50 to-teal-50'
  },
  {
    title: 'Admin',
    badge: 'Protected access',
    to: '/login?role=admin',
    description: 'For authorized staff who monitor activity, manage statuses, and keep CampusCare organized.',
    canDo: ['Review global statistics', 'Manage request statuses', 'Monitor module activity', 'Understand support patterns'],
    reason: 'Admin access is protected. Use an authorized account or prepared demo credentials.',
    accent: 'from-slate-900 to-[#0f2f46]'
  }
];

export default function RoleEntryPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="gradient-shell min-h-screen px-4 py-6 md:px-8 md:py-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <Link className="flex items-center gap-3 font-extrabold text-[#071527]" to="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#071527] text-xs font-black text-[#67e3d6]">
              CC
            </span>
            CampusCare
          </Link>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary" to="/login">
              Already have an account
            </Link>
            <Link className="btn-secondary" to="/">
              Back to landing
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
          <div>
            <span className="badge-green">Role-first entry</span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#071527] md:text-6xl">
              Enter CampusCare with the right workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              CampusCare starts by understanding why you are here. Students get a supportive personal space, mentors
              get a guidance view, and admins use protected management access.
            </p>
          </div>
          <div className="premium-card grid gap-4 md:grid-cols-3">
            {['Choose role', 'Create account', 'Complete profile'].map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Step {index + 1}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {roles.map((role) => {
            const isAdmin = role.title === 'Admin';
            return (
              <Link
                key={role.title}
                className={`group flex min-h-[34rem] flex-col rounded-[1.6rem] border p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${
                  isAdmin
                    ? 'border-white/10 bg-gradient-to-br text-white shadow-slate-400/30'
                    : 'border-white/80 bg-gradient-to-br text-slate-950 shadow-slate-200/70'
                } ${role.accent}`}
                to={role.to}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={
                      isAdmin
                        ? 'rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-100'
                        : 'badge-green'
                    }
                  >
                    {role.badge}
                  </span>
                  <span className={isAdmin ? 'text-sm font-semibold text-white/60' : 'text-sm font-semibold text-slate-400 group-hover:text-teal-700'}>
                    Continue
                  </span>
                </div>
                <h2 className="mt-8 text-3xl font-semibold">{role.title}</h2>
                <p className={isAdmin ? 'mt-3 text-sm leading-6 text-white/65' : 'mt-3 text-sm leading-6 text-slate-600'}>{role.description}</p>
                <div className="mt-6 grid gap-2">
                  {role.canDo.map((point) => (
                    <div
                      key={point}
                      className={
                        isAdmin
                          ? 'rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-white/80'
                          : 'rounded-xl border border-white/80 bg-white/75 px-3 py-3 text-sm font-medium text-slate-700'
                      }
                    >
                      {point}
                    </div>
                  ))}
                </div>
                <div className={isAdmin ? 'mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/70' : 'mt-auto rounded-2xl border border-white/80 bg-white/80 p-4 text-sm leading-6 text-slate-600'}>
                  {role.reason}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
