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
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-300">CampusCare</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
          One calm place for student support, skills, wellbeing, and campus reports.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          Request anonymous help, show what you can do, track exam stress, share weekly mood, and report lost or found
          items inside the faculty.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/register">
            Create account
          </Link>
          <Link className="btn-on-dark" to="/login">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}

