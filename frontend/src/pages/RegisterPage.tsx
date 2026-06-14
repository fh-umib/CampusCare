import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { clearStoredToken, getApiErrorMessage } from '../services/apiClient';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { CampusCareLogoMark } from '../components/brand/CampusCareLogoMark';
import { AuthTopAction, AuthTopActionStyles } from '../components/auth/AuthTopAction';
import { ButtonSpinner } from '../components/ui/LoadingStates';
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

type RegisterIconName = 'student' | 'mentor' | 'admin' | 'switch' | 'login' | 'arrow' | 'lock';

const registerIconPaths: Record<RegisterIconName, ReactNode> = {
  student: (
    <>
      <path d="m3.5 9 8.5-4.5L20.5 9 12 13.5 3.5 9Z" />
      <path d="M7 11.2v4.2c2.9 2.2 7.1 2.2 10 0v-4.2M20.5 9v5" />
    </>
  ),
  mentor: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.8 20c.4-4.1 2.1-6.1 5.2-6.1 2 0 3.5.9 4.4 2.6" />
      <path d="m14.5 12.5 2 2 4-4M16.5 18.5h4" />
    </>
  ),
  admin: (
    <>
      <path d="M12 3.5 19 6v5.2c0 4.4-2.4 7.5-7 9.3-4.6-1.8-7-4.9-7-9.3V6l7-2.5Z" />
      <path d="M9.5 12.2 11.2 14l3.7-4" />
    </>
  ),
  switch: (
    <>
      <path d="M7 7h11l-3-3M17 17H6l3 3" />
      <path d="m18 7-3 3M6 17l3-3" />
    </>
  ),
  login: (
    <>
      <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
    </>
  ),
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
    </>
  )
};

