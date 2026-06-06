import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clearStoredToken, getApiErrorMessage } from '../services/apiClient';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import type { ProfilePayload } from '../types/profile';
import type { UserRole } from '../types/roles';

const roleOptions: Array<{ role: Exclude<UserRole, 'admin'>; title: string; description: string; badge: string }> = [
  {
    role: 'student',
    title: 'Student',
    badge: 'Active student account',
    description: 'Ask for support, show your skills, track wellbeing, and report campus items.'
  },
  {
    role: 'mentor',
    title: 'Mentor',
    badge: 'Guidance account',
    description: 'Guide students, reply to support requests, and watch helpful academic signals.'
  }
];

const supportInterests = ['academic help', 'project help', 'stress support', 'collaboration', 'lost/found', 'other'];
const studyYears = ['1', '2', '3', '4', 'master', 'other'];

function initialProfile(): ProfilePayload {
  return {
    studyYear: '',
    department: 'Computer Science and Engineering',
    reasonForJoining: '',
    supportInterest: '',
    expertiseAreas: '',
    canHelpWith: '',
    availability: '',
    mentoringReason: '',
    preferredSupportType: ''
  };
}

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role') === 'mentor' ? 'mentor' : 'student';
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: requestedRole as Exclude<UserRole, 'admin'>
  });
  const [profileForm, setProfileForm] = useState<ProfilePayload>(() => initialProfile());
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!form.fullName.trim() || !form.email.trim() || form.password.length < 8) {
      setError('Full name, email, and a password of at least 8 characters are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await authService.register(form);
      await profileService.completeOnboardingWithToken(profileForm, result.token);
      clearStoredToken();
      setSuccessMessage('Account created successfully. Please log in to continue.');
      setTimeout(() => {
        navigate(`/login?role=${form.role}`, {
          replace: true,
          state: { message: 'Account created successfully. Please log in to continue.' }
        });
      }, 1200);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedRole = roleOptions.find((option) => option.role === form.role) ?? roleOptions[0];

  return (
    <main className="gradient-shell min-h-screen px-4 py-4 md:px-6 md:py-5">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Link className="flex items-center gap-3 font-extrabold text-[#071527]" to="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071527] text-xs font-black text-[#67e3d6]">
              CC
            </span>
            CampusCare
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" to="/start">
              Change role
            </Link>
            <Link className="btn-secondary" to={`/login?role=${form.role}`}>
              Already registered
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="dark-gradient rounded-[1.5rem] p-5 text-white shadow-xl lg:sticky lg:top-5">
            <span className="rounded-full border border-cyan-200/20 bg-cyan-100/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-100">
              Guided account setup
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight lg:text-4xl">Create your CampusCare account.</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Select your role, add account details, and optionally prepare your profile before your first login.
            </p>

            <div className="mt-5 grid gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.role}
                  className={`rounded-xl border p-3 text-left transition ${
                    form.role === option.role
                      ? 'border-cyan-200/40 bg-cyan-100/10 shadow-lg shadow-teal-950/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  type="button"
                  onClick={() => setForm({ ...form, role: option.role })}
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-cyan-100">{option.badge}</span>
                  <span className="mt-1 block text-base font-semibold">{option.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-white/65">{option.description}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-amber-200/25 bg-amber-100/10 p-3 text-xs leading-5 text-amber-50">
              Admin signup is protected. Authorized admins should use an existing admin account or prepared demo data.
            </div>
          </aside>

          <div className="premium-card p-4 md:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <span className="badge-green">{selectedRole.badge}</span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#071527]">Create account</h2>
                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">
                  Register as a {form.role}, then log in to continue.
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                Step 2 of 4
              </div>
            </div>

            {successMessage ? <div className="alert-success mt-3">{successMessage}</div> : null}
            {error ? <div className="alert-error mt-3">{error}</div> : null}

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <h3 className="section-title">Account details</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="field-label">Full name</span>
                    <input
                      autoComplete="name"
                      className="input"
                      required
                      value={form.fullName}
                      onChange={(event) => setForm({ ...form, fullName: event.target.value })}
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
                  <label className="block">
                    <span className="field-label">Email</span>
                    <input
                      autoComplete="email"
                      className="input"
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Password</span>
                    <input
                      autoComplete="new-password"
                      className="input"
                      minLength={8}
                      required
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                    />
                  </label>
                </div>
              </div>

              <details className="group rounded-xl border border-teal-100 bg-teal-50/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3">
                  <div>
                    <h3 className="section-title">{form.role === 'student' ? 'Student onboarding context' : 'Mentor onboarding context'}</h3>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">Optional profile details. Expand to complete now.</p>
                  </div>
                  <span className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-semibold text-teal-700">
                    Add details
                  </span>
                </summary>

                {form.role === 'student' ? (
                  <div className="border-t border-teal-100 p-3">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <p className="section-subtitle">These details help make the student dashboard more relevant.</p>
                    </div>
                    <span className="badge-green">Student</span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="field-label">Study year</span>
                      <select
                        className="input"
                        value={profileForm.studyYear ?? ''}
                        onChange={(event) => setProfileForm({ ...profileForm, studyYear: event.target.value })}
                      >
                        <option value="">Choose study year</option>
                        {studyYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="field-label">Main support need</span>
                      <select
                        className="input"
                        value={profileForm.supportInterest ?? ''}
                        onChange={(event) => setProfileForm({ ...profileForm, supportInterest: event.target.value })}
                      >
                        <option value="">Choose support need</option>
                        {supportInterests.map((interest) => (
                          <option key={interest} value={interest}>
                            {interest}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="sm:col-span-2">
                      <span className="field-label">Department or program</span>
                      <input
                        className="input"
                        value={profileForm.department ?? ''}
                        onChange={(event) => setProfileForm({ ...profileForm, department: event.target.value })}
                      />
                    </label>
                    <label className="sm:col-span-2">
                      <span className="field-label">Reason for joining CampusCare</span>
                      <textarea
                        className="textarea min-h-16"
                        placeholder="Example: I want a safer way to ask for help during projects and exam weeks."
                        value={profileForm.reasonForJoining ?? ''}
                        onChange={(event) => setProfileForm({ ...profileForm, reasonForJoining: event.target.value })}
                      />
                    </label>
                  </div>
                  </div>
                ) : (
                  <div className="border-t border-sky-100 p-3">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <p className="section-subtitle">Share what kind of support you can offer students.</p>
                    </div>
                    <span className="badge-blue">Mentor</span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="field-label">Expertise areas</span>
                      <input
                        className="input"
                        placeholder="React, databases, project planning"
                        value={profileForm.expertiseAreas ?? ''}
                        onChange={(event) => setProfileForm({ ...profileForm, expertiseAreas: event.target.value })}
                      />
                    </label>
                    <label>
                      <span className="field-label">Availability</span>
                      <input
                        className="input"
                        placeholder="Example: Tuesdays after 14:00"
                        value={profileForm.availability ?? ''}
                        onChange={(event) => setProfileForm({ ...profileForm, availability: event.target.value })}
                      />
                    </label>
                    <label className="sm:col-span-2">
                      <span className="field-label">Subjects/topics you can help with</span>
                      <textarea
                        className="textarea min-h-16"
                        value={profileForm.canHelpWith ?? ''}
                        onChange={(event) => setProfileForm({ ...profileForm, canHelpWith: event.target.value })}
                      />
                    </label>
                    <label className="sm:col-span-2">
                      <span className="field-label">Mentoring reason</span>
                      <textarea
                        className="textarea min-h-16"
                        value={profileForm.mentoringReason ?? ''}
                        onChange={(event) => setProfileForm({ ...profileForm, mentoringReason: event.target.value })}
                      />
                    </label>
                  </div>
                  </div>
                )}
              </details>

              <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>
            <p className="mt-3 text-sm text-slate-600">
              Already have an account?{' '}
              <Link className="font-semibold text-emerald-700" to={`/login?role=${form.role}`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
