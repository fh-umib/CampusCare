import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AuthTopAction, AuthTopActionStyles } from '../components/auth/AuthTopAction';
import { CampusCareLogoMark } from '../components/brand/CampusCareLogoMark';

type RoleIconName = 'student' | 'mentor' | 'admin' | 'arrow';

const iconPaths: Record<RoleIconName, ReactNode> = {
  student: (
    <>
      <path d="m3.5 9 8.5-4.5L20.5 9 12 13.5 3.5 9Z" />
      <path d="M7 11.2v4.2c2.9 2.2 7.1 2.2 10 0v-4.2M20.5 9v5" />
    </>
  ),
  mentor: (
    <>
      <circle cx="8.5" cy="8" r="3" />
      <path d="M3.5 20c.4-4.1 2.1-6.1 5-6.1 2.3 0 3.9 1.2 4.7 3.4" />
      <path d="M15 5h5v5M20 5l-6.2 6.2M16 19h5" />
    </>
  ),
  admin: (
    <>
      <path d="M12 3.5 19 6v5.2c0 4.4-2.4 7.5-7 9.3-4.6-1.8-7-4.9-7-9.3V6l7-2.5Z" />
      <rect x="9" y="10" width="6" height="5" rx="1.2" />
      <path d="M10.5 10V8.8a1.5 1.5 0 0 1 3 0V10" />
    </>
  ),
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />
};

function RoleIcon({ name, size = 22 }: { name: RoleIconName; size?: number }) {
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
      {iconPaths[name]}
    </svg>
  );
}

const roles = [
  {
    title: 'Student',
    badge: 'Personal workspace',
    description: 'For active students who need academic support, skills, wellbeing check-ins, and campus reports.',
    features: ['Ask anonymously', 'Track stress and mood', 'Share skills'],
    action: 'Continue as Student',
    to: '/register?role=student',
    icon: 'student' as RoleIconName,
    protected: false
  },
  {
    title: 'Mentor',
    badge: 'Guidance workspace',
    description: 'For mentors who review student requests, reply supportively, and follow academic wellbeing signals.',
    features: ['Review requests', 'Notice trends', 'Support students'],
    action: 'Continue as Mentor',
    to: '/register?role=mentor',
    icon: 'mentor' as RoleIconName,
    protected: false
  },
  {
    title: 'Admin',
    badge: 'Protected access',
    description: 'For authorized staff who monitor activity, module status, and campus support trends.',
    features: ['Platform overview', 'Reports and trends', 'Manual access only'],
    action: 'Admin sign in',
    to: '/login?role=admin',
    icon: 'admin' as RoleIconName,
    protected: true
  }
];

const steps = [
  ['01', 'Choose role'],
  ['02', 'Create account or sign in'],
  ['03', 'Enter your workspace']
];