function RegisterIcon({ name, size = 19 }: { name: RegisterIconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {registerIconPaths[name]}
    </svg>
  );
}

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminRegistration = searchParams.get('role') === 'admin';
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

  if (isAdminRegistration) {
    return (
      <main className="gradient-shell grid min-h-screen place-items-center px-4 py-6">
        <section className="w-full max-w-xl rounded-[1.5rem] border border-[#dfeaf3] bg-white/90 p-5 text-center shadow-xl backdrop-blur md:p-7">
          <div className="mx-auto flex justify-center">
            <CampusCareLogoMark size={58} variant="light" />
          </div>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-700">
            <RegisterIcon name="lock" size={14} />
            Restricted access
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#071527]">Admin registration is not public</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Admin accounts are created manually by CampusCare. Authorized administrators can sign in with their prepared credentials.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link className="register-action register-action-primary" to="/login?role=admin">
              <RegisterIcon name="login" />
              Go to Admin Login
            </Link>
            <Link className="register-action register-action-secondary" to="/start">
              <RegisterIcon name="switch" />
              Change role
            </Link>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Student and Mentor accounts remain available through public registration.
          </p>
        </section>
        <style>{`
          .register-action {
            display: inline-flex;
            min-height: 46px;
            align-items: center;
            justify-content: center;
            gap: .5rem;
            border-radius: 12px;
            padding: .65rem 1rem;
            font-size: .8rem;
            font-weight: 800;
            text-decoration: none;
            transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          }
          .register-action:hover { transform: translateY(-2px); }
          .register-action-primary {
            border: 1px solid #0d9e8a;
            background: linear-gradient(135deg,#0d9e8a,#087f72);
            box-shadow: 0 10px 24px rgba(13,158,138,.2);
            color: #fff;
          }
          .register-action-secondary {
            border: 1px solid #d7e4ed;
            background: #fff;
            color: #0b1d35;
          }
        `}</style>
      </main>
    );
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
  const roleContext =
    form.role === 'mentor'
      ? 'Set up a guidance workspace to review requests, support students, and follow academic wellbeing signals.'
      : 'Set up a student workspace for help requests, skills, stress tracking, mood reflection, and campus reports.';

  return (
    <main className="gradient-shell min-h-screen px-4 py-3 md:px-6 md:py-4">
      <AuthTopActionStyles />
      <style>{`
        .register-page * { box-sizing: border-box; }
        .register-role-card {
          position: relative;
          display: grid;
          grid-template-columns: auto minmax(0,1fr);
          gap: .75rem;
          width: 100%;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 15px;
          padding: .78rem;
          background: rgba(255,255,255,.045);
          color: #fff;
          text-align: left;
          transition: transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease;
        }
        .register-role-card:hover {
          transform: translateY(-2px);
          border-color: rgba(103,227,214,.28);
          background: rgba(255,255,255,.075);
        }
        .register-role-card-selected {
          border-color: rgba(103,227,214,.4);
          background: linear-gradient(135deg,rgba(13,158,138,.2),rgba(103,227,214,.07));
          box-shadow: inset 3px 0 0 #67e3d6, 0 12px 28px rgba(2,12,24,.16);
        }
        .register-role-icon {
          display: inline-flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(103,227,214,.2);
          border-radius: 12px;
          background: rgba(103,227,214,.09);
          color: #8cf0e4;
        }
        .register-role-card-selected .register-role-icon {
          border-color: rgba(103,227,214,.4);
          background: rgba(103,227,214,.15);
        }
        .register-role-copy { min-width: 0; }
        .register-role-heading { display: flex; align-items: center; justify-content: space-between; gap: .6rem; }
        .register-role-heading strong { font-size: .88rem; }
        .register-role-state {
          flex-shrink: 0;
          border: 1px solid rgba(103,227,214,.22);
          border-radius: 999px;
          padding: .18rem .45rem;
          background: rgba(103,227,214,.09);
          color: #bdf8ef;
          font-size: .56rem;
          font-weight: 800;
          letter-spacing: .055em;
          text-transform: uppercase;
        }
        .register-role-badge {
          display: block;
          margin-top: .18rem;
          color: #a8eae2;
          font-size: .59rem;
          font-weight: 800;
          letter-spacing: .045em;
          text-transform: uppercase;
        }
        .register-role-description {
          display: block;
          margin-top: .28rem;
          color: rgba(255,255,255,.58);
          font-size: .68rem;
          line-height: 1.45;
        }
        .register-section {
          overflow: hidden;
          border: 1px solid #dfeaf3;
          border-radius: 16px;
          background: rgba(255,255,255,.86);
          box-shadow: 0 8px 24px rgba(15,23,42,.035);
        }
        .register-section-body { padding: .9rem; }
        .register-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .8rem;
        }
        .register-section-title {
          margin: 0;
          color: #0b1d35;
          font-size: .88rem;
          font-weight: 800;
        }
        .register-section-helper {
          margin: .18rem 0 0;
          color: #64748b;
          font-size: .68rem;
          line-height: 1.45;
        }
        .register-section-pill {
          flex-shrink: 0;
          border: 1px solid #dfeaf3;
          border-radius: 999px;
          padding: .28rem .58rem;
          background: #f8fbfd;
          color: #64748b;
          font-size: .6rem;
          font-weight: 800;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .register-details summary::-webkit-details-marker { display: none; }
        .register-details[open] .register-details-action { color: #087c6d; }
        .register-action-row {
          display: grid;
          grid-template-columns: minmax(0,1fr) minmax(0,1fr);
          gap: .65rem;
        }
        .register-action {
          display: inline-flex;
          width: 100%;
          min-height: 46px;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          border-radius: 12px;
          padding: .65rem 1rem;
          font-size: .8rem;
          font-weight: 800;
          line-height: 1;
          text-decoration: none;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
        }
        .register-action:hover { transform: translateY(-2px); }
        .register-action-primary {
          border: 1px solid #0d9e8a;
          background: linear-gradient(135deg,#0d9e8a,#087f72);
          box-shadow: 0 10px 24px rgba(13,158,138,.2);
          color: #fff;
        }
        .register-action-primary:disabled { cursor: not-allowed; opacity: .62; transform: none; }
        .register-action-secondary {
          border: 1px solid #d7e4ed;
          background: rgba(255,255,255,.92);
          box-shadow: 0 8px 20px rgba(15,23,42,.05);
          color: #0b1d35;
        }
        .register-action-secondary:hover {
          border-color: rgba(13,158,138,.35);
          box-shadow: 0 11px 24px rgba(15,23,42,.08);
        }
        @media (max-width: 640px) {
          .register-action-row { grid-template-columns: 1fr; }
        }
      `}</style>
      <section className="register-page mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Link className="flex items-center gap-3 font-extrabold text-[#071527]" to="/">
            <CampusCareLogoMark size={40} variant="light" />
            CampusCare
          </Link>
          <div className="flex flex-wrap gap-2">
            <AuthTopAction accent icon="role" to="/start">Change role</AuthTopAction>
            <AuthTopAction icon="login" to={`/login?role=${form.role}`}>Already registered</AuthTopAction>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.76fr_1.24fr] lg:items-start">
          <aside className="dark-gradient overflow-hidden rounded-[1.45rem] p-4 text-white shadow-xl md:p-5">
            <div className="flex items-center gap-3">
              <CampusCareLogoMark size={48} variant="dark" />
              <div>
                <p className="text-base font-extrabold leading-tight">CampusCare</p>
                <p className="mt-1 text-xs text-white/50">Guided account setup</p>
              </div>
            </div>
            <h1 className="mt-5 text-2xl font-semibold leading-tight lg:text-[2.15rem]">Create your CampusCare account with purpose.</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Choose your role, create your account, and personalize your workspace for support, skills, wellbeing, and campus reports.
            </p>

            <div className="mt-4 grid gap-2">
              {roleOptions.map((option) => {
                const selected = form.role === option.role;
                return (
                <button
                  key={option.role}
                  className={`register-role-card ${selected ? 'register-role-card-selected' : ''}`}
                  type="button"
                  onClick={() => setForm({ ...form, role: option.role })}
                >
                  <span className="register-role-icon"><RegisterIcon name={option.role} /></span>
                  <span className="register-role-copy">
                    <span className="register-role-heading">
                      <strong>{option.title}</strong>
                      {selected ? <span className="register-role-state">Selected</span> : null}
                    </span>
                    <span className="register-role-badge">{option.badge}</span>
                    <span className="register-role-description">{option.description}</span>
                  </span>
                </button>
                );
              })}
              <Link className="register-role-card" to="/login?role=admin">
                <span className="register-role-icon"><RegisterIcon name="admin" /></span>
                <span className="register-role-copy">
                  <span className="register-role-heading">
                    <strong>Admin</strong>
                    <span className="register-role-state"><RegisterIcon name="lock" size={11} /> Protected</span>
                  </span>
                  <span className="register-role-badge">Authorized platform access</span>
                  <span className="register-role-description">
                    Admin accounts use approved credentials and continue through the secure login flow.
                  </span>
                </span>
              </Link>
            </div>
          </aside>

          <div className="premium-card p-4 shadow-xl md:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <span className="badge-green">{selectedRole.badge}</span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#071527]">Create account</h2>
                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">
                  {roleContext}
                </p>
              </div>
              <div className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-700">Step 2 of 4</div>
            </div>

            {successMessage ? <div className="alert-success mt-3">{successMessage}</div> : null}
            {error ? <div className="alert-error mt-3">{error}</div> : null}

            <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
              <div className="register-section">
                <div className="register-section-body">
                <div className="register-section-header">
                  <div>
                    <h3 className="register-section-title">Account details</h3>
                    <p className="register-section-helper">Core details used to create your secure CampusCare account.</p>
                  </div>
                  <span className="register-section-pill">Required</span>
                </div>
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
              </div>

              <details className="register-section register-details group">
                <summary className="register-section-header cursor-pointer list-none p-[.9rem]">
                  <div>
                    <h3 className="register-section-title">{form.role === 'student' ? 'Student role details' : 'Mentor role details'}</h3>
                    <p className="register-section-helper">Optional profile context that personalizes your workspace.</p>
                  </div>
                  <span className="register-section-pill register-details-action">
                    Add details
                  </span>
                </summary>

                {form.role === 'student' ? (
                  <div className="register-section-body border-t border-[#dfeaf3]">
                  <div className="register-section-header">
                    <div>
                      <p className="register-section-helper">These details help make the student dashboard more relevant.</p>
                    </div>
                    <span className="register-section-pill">Student</span>
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
                  <div className="register-section-body border-t border-[#dfeaf3]">
                  <div className="register-section-header">
                    <div>
                      <p className="register-section-helper">Share what kind of support you can offer students.</p>
                    </div>
                    <span className="register-section-pill">Mentor</span>
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

              <div className="register-action-row">
                <button aria-busy={isSubmitting} className="register-action register-action-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><ButtonSpinner />Creating account...</> : 'Create account'}
                  {!isSubmitting ? <RegisterIcon name="arrow" /> : null}
                </button>
                <Link className="register-action register-action-secondary" to={`/login?role=${form.role}`}>
                  <RegisterIcon name="login" />
                  Already registered
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
