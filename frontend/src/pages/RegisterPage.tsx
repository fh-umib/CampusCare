import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import type { UserRole } from '../types/roles';

export default function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student' as Exclude<UserRole, 'admin'>
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!form.fullName || !form.email || form.password.length < 8) {
      setError('Full name, email, and a password of at least 8 characters are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-emerald-700">CampusCare</p>
        <h1 className="mt-2 text-2xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Join as a student or mentor and start using CampusCare.</p>
        {error ? <div className="alert-error mt-5">{error}</div> : null}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="field-label">Full name</span>
            <input
              className="input"
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
            />
          </label>
          <label className="block">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label className="block">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          <label className="block">
            <span className="field-label">Role</span>
            <select
              className="input"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as Exclude<UserRole, 'admin'> })}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </label>
          <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-emerald-700" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
