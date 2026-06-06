import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';

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
  const { isAuthenticated, login } = useAuth();
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

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

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
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Link className="flex items-center gap-3 font-extrabold text-[#071527]" to="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071527] text-xs font-black text-[#67e3d6]">
              CC
            </span>
            CampusCare
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" to="/start">
              Choose role
            </Link>
            <Link className="btn-secondary" to="/">
              Back to landing
            </Link>
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
                <span className="field-label">Password</span>
                <input
                  autoComplete="current-password"
                  className="input"
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-4 grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">New to CampusCare?</p>
              <p className="text-xs leading-5">Choose your role first so registration can guide you through the correct setup path.</p>
              <Link className="btn-secondary w-full" to="/start">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
