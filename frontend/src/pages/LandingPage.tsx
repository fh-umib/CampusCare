import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-10">
        <div className="max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-300">CampusCare</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            Student support, skills, wellbeing, and campus reports in one calm workspace.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Built for University "Isa Boletini" - Mitrovic&euml;, Faculty of Computer Science and Engineering, as a
            Programming Club project.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/register">
              Create account
            </Link>
            <Link className="btn-on-dark" to="/login">
              Login
            </Link>
          </div>
        </div>
        <div className="mt-12 grid gap-3 text-sm text-slate-300 md:grid-cols-4">
          {['Anonymous help', 'Skill discovery', 'Stress tracking', 'Lost & found'].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
