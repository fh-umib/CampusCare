import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { profileService } from '../services/profileService';
import type { ProfilePayload } from '../types/profile';

const supportInterests = ['academic help', 'project help', 'stress support', 'collaboration', 'lost/found', 'other'];
const studyYears = ['1', '2', '3', '4', 'master', 'other'];

function emptyForm(): ProfilePayload {
  return {
    studyYear: '',
    department: 'Computer Science and Engineering',
    reasonForJoining: '',
    supportInterest: '',
    expertiseAreas: '',
    canHelpWith: '',
    availability: '',
    mentoringReason: '',
    preferredSupportType: '',
    adminPosition: '',
    adminDepartmentUnit: '',
    adminAccessReason: ''
  };
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfilePayload>(() => emptyForm());
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    profileService
      .getCurrentProfile()
      .then((profile) => {
        if (profile) {
          setForm({
            studyYear: profile.studyYear ?? '',
            department: profile.department ?? 'Computer Science and Engineering',
            reasonForJoining: profile.reasonForJoining ?? '',
            supportInterest: profile.supportInterest ?? '',
            expertiseAreas: profile.expertiseAreas ?? '',
            canHelpWith: profile.canHelpWith ?? '',
            availability: profile.availability ?? '',
            mentoringReason: profile.mentoringReason ?? '',
            preferredSupportType: profile.preferredSupportType ?? '',
            adminPosition: profile.adminPosition ?? '',
            adminDepartmentUnit: profile.adminDepartmentUnit ?? '',
            adminAccessReason: profile.adminAccessReason ?? ''
          });
        }
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      setIsSubmitting(true);
      await profileService.completeOnboarding(form);
      setMessage('Your CampusCare onboarding profile was saved.');
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const role = user?.role ?? 'student';
  const roleTitle = role === 'mentor' ? 'Mentor setup' : role === 'admin' ? 'Admin setup' : 'Student setup';
  const roleDescription =
    role === 'mentor'
      ? 'Tell students where you can guide them and when you are available.'
      : role === 'admin'
        ? 'Add the management context connected to your protected CampusCare access.'
        : 'Add a few student details so CampusCare can make your support workspace more relevant.';

  return (
    <div className="space-y-6">
      <section className="dark-gradient overflow-hidden rounded-[2rem] p-6 text-white shadow-xl md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <span className="rounded-full border border-cyan-200/20 bg-cyan-100/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-100">
              {roleTitle}
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">Complete your CampusCare profile.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">{roleDescription}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {['Role selected', 'Profile details', 'Dashboard ready'].map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-cyan-100">Step {index + 1}</p>
                <p className="mt-2 text-sm font-semibold text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? <div className="empty-state">Loading profile details...</div> : null}
      {message ? <div className="alert-success">{message}</div> : null}
      {error ? <div className="alert-error">{error}</div> : null}

      <form className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]" onSubmit={handleSubmit}>
        <aside className="space-y-4">
          <div className="premium-card">
            <span className="badge-green">{role} view</span>
            <h2 className="mt-4 text-xl font-semibold text-[#071527]">Why this matters</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your profile only updates your own CampusCare account. It helps the platform show better prompts,
              summaries, and role-based dashboard context.
            </p>
          </div>
          <div className="premium-card">
            <h2 className="text-xl font-semibold text-[#071527]">Setup checklist</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              {[
                'Confirm your role context',
                'Add useful profile details',
                'Save and open your dashboard'
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="premium-card p-5 md:p-8">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-[#071527]">Profile details</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Complete what applies to your role. You can update this later.</p>
            </div>
            <span className="badge">This updates your profile only</span>
          </div>

          {role === 'mentor' ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label>
                <span className="field-label">Expertise areas</span>
                <textarea
                  className="textarea min-h-28"
                  placeholder="Example: React, C#, SQL, project planning"
                  value={form.expertiseAreas ?? ''}
                  onChange={(event) => setForm({ ...form, expertiseAreas: event.target.value })}
                />
              </label>
              <label>
                <span className="field-label">Subjects or topics you can help with</span>
                <textarea
                  className="textarea min-h-28"
                  value={form.canHelpWith ?? ''}
                  onChange={(event) => setForm({ ...form, canHelpWith: event.target.value })}
                />
              </label>
              <label>
                <span className="field-label">Availability</span>
                <input
                  className="input"
                  placeholder="Example: Wednesday afternoons"
                  value={form.availability ?? ''}
                  onChange={(event) => setForm({ ...form, availability: event.target.value })}
                />
              </label>
              <label>
                <span className="field-label">Preferred support type</span>
                <input
                  className="input"
                  placeholder="Example: project review, GitHub help"
                  value={form.preferredSupportType ?? ''}
                  onChange={(event) => setForm({ ...form, preferredSupportType: event.target.value })}
                />
              </label>
              <label className="lg:col-span-2">
                <span className="field-label">Mentoring reason</span>
                <textarea
                  className="textarea min-h-28"
                  value={form.mentoringReason ?? ''}
                  onChange={(event) => setForm({ ...form, mentoringReason: event.target.value })}
                />
              </label>
            </div>
          ) : role === 'admin' ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label>
                <span className="field-label">Position or responsibility</span>
                <input
                  className="input"
                  value={form.adminPosition ?? ''}
                  onChange={(event) => setForm({ ...form, adminPosition: event.target.value })}
                />
              </label>
              <label>
                <span className="field-label">Department or unit</span>
                <input
                  className="input"
                  value={form.adminDepartmentUnit ?? ''}
                  onChange={(event) => setForm({ ...form, adminDepartmentUnit: event.target.value })}
                />
              </label>
              <label className="lg:col-span-2">
                <span className="field-label">Reason for admin access</span>
                <textarea
                  className="textarea min-h-28"
                  value={form.adminAccessReason ?? ''}
                  onChange={(event) => setForm({ ...form, adminAccessReason: event.target.value })}
                />
              </label>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label>
                <span className="field-label">Study year</span>
                <select
                  className="input"
                  value={form.studyYear ?? ''}
                  onChange={(event) => setForm({ ...form, studyYear: event.target.value })}
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
                <span className="field-label">Department or program</span>
                <input
                  className="input"
                  value={form.department ?? ''}
                  onChange={(event) => setForm({ ...form, department: event.target.value })}
                />
              </label>
              <label>
                <span className="field-label">Main support need</span>
                <select
                  className="input"
                  value={form.supportInterest ?? ''}
                  onChange={(event) => setForm({ ...form, supportInterest: event.target.value })}
                >
                  <option value="">Choose support need</option>
                  {supportInterests.map((interest) => (
                    <option key={interest} value={interest}>
                      {interest}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-label">Active student confirmation</span>
                <input className="input" value="Faculty student profile" readOnly />
              </label>
              <label className="lg:col-span-2">
                <span className="field-label">Reason for joining CampusCare</span>
                <textarea
                  className="textarea min-h-28"
                  placeholder="Example: I want to ask for academic help and track my exam week stress."
                  value={form.reasonForJoining ?? ''}
                  onChange={(event) => setForm({ ...form, reasonForJoining: event.target.value })}
                />
              </label>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save onboarding'}
            </button>
            <button className="btn-secondary" type="button" onClick={() => navigate('/dashboard')}>
              Skip for now
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
