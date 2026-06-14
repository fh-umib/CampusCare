import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { CampusCareLogoMark } from '../components/brand/CampusCareLogoMark';
import { AuthTopAction, AuthTopActionStyles } from '../components/auth/AuthTopAction';
import { ButtonSpinner } from '../components/ui/LoadingStates';

const rolePanels = {
  student: {
    eyebrow: 'Student support workspace',
    title: 'Return to your personal CampusCare space.',
    description: 'Track your support requests, add skills, check in with stress and mood, and follow campus reports.',
    benefits: ['Personal dashboard', 'Anonymous help threads', 'Stress and mood check-ins']
  },
  mentor: {
    eyebrow: 'Mentor support view',
    title: 'Support students with clearer context.',
    description: 'Review help requests, understand repeated support topics, and use SkillMap to guide collaboration.',
    benefits: ['Requests needing attention', 'Student support trends', 'SkillMap overview']
  },
  admin: {
    eyebrow: 'Admin management view',
    title: 'Open the protected CampusCare overview.',
    description: 'Monitor global activity, review module status, and keep the student support platform organized.',
    benefits: ['Global statistics', 'Status management', 'Module activity overview']
  }
};

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const roleKey = requestedRole === 'mentor' || requestedRole === 'admin' ? requestedRole : 'student';
  const rolePanel = rolePanels[roleKey];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const successMessage =
    typeof (location.state as { message?: unknown } | null)?.message === 'string'
      ? (location.state as { message: string }).message
      : '';
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="gradient-shell min-h-screen px-4 py-4 md:px-6 md:py-5">
      <AuthTopActionStyles />
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Link className="flex items-center gap-3 font-extrabold text-[#071527]" to="/">
            <CampusCareLogoMark size={40} variant="light" />
            CampusCare
          </Link>
          <div className="flex flex-wrap gap-2">
            <AuthTopAction accent icon="role" to="/start">Choose role</AuthTopAction>
            <AuthTopAction icon="home" to="/">Back to landing</AuthTopAction>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:min-h-[32rem] lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
          <aside className="dark-gradient rounded-[1.5rem] p-5 text-white shadow-xl md:p-6">
            <span className="rounded-full border border-cyan-200/20 bg-cyan-100/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-100">
              {rolePanel.eyebrow}
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight lg:text-4xl">{rolePanel.title}</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">{rolePanel.description}</p>

            <div className="mt-5 grid gap-2">
              {rolePanel.benefits.map((benefit, index) => (
                <div key={benefit} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-cyan-100">After login {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">CampusCare access</p>
              <p className="mt-1 text-xs leading-5 text-white/60">
                Sign in with your account to open the dashboard and modules that match your role.
              </p>
            </div>
          </aside>

          <div className="premium-card flex flex-col justify-center p-5 md:p-6">
            <span className="badge-green">{rolePanel.eyebrow}</span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#071527]">Sign in to CampusCare</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Welcome back. Continue to your role-aware dashboard and active support workspace.
            </p>

            {successMessage ? <div className="alert-success mt-3">{successMessage}</div> : null}
            {error ? <div className="alert-error mt-3">{error}</div> : null}

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <label className="block">
                <span className="field-label">Email</span>
                <input
                  autoComplete="email"
                  className="input"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="block">
                <span className="flex items-center justify-between gap-3">
                  <span className="field-label">Password</span>
                  <Link
                    className="text-xs font-semibold text-teal-700 transition hover:text-teal-900"
                    to={`/forgot-password?role=${roleKey}`}
                  >
                    Forgot password?
                  </Link>
                </span>
                <input
                  autoComplete="current-password"
                  className="input"
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <button aria-busy={isSubmitting} className="btn-primary flex w-full items-center justify-center gap-2" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><ButtonSpinner />Signing in...</> : 'Sign in'}
              </button>
            </form>

            {roleKey === 'admin' ? (
              <div
                className="mt-4 rounded-2xl border border-teal-200/80 p-4 text-sm text-slate-600 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,158,138,.08), rgba(103,227,214,.12))'
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-teal-200 bg-teal-600/10 text-teal-700">
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3.5 19 6v5.2c0 4.4-2.4 7.5-7 9.3-4.6-1.8-7-4.9-7-9.3V6l7-2.5Z" />
                      <rect x="9" y="10" width="6" height="5" rx="1.2" />
                      <path d="M10.5 10V8.8a1.5 1.5 0 0 1 3 0V10" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#0b1d35]">Admin workspace access</p>
                      <span className="rounded-full border border-teal-200 bg-white/70 px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wide text-teal-700">
                        Restricted role
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Admin accounts are created manually for platform management.
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Link className="btn-secondary flex min-h-11 w-full items-center justify-center text-center" to="/start">
                    Choose another role
                  </Link>
                  <Link className="btn-secondary flex min-h-11 w-full items-center justify-center text-center" to="/">
                    Back to landing
                  </Link>
                </div>
                <p className="mt-3 border-t border-teal-200/70 pt-3 text-xs text-slate-500">
                  Student and mentor accounts can still be created normally.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">New to CampusCare?</p>
                <p className="text-xs leading-5">Choose your role first so registration can guide you through the correct setup path.</p>
                <Link className="btn-secondary w-full" to="/start">
                  Create an account
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