export default function RoleEntryPage() {
  return (
    <main className="role-entry-page">
      <AuthTopActionStyles />
      <style>{`
        .role-entry-page {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          padding: 1rem 1.25rem 1.25rem;
          color: #0b1d35;
          background:
            radial-gradient(circle at 8% 4%, rgba(103,227,214,.2), transparent 24rem),
            radial-gradient(circle at 94% 40%, rgba(37,99,235,.09), transparent 28rem),
            linear-gradient(180deg,#f9fcfe 0%,#f4f8fc 52%,#edf5f8 100%);
        }
        .role-entry-page * { box-sizing: border-box; }
        .role-entry-container { width: min(100%, 1240px); margin: 0 auto; }
        .role-entry-brand { display: flex; align-items: center; gap: .7rem; color: #071527; text-decoration: none; }
        .role-entry-brand strong,.role-entry-brand span { display: block; }
        .role-entry-brand strong { font-size: .95rem; }
        .role-entry-brand span { margin-top: .1rem; color: #64748b; font-size: .65rem; }
        .role-entry-intro {
          display: grid;
          grid-template-columns: minmax(0,1.15fr) minmax(360px,.85fr);
          align-items: end;
          gap: 2rem;
          margin-top: 1.4rem;
        }
        .role-entry-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          border: 1px solid rgba(13,158,138,.22);
          border-radius: 999px;
          padding: .3rem .7rem;
          background: rgba(255,255,255,.72);
          color: #087c6d;
          font-size: .62rem;
          font-weight: 800;
          letter-spacing: .07em;
          text-transform: uppercase;
          box-shadow: 0 8px 20px rgba(15,23,42,.04);
        }
        .role-entry-eyebrow i { width: 6px; height: 6px; border-radius: 50%; background: #0d9e8a; }
        .role-entry-title {
          max-width: 680px;
          margin: .7rem 0 .45rem;
          color: #071527;
          font-family: "Sora",sans-serif;
          font-size: clamp(2rem,4vw,3.15rem);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -.02em;
        }
        .role-entry-copy { max-width: 720px; margin: 0; color: #64748b; font-size: .88rem; line-height: 1.65; }
        .role-entry-steps {
          display: grid;
          gap: .45rem;
          border: 1px solid rgba(255,255,255,.9);
          border-radius: 18px;
          padding: .7rem;
          background: rgba(255,255,255,.68);
          box-shadow: 0 14px 34px rgba(15,23,42,.055);
          backdrop-filter: blur(14px);
        }
        .role-entry-step {
          display: grid;
          grid-template-columns: 30px minmax(0,1fr);
          align-items: center;
          gap: .65rem;
          min-height: 42px;
          border: 1px solid #e3edf4;
          border-radius: 11px;
          padding: .4rem .55rem;
          background: rgba(248,251,253,.85);
        }
        .role-entry-step strong {
          display: grid;
          width: 28px;
          height: 28px;
          place-items: center;
          border-radius: 9px;
          background: rgba(13,158,138,.1);
          color: #087c6d;
          font-size: .6rem;
        }
        .role-entry-step span { font-size: .72rem; font-weight: 750; }
        .role-entry-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: .85rem; margin-top: 1.15rem; }
        .role-entry-card {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 315px;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #dfeaf3;
          border-radius: 20px;
          padding: 1rem;
          background: rgba(255,255,255,.88);
          box-shadow: 0 14px 34px rgba(15,23,42,.06);
          color: #0b1d35;
          text-decoration: none;
          backdrop-filter: blur(12px);
          transition: transform .2s ease,border-color .2s ease,box-shadow .2s ease;
        }
        .role-entry-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 3px;
          background: linear-gradient(90deg,#0d9e8a,#67e3d6);
          opacity: .75;
        }
        .role-entry-card:hover { transform: translateY(-4px); border-color: rgba(13,158,138,.34); box-shadow: 0 20px 42px rgba(15,23,42,.1); }
        .role-entry-card-admin {
          border-color: rgba(103,227,214,.16);
          color: #fff;
          background:
            radial-gradient(circle at 90% 5%,rgba(103,227,214,.18),transparent 35%),
            linear-gradient(145deg,#071527,#0b1d35 62%,#0f3045);
          box-shadow: 0 18px 40px rgba(7,21,39,.16);
        }
        .role-entry-card-admin:hover { border-color: rgba(103,227,214,.4); box-shadow: 0 22px 46px rgba(7,21,39,.22); }
        .role-entry-card-top { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
        .role-entry-icon {
          display: inline-flex;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(13,158,138,.2);
          border-radius: 13px;
          background: linear-gradient(135deg,rgba(13,158,138,.13),rgba(103,227,214,.07));
          color: #0d9e8a;
        }
        .role-entry-card-admin .role-entry-icon { border-color: rgba(103,227,214,.25); background: rgba(103,227,214,.1); color: #67e3d6; }
        .role-entry-badge {
          border: 1px solid rgba(13,158,138,.2);
          border-radius: 999px;
          padding: .25rem .55rem;
          background: rgba(13,158,138,.07);
          color: #087c6d;
          font-size: .56rem;
          font-weight: 800;
          letter-spacing: .055em;
          text-transform: uppercase;
        }
        .role-entry-card-admin .role-entry-badge { border-color: rgba(103,227,214,.2); background: rgba(103,227,214,.08); color: #b7f7ee; }
        .role-entry-card h2 { margin: .85rem 0 .35rem; font-family: "Sora",sans-serif; font-size: 1.3rem; }
        .role-entry-description { min-height: 55px; margin: 0; color: #64748b; font-size: .73rem; line-height: 1.55; }
        .role-entry-card-admin .role-entry-description { color: rgba(255,255,255,.62); }
        .role-entry-features { display: grid; gap: .38rem; margin: .8rem 0; }
        .role-entry-feature {
          display: flex;
          align-items: center;
          gap: .5rem;
          border: 1px solid #e6eef4;
          border-radius: 9px;
          padding: .42rem .55rem;
          background: rgba(248,251,253,.8);
          color: #475569;
          font-size: .66rem;
          font-weight: 650;
        }
        .role-entry-feature i { width: 6px; height: 6px; flex: none; border-radius: 50%; background: #0d9e8a; }
        .role-entry-card-admin .role-entry-feature { border-color: rgba(255,255,255,.09); background: rgba(255,255,255,.045); color: rgba(255,255,255,.72); }
        .role-entry-card-admin .role-entry-feature i { background: #67e3d6; }
        .role-entry-admin-note { margin: -.05rem 0 .65rem; color: rgba(255,255,255,.48); font-size: .62rem; }
        .role-entry-action {
          display: flex;
          min-height: 42px;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
          margin-top: auto;
          border-radius: 11px;
          padding: .55rem .75rem;
          background: linear-gradient(135deg,#0d9e8a,#087f72);
          box-shadow: 0 9px 20px rgba(13,158,138,.18);
          color: #fff;
          font-size: .72rem;
          font-weight: 800;
        }
        .role-entry-card-admin .role-entry-action { border: 1px solid rgba(103,227,214,.22); background: rgba(103,227,214,.1); box-shadow: none; color: #d5fbf6; }
        .role-entry-trust {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: .55rem;
          margin-top: .85rem;
        }
        .role-entry-trust span {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          color: #64748b;
          font-size: .62rem;
          font-weight: 650;
        }
        .role-entry-trust i { width: 5px; height: 5px; border-radius: 50%; background: #0d9e8a; }
        @media (max-width: 900px) {
          .role-entry-intro { grid-template-columns: 1fr; gap: 1rem; }
          .role-entry-steps { grid-template-columns: repeat(3,minmax(0,1fr)); }
          .role-entry-step { grid-template-columns: 1fr; justify-items: center; text-align: center; }
          .role-entry-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
        }
        @media (max-width: 640px) {
          .role-entry-page { padding: .85rem; }
          .role-entry-grid,.role-entry-steps { grid-template-columns: 1fr; }
          .role-entry-step { grid-template-columns: 30px minmax(0,1fr); justify-items: stretch; text-align: left; }
          .role-entry-card { min-height: 0; }
        }
      `}</style>

      <div className="role-entry-container">
        <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Link className="role-entry-brand" to="/">
            <CampusCareLogoMark size={40} variant="light" />
            <span>
              <strong>CampusCare</strong>
              <span>Student support platform</span>
            </span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <AuthTopAction accent icon="login" to="/login">Already have an account</AuthTopAction>
            <AuthTopAction icon="home" to="/">Back to landing</AuthTopAction>
          </div>
        </header>

        <section className="role-entry-intro">
          <div>
            <span className="role-entry-eyebrow"><i />Role-first entry</span>
            <h1 className="role-entry-title">Choose your CampusCare workspace.</h1>
            <p className="role-entry-copy">
              Start with the role that matches how you use CampusCare. Each workspace opens a different experience for support, guidance, or platform management.
            </p>
          </div>
          <div className="role-entry-steps" aria-label="CampusCare entry steps">
            {steps.map(([number, label]) => (
              <div className="role-entry-step" key={number}>
                <strong>{number}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="role-entry-grid" aria-label="Choose a CampusCare role">
          {roles.map((role) => (
            <Link
              className={`role-entry-card ${role.protected ? 'role-entry-card-admin' : ''}`}
              key={role.title}
              to={role.to}
            >
              <div className="role-entry-card-top">
                <span className="role-entry-icon"><RoleIcon name={role.icon} /></span>
                <span className="role-entry-badge">{role.badge}</span>
              </div>
              <h2>{role.title}</h2>
              <p className="role-entry-description">{role.description}</p>
              <div className="role-entry-features">
                {role.features.map((feature) => (
                  <span className="role-entry-feature" key={feature}><i />{feature}</span>
                ))}
              </div>
              {role.protected ? <p className="role-entry-admin-note">Admin accounts are created manually.</p> : null}
              <span className="role-entry-action">
                {role.action}
                <RoleIcon name="arrow" size={17} />
              </span>
            </Link>
          ))}
        </section>

        <div className="role-entry-trust" aria-label="CampusCare platform qualities">
          {['Anonymous support', 'Role-aware dashboards', 'Academic wellbeing', 'Campus reports'].map((item) => (
            <span key={item}><i />{item}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
