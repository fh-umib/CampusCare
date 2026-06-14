import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthTopAction, AuthTopActionStyles } from '../components/auth/AuthTopAction';
import { CampusCareLogoMark } from '../components/brand/CampusCareLogoMark';
import { ButtonSpinner } from '../components/ui/LoadingStates';
import { authService } from '../services/authService';
import type { UserRole } from '../types/roles';

type RecoveryIconName = 'privacy' | 'role' | 'manual' | 'arrow';

const recoveryIconPaths: Record<RecoveryIconName, ReactNode> = {
  privacy: (
    <>
      <path d="M12 3.5 19 6v5.2c0 4.4-2.4 7.5-7 9.3-4.6-1.8-7-4.9-7-9.3V6l7-2.5Z" />
      <path d="M9 12h6M12 9v6" />
    </>
  ),
  role: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.5-4.5 2.8-7 7-7s6.5 2.5 7 7" />
    </>
  ),
  manual: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M8 9h8M8 13h5M9 4V2M15 4V2" />
    </>
  ),
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />
};

function RecoveryIcon({ name, size = 20 }: { name: RecoveryIconName; size?: number }) {
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
      {recoveryIconPaths[name]}
    </svg>
  );
}

const roleCopy: Record<UserRole, { title: string; detail: string }> = {
  student: {
    title: 'Student account recovery',
    detail: 'Prepare a recovery request for your personal support and wellbeing workspace.'
  },
  mentor: {
    title: 'Mentor account recovery',
    detail: 'Prepare access recovery for your guidance and student-support workspace.'
  },
  admin: {
    title: 'Protected admin recovery',
    detail: 'Admin access is managed manually by the project owner.'
  }
};

function getRole(value: string | null): UserRole {
  return value === 'mentor' || value === 'admin' ? value : 'student';
}

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const initialRole = getRole(searchParams.get('role'));
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.forgotPassword({ email: email.trim(), role });
      setIsComplete(true);
    } catch {
      setError('Recovery could not be prepared right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="recovery-page">
      <AuthTopActionStyles />
      <style>{`
        .recovery-page {
          min-height:100vh; padding:1rem 1.25rem;
          color:#0b1d35;
          background:
            radial-gradient(circle at 7% 5%,rgba(103,227,214,.2),transparent 25rem),
            radial-gradient(circle at 94% 50%,rgba(37,99,235,.08),transparent 28rem),
            linear-gradient(180deg,#f9fcfe,#eef4f8);
        }
        .recovery-page * { box-sizing:border-box; }
        .recovery-container { width:min(100%,1050px); margin:0 auto; }
        .recovery-brand { display:flex; align-items:center; gap:.7rem; color:#071527; text-decoration:none; font-weight:850; }
        .recovery-layout { display:grid; grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr); gap:1rem; margin-top:1rem; }
        .recovery-aside {
          position:relative; overflow:hidden; min-height:515px; border:1px solid rgba(255,255,255,.1);
          border-radius:24px; padding:1.5rem; color:#fff;
          background:radial-gradient(circle at 90% 5%,rgba(103,227,214,.2),transparent 35%),linear-gradient(145deg,#071527,#0b1d35 60%,#0f3045);
          box-shadow:0 20px 44px rgba(7,21,39,.16);
        }
        .recovery-aside h1 { margin:1.2rem 0 .65rem; font-family:"Sora",sans-serif; font-size:clamp(1.8rem,3vw,2.55rem); line-height:1.12; letter-spacing:0; }
        .recovery-aside > p { margin:0; color:rgba(255,255,255,.6); font-size:.8rem; line-height:1.65; }
        .recovery-role-pill { display:inline-flex; align-items:center; gap:.4rem; border:1px solid rgba(103,227,214,.2); border-radius:999px; padding:.3rem .65rem; background:rgba(103,227,214,.08); color:#b7f7ee; font-size:.6rem; font-weight:800; text-transform:uppercase; }
        .recovery-points { display:grid; gap:.6rem; margin-top:1.4rem; }
        .recovery-point { display:grid; grid-template-columns:auto minmax(0,1fr); gap:.7rem; border:1px solid rgba(255,255,255,.08); border-radius:13px; padding:.75rem; background:rgba(255,255,255,.045); }
        .recovery-point-icon { display:grid; width:34px; height:34px; place-items:center; border-radius:10px; color:#67e3d6; background:rgba(103,227,214,.09); }
        .recovery-point strong,.recovery-point span { display:block; }
        .recovery-point strong { font-size:.72rem; }
        .recovery-point span { margin-top:.18rem; color:rgba(255,255,255,.46); font-size:.62rem; line-height:1.5; }
        .recovery-card { display:flex; min-width:0; flex-direction:column; justify-content:center; border:1px solid #dfeaf3; border-radius:24px; padding:1.5rem; background:rgba(255,255,255,.9); box-shadow:0 16px 38px rgba(15,23,42,.07); backdrop-filter:blur(14px); }
        .recovery-card h2 { margin:.7rem 0 .35rem; font-family:"Sora",sans-serif; font-size:1.45rem; }
        .recovery-card > p { margin:0; color:#64748b; font-size:.76rem; line-height:1.6; }
        .recovery-form { display:grid; gap:.85rem; margin-top:1.2rem; }
        .recovery-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.6rem; }
        .recovery-success { border:1px solid rgba(13,158,138,.23); border-radius:17px; padding:1rem; background:linear-gradient(135deg,rgba(13,158,138,.08),rgba(103,227,214,.12)); }
        .recovery-success-icon { display:grid; width:44px; height:44px; place-items:center; border:1px solid rgba(13,158,138,.22); border-radius:13px; color:#087c6d; background:rgba(255,255,255,.62); }
        .recovery-success h2 { margin:.8rem 0 .35rem; }
        .recovery-success p { margin:0; color:#64748b; font-size:.75rem; line-height:1.65; }
        .recovery-demo-note { margin-top:.9rem; border-top:1px solid rgba(13,158,138,.16); padding-top:.8rem; color:#64748b; font-size:.64rem; line-height:1.5; }
        @media(max-width:760px) {
          .recovery-page { padding:.85rem; }
          .recovery-layout { grid-template-columns:1fr; }
          .recovery-aside { min-height:0; }
        }
        @media(max-width:520px) {
          .recovery-actions { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="recovery-container">
        <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Link className="recovery-brand" to="/">
            <CampusCareLogoMark size={40} variant="light" />
            CampusCare
          </Link>
          <div className="flex flex-wrap gap-2">
            <AuthTopAction accent icon="login" to={`/login?role=${role}`}>Back to sign in</AuthTopAction>
            <AuthTopAction icon="home" to="/">Back to landing</AuthTopAction>
          </div>
        </header>

        <div className="recovery-layout">
          <aside className="recovery-aside">
            <CampusCareLogoMark size={58} variant="dark" />
            <h1>Reset your CampusCare password</h1>
            <p>Enter the email connected to your account. We will guide you through the recovery step available for this project version.</p>
            <div className="recovery-points">
              <div className="recovery-point">
                <span className="recovery-point-icon"><RecoveryIcon name="privacy" /></span>
                <div><strong>Account privacy</strong><span>The response never confirms whether an email exists.</span></div>
              </div>
              <div className="recovery-point">
                <span className="recovery-point-icon"><RecoveryIcon name="role" /></span>
                <div><strong>{roleCopy[role].title}</strong><span>{roleCopy[role].detail}</span></div>
              </div>
              <div className="recovery-point">
                <span className="recovery-point-icon"><RecoveryIcon name="manual" /></span>
                <div><strong>Demo-friendly process</strong><span>Reset links are not sent by email in this project version.</span></div>
              </div>
            </div>
          </aside>

          <section className="recovery-card">
            {!isComplete ? (
              <>
                <span className="recovery-role-pill"><RecoveryIcon name="role" size={14} />{role} recovery</span>
                <h2>Prepare password recovery</h2>
                <p>Provide your account email and workspace role. This request does not change your current password.</p>
                {error ? <div className="alert-error mt-3">{error}</div> : null}
                <form className="recovery-form" onSubmit={handleSubmit}>
                  <label>
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
                  <label>
                    <span className="field-label">Role</span>
                    <select className="input" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <div className="recovery-actions">
                    <button aria-busy={isSubmitting} className="btn-primary flex min-h-11 items-center justify-center gap-2" disabled={isSubmitting} type="submit">
                      {isSubmitting ? <><ButtonSpinner />Preparing recovery...</> : 'Continue recovery'}
                    </button>
                    <Link className="btn-secondary flex min-h-11 items-center justify-center text-center" to={`/login?role=${role}`}>
                      Back to sign in
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <div className="recovery-success">
                <span className="recovery-success-icon"><RecoveryIcon name={role === 'admin' ? 'manual' : 'privacy'} /></span>
                <h2>{role === 'admin' ? 'Admin recovery is manual' : 'Recovery request prepared'}</h2>
                <p>
                  {role === 'admin'
                    ? 'Admin password recovery is handled manually by the project owner. Use the prepared admin account or contact the owner for access.'
                    : 'If this account exists, password recovery can be handled by the platform administrator. In this project version, reset links are not sent by email.'}
                </p>
                <div className="recovery-actions mt-4">
                  <Link className="btn-primary flex min-h-11 items-center justify-center text-center" to={`/login?role=${role}`}>
                    {role === 'admin' ? 'Back to admin sign in' : 'Back to sign in'}
                  </Link>
                  <Link className="btn-secondary flex min-h-11 items-center justify-center text-center" to={role === 'admin' ? '/' : '/start'}>
                    {role === 'admin' ? 'Back to landing' : 'Choose another role'}
                  </Link>
                </div>
                <p className="recovery-demo-note">No password has been changed and no email has been sent.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
