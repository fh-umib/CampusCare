import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CampusCareLogoMark } from '../components/brand/CampusCareLogoMark';
import { useAuth } from '../context/AuthContext';

type IconName =
  | 'help'
  | 'skills'
  | 'stress'
  | 'mood'
  | 'lostFound'
  | 'dashboard'
  | 'student'
  | 'mentor'
  | 'admin'
  | 'privacy'
  | 'workspace'
  | 'connected'
  | 'question'
  | 'visibility'
  | 'context'
  | 'arrow'
  | 'profile';

const iconPaths: Record<IconName, ReactNode> = {
  help: (
    <>
      <path d="M12 3.5 20 7v5.8c0 4.5-3.1 7.3-8 9.2-4.9-1.9-8-4.7-8-9.2V7l8-3.5Z" />
      <path d="M8.3 10h7.4v5H12l-2.7 2v-2h-1v-5Z" />
    </>
  ),
  skills: (
    <>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8" />
    </>
  ),
  stress: (
    <>
      <path d="M3 13h4l2-6 3.2 11 2.5-8 1.8 3H21" />
      <path d="M4 21h16" />
    </>
  ),
  mood: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.2 10h.1M15.7 10h.1M7.8 15c1.2 1.5 2.6 2.2 4.2 2.2s3-.7 4.2-2.2" />
      <path d="M4.5 19.5c3-1.2 5.6-1.2 7.8 0 2.2 1.1 4.6 1.1 7.2 0" />
    </>
  ),
  lostFound: (
    <>
      <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
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
  privacy: (
    <>
      <path d="M12 3.5 19 6v5.2c0 4.4-2.4 7.5-7 9.3-4.6-1.8-7-4.9-7-9.3V6l7-2.5Z" />
      <path d="m9.4 12.2 1.7 1.8 3.8-4" />
    </>
  ),
  workspace: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  connected: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="m7.7 7.1 3.2 8.9M16.3 7.1 13.1 16M8 6h8" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2 1-1.2 1.8M12 17h.1" />
    </>
  ),
  visibility: (
    <>
      <path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  context: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M3.5 20c.4-4 2.4-6 5.5-6s5.1 2 5.5 6M14 15c3.5-.4 5.6 1.3 6.2 4.5" />
    </>
  ),
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.5-4.5 2.8-7 7-7s6.5 2.5 7 7" />
    </>
  )
};

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
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

const problems = [
  { icon: 'question' as IconName, title: 'Questions feel too public', text: 'Students may stay silent when asking in front of others feels uncomfortable.' },
  { icon: 'stress' as IconName, title: 'Exam stress grows silently', text: 'Pressure can build across subjects before anyone sees where support is needed.' },
  { icon: 'visibility' as IconName, title: 'Student skills stay invisible', text: 'Useful abilities are hard to discover, so collaboration starts later than it should.' },
  { icon: 'lostFound' as IconName, title: 'Campus reports are scattered', text: 'Lost and found information becomes fragmented across informal messages and groups.' },
  { icon: 'context' as IconName, title: 'Mentors lack support context', text: 'Without shared signals, guidance is reactive instead of timely and informed.' },
  { icon: 'dashboard' as IconName, title: 'Trends remain difficult to see', text: 'Admins need a clearer overview of module activity and recurring student needs.' }
];

const modules = [
  { icon: 'help' as IconName, title: 'Silent Help', badge: 'Safe support', text: 'Ask anonymously and receive thoughtful replies for academic, project, or wellbeing concerns.', color: '#0d9e8a' },
  { icon: 'skills' as IconName, title: 'SkillMap', badge: 'Skill growth', text: 'Share capabilities and discover students or mentors by skill, level, and availability.', color: '#2563eb' },
  { icon: 'stress' as IconName, title: 'ExamStress', badge: 'Pressure awareness', text: 'Record stress by subject and notice demanding periods before pressure becomes harder to manage.', color: '#d97706' },
  { icon: 'mood' as IconName, title: 'MoodCampus', badge: 'Weekly reflection', text: 'Reflect on weekly mood through respectful check-ins and useful personal or campus summaries.', color: '#7c3aed' },
  { icon: 'lostFound' as IconName, title: 'Lost & Found', badge: 'Campus reports', text: 'Organize lost and found items with locations, dates, clear status, and shared visibility.', color: '#059669' },
  { icon: 'dashboard' as IconName, title: 'Profile & Dashboard', badge: 'Personal overview', text: 'Open a role-aware workspace with useful summaries, activity, quick actions, and profile context.', color: '#0b1d35' }
];

const roles = [
  {
    icon: 'student' as IconName,
    title: 'Student',
    badge: 'Personal support space',
    text: 'Ask for help, track wellbeing, share skills, and manage campus reports.',
    items: ['Anonymous support', 'Stress and mood check-ins', 'Skill visibility'],
    action: 'Continue as Student',
    to: '/register?role=student',
    className: ''
  },
  {
    icon: 'mentor' as IconName,
    title: 'Mentor',
    badge: 'Guidance workspace',
    text: 'Review open requests, reply supportively, and notice repeated academic needs.',
    items: ['Support request queue', 'Wellbeing summaries', 'SkillMap overview'],
    action: 'Continue as Mentor',
    to: '/register?role=mentor',
    className: 'lp-role-mentor'
  },
  {
    icon: 'admin' as IconName,
    title: 'Admin',
    badge: 'Protected overview',
    text: 'Monitor modules, review reports, and understand campus support trends.',
    items: ['Platform activity', 'Status management', 'Manual access only'],
    action: 'Admin sign in',
    to: '/login?role=admin',
    className: 'lp-role-admin'
  }
];

const steps = [
  { icon: 'workspace' as IconName, number: '01', title: 'Choose your workspace', text: 'Select Student, Mentor, or protected Admin access.' },
  { icon: 'profile' as IconName, number: '02', title: 'Create account or sign in', text: 'Use the entry path designed for your role.' },
  { icon: 'skills' as IconName, number: '03', title: 'Complete your profile', text: 'Add context that makes your workspace more useful.' },
  { icon: 'dashboard' as IconName, number: '04', title: 'Use your modules', text: 'Open the support tools available to your role.' }
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="lp-page">
      <style>{`
        @keyframes lpFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes lpFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
        @keyframes lpGrow { from { transform:scaleX(0); } to { transform:scaleX(1); } }
        .lp-page {
          min-height:100vh;
          overflow-x:hidden;
          color:#0b1d35;
          background:
            radial-gradient(circle at 4% 4%,rgba(103,227,214,.2),transparent 24rem),
            radial-gradient(circle at 96% 18%,rgba(37,99,235,.1),transparent 30rem),
            linear-gradient(180deg,#f9fcfe 0%,#f4f8fc 48%,#edf5f8 100%);
          font-family:"DM Sans",sans-serif;
        }
        .lp-page * { box-sizing:border-box; }
        .lp-container { width:min(100% - 2rem,1240px); margin:0 auto; }
        .lp-header { padding:1rem 0 .25rem; }
        .lp-nav-shell {
          display:flex; align-items:center; justify-content:space-between; gap:1rem;
          border:1px solid rgba(255,255,255,.9); border-radius:18px; padding:.55rem .65rem;
          background:rgba(255,255,255,.76); box-shadow:0 10px 30px rgba(15,23,42,.065); backdrop-filter:blur(18px);
        }
        .lp-brand { display:flex; align-items:center; gap:.65rem; color:#071527; text-decoration:none; }
        .lp-brand strong,.lp-brand span { display:block; }
        .lp-brand strong { font-family:"Sora",sans-serif; font-size:.9rem; }
        .lp-brand span { margin-top:.08rem; color:#64748b; font-size:.61rem; }
        .lp-nav { display:flex; align-items:center; flex-wrap:wrap; gap:.25rem; }
        .lp-nav-link,.lp-btn { display:inline-flex; min-height:38px; align-items:center; justify-content:center; gap:.45rem; border-radius:10px; padding:.48rem .85rem; font-size:.72rem; font-weight:750; text-decoration:none; transition:.18s ease; }
        .lp-nav-link { color:#64748b; }
        .lp-nav-link:hover { color:#087c6d; background:rgba(13,158,138,.07); }
        .lp-btn:hover { transform:translateY(-2px); }
        .lp-btn-primary { border:1px solid #0d9e8a; color:#fff; background:linear-gradient(135deg,#0d9e8a,#087f72); box-shadow:0 9px 20px rgba(13,158,138,.18); }
        .lp-btn-secondary { border:1px solid #d7e4ed; color:#0b1d35; background:rgba(255,255,255,.82); box-shadow:0 7px 18px rgba(15,23,42,.045); }
        .lp-btn-secondary:hover { border-color:rgba(13,158,138,.34); background:#fff; }
        .lp-btn-ghost { color:#475569; background:transparent; }
        .lp-btn-ghost:hover { color:#087c6d; background:rgba(13,158,138,.07); }
        .lp-hero { position:relative; padding:3.1rem 0 3.75rem; }
        .lp-hero-grid { display:grid; grid-template-columns:minmax(0,1.02fr) minmax(440px,.98fr); align-items:center; gap:3rem; }
        .lp-hero-copy { animation:lpFadeUp .5s ease both; }
        .lp-eyebrow { display:inline-flex; align-items:center; gap:.45rem; border:1px solid rgba(13,158,138,.22); border-radius:999px; padding:.35rem .72rem; background:rgba(255,255,255,.72); color:#087c6d; font-size:.62rem; font-weight:800; letter-spacing:.07em; text-transform:uppercase; box-shadow:0 8px 18px rgba(15,23,42,.035); }
        .lp-eyebrow i { width:6px; height:6px; border-radius:50%; background:#0d9e8a; box-shadow:0 0 0 4px rgba(13,158,138,.1); }
        .lp-hero h1 { max-width:700px; margin:1rem 0 .85rem; color:#071527; font-family:"Sora",sans-serif; font-size:clamp(2.25rem,4.7vw,4.1rem); font-weight:700; line-height:1.06; letter-spacing:0; }
        .lp-hero h1 span { color:#0d9e8a; }
        .lp-hero-copy > p { max-width:620px; margin:0; color:#526174; font-size:.98rem; line-height:1.75; }
        .lp-hero-actions { display:flex; flex-wrap:wrap; gap:.6rem; margin-top:1.45rem; }
        .lp-trust-points { display:flex; flex-wrap:wrap; gap:.55rem; margin-top:1.35rem; }
        .lp-trust-point { display:inline-flex; align-items:center; gap:.48rem; border:1px solid #dfeaf3; border-radius:999px; padding:.38rem .7rem; background:rgba(255,255,255,.66); color:#64748b; font-size:.66rem; font-weight:650; }
        .lp-trust-point svg { color:#0d9e8a; }
        .lp-preview-wrap { position:relative; padding:.9rem; animation:lpFadeUp .6s .08s ease both; }
        .lp-preview {
          position:relative; overflow:hidden; max-height:490px; border:1px solid rgba(255,255,255,.1); border-radius:26px; padding:1rem;
          color:#fff; background:radial-gradient(circle at 90% 5%,rgba(103,227,214,.2),transparent 34%),linear-gradient(145deg,#071527,#0b1d35 62%,#0f3045);
          box-shadow:0 24px 60px rgba(7,21,39,.2);
        }
        .lp-preview-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
        .lp-preview-brand { display:flex; align-items:center; gap:.8rem; min-width:0; }
        .lp-preview-logo {
          position:relative; display:grid; width:62px; height:62px; flex:none; place-items:center;
          border:1px solid rgba(103,227,214,.2); border-radius:19px;
          background:linear-gradient(145deg,rgba(103,227,214,.13),rgba(255,255,255,.035));
          box-shadow:0 0 0 7px rgba(103,227,214,.035),0 12px 28px rgba(0,0,0,.16);
        }
        .lp-preview-logo::after { content:""; position:absolute; inset:-14px; z-index:-1; border-radius:28px; background:rgba(103,227,214,.1); filter:blur(18px); }
        .lp-preview-brand strong,.lp-preview-brand span { display:block; }
        .lp-preview-brand strong { font-family:"Sora",sans-serif; font-size:.9rem; }
        .lp-preview-brand span { margin-top:.13rem; color:rgba(255,255,255,.46); font-size:.6rem; }
        .lp-live { display:inline-flex; align-items:center; gap:.4rem; border:1px solid rgba(103,227,214,.2); border-radius:999px; padding:.28rem .55rem; background:rgba(103,227,214,.08); color:#b7f7ee; font-size:.56rem; font-weight:800; text-transform:uppercase; }
        .lp-live i { width:6px; height:6px; border-radius:50%; background:#67e3d6; }
        .lp-preview-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.55rem; margin-top:.85rem; }
        .lp-preview-module { display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:.55rem; min-height:65px; border:1px solid rgba(255,255,255,.08); border-radius:13px; padding:.6rem; background:rgba(255,255,255,.045); }
        .lp-preview-module-icon { display:grid; width:32px; height:32px; place-items:center; border-radius:10px; background:rgba(103,227,214,.09); color:#67e3d6; }
        .lp-preview-module strong,.lp-preview-module span { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .lp-preview-module strong { font-size:.65rem; }
        .lp-preview-module span { margin-top:.15rem; color:rgba(255,255,255,.42); font-size:.55rem; }
        .lp-pulse-card { display:grid; grid-template-columns:minmax(0,1fr) 115px; align-items:center; gap:1rem; margin-top:.55rem; border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:.7rem; background:rgba(255,255,255,.04); }
        .lp-pulse-card h3 { margin:0 0 .45rem; font-size:.68rem; }
        .lp-pulse-bars { display:grid; gap:.36rem; }
        .lp-pulse-row { display:grid; grid-template-columns:90px minmax(0,1fr); align-items:center; gap:.5rem; color:rgba(255,255,255,.44); font-size:.53rem; }
        .lp-pulse-track { height:5px; overflow:hidden; border-radius:999px; background:rgba(255,255,255,.08); }
        .lp-pulse-track span { display:block; height:100%; border-radius:999px; background:linear-gradient(90deg,#0d9e8a,#67e3d6); transform-origin:left; animation:lpGrow .8s ease both; }
        .lp-pulse-score { display:grid; place-items:center; width:96px; height:96px; border-radius:50%; background:conic-gradient(#67e3d6 0 72%,rgba(255,255,255,.08) 72%); }
        .lp-pulse-score::before { content:""; position:absolute; }
        .lp-pulse-score span { display:grid; width:70px; height:70px; place-items:center; border-radius:50%; background:#0b1d35; color:#fff; font-family:"Sora",sans-serif; font-size:1rem; font-weight:700; }
        .lp-float-card { position:absolute; z-index:2; min-width:145px; border:1px solid #dfeaf3; border-radius:12px; padding:.55rem .7rem; background:rgba(255,255,255,.94); box-shadow:0 12px 28px rgba(15,23,42,.1); animation:lpFloat 4.5s ease-in-out infinite; }
        .lp-float-card strong,.lp-float-card span { display:block; }
        .lp-float-card strong { color:#0b1d35; font-size:.61rem; }
        .lp-float-card span { margin-top:.15rem; color:#64748b; font-size:.54rem; }
        .lp-float-one { top:18%; left:-2%; }
        .lp-float-two { right:-1%; bottom:18%; animation-delay:.8s; }
        .lp-section { padding:4.4rem 0; }
        .lp-section-head { max-width:760px; margin:0 auto 1.8rem; text-align:center; }
        .lp-section-kicker { display:inline-block; margin-bottom:.55rem; color:#087c6d; font-size:.62rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .lp-section-head h2 { margin:0; color:#071527; font-family:"Sora",sans-serif; font-size:clamp(1.65rem,3vw,2.5rem); line-height:1.18; letter-spacing:0; }
        .lp-section-head p { margin:.7rem auto 0; color:#64748b; font-size:.86rem; line-height:1.7; }
        .lp-problem-grid,.lp-module-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.85rem; }
        .lp-card { border:1px solid #dfeaf3; border-radius:18px; background:rgba(255,255,255,.84); box-shadow:0 12px 30px rgba(15,23,42,.045); backdrop-filter:blur(10px); transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease; }
        .lp-card:hover { transform:translateY(-4px); border-color:rgba(13,158,138,.3); box-shadow:0 18px 38px rgba(15,23,42,.08); }
        .lp-problem-card { display:grid; grid-template-columns:auto minmax(0,1fr); gap:.8rem; padding:1rem; }
        .lp-icon-box { display:grid; width:42px; height:42px; place-items:center; border:1px solid rgba(13,158,138,.2); border-radius:13px; color:#0d9e8a; background:linear-gradient(135deg,rgba(13,158,138,.12),rgba(103,227,214,.06)); }
        .lp-problem-card h3,.lp-module-card h3 { margin:0; color:#0b1d35; font-family:"Sora",sans-serif; font-size:.83rem; }
        .lp-problem-card p,.lp-module-card p { margin:.35rem 0 0; color:#64748b; font-size:.69rem; line-height:1.55; }
        .lp-module-section { position:relative; }
        .lp-module-card { position:relative; overflow:hidden; padding:1rem; }
        .lp-module-card::before { content:""; position:absolute; inset:0 0 auto; height:3px; background:var(--accent); opacity:.8; }
        .lp-module-top { display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.75rem; }
        .lp-module-badge { border:1px solid #dfeaf3; border-radius:999px; padding:.23rem .48rem; color:#64748b; background:#f8fbfd; font-size:.54rem; font-weight:800; text-transform:uppercase; }
        .lp-role-section { padding:4.4rem 0; }
        .lp-role-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.85rem; }
        .lp-role-card { display:flex; min-height:330px; flex-direction:column; padding:1rem; color:#0b1d35; text-decoration:none; }
        .lp-role-mentor { background:linear-gradient(145deg,rgba(239,246,255,.92),rgba(240,253,250,.9)); }
        .lp-role-admin { border-color:rgba(103,227,214,.16); color:#fff; background:radial-gradient(circle at 90% 5%,rgba(103,227,214,.17),transparent 34%),linear-gradient(145deg,#071527,#0b1d35 62%,#0f3045); }
        .lp-role-card h3 { margin:.85rem 0 .35rem; font-family:"Sora",sans-serif; font-size:1.25rem; }
        .lp-role-card > p { margin:0; color:#64748b; font-size:.72rem; line-height:1.55; }
        .lp-role-admin > p { color:rgba(255,255,255,.6); }
        .lp-role-top { display:flex; align-items:center; justify-content:space-between; gap:.75rem; }
        .lp-role-admin .lp-icon-box { border-color:rgba(103,227,214,.22); color:#67e3d6; background:rgba(103,227,214,.09); }
        .lp-role-admin .lp-module-badge { border-color:rgba(103,227,214,.2); color:#b7f7ee; background:rgba(103,227,214,.08); }
        .lp-role-items { display:grid; gap:.42rem; margin:.85rem 0; }
        .lp-role-item { display:flex; align-items:center; gap:.5rem; border:1px solid #e6eef4; border-radius:10px; padding:.5rem .6rem; background:rgba(248,251,253,.75); color:#526174; font-size:.66rem; font-weight:650; }
        .lp-role-item i { width:6px; height:6px; flex:none; border-radius:50%; background:#0d9e8a; }
        .lp-role-admin .lp-role-item { border-color:rgba(255,255,255,.09); color:rgba(255,255,255,.7); background:rgba(255,255,255,.045); }
        .lp-role-admin .lp-role-item i { background:#67e3d6; }
        .lp-role-action { display:flex; min-height:42px; align-items:center; justify-content:space-between; gap:.75rem; margin-top:auto; border-radius:11px; padding:.55rem .75rem; color:#fff; background:linear-gradient(135deg,#0d9e8a,#087f72); box-shadow:0 9px 20px rgba(13,158,138,.16); font-size:.7rem; font-weight:800; }
        .lp-role-admin .lp-role-action { border:1px solid rgba(103,227,214,.2); color:#d5fbf6; background:rgba(103,227,214,.09); box-shadow:none; }
        .lp-admin-note { margin:-.1rem 0 .7rem!important; color:rgba(255,255,255,.43)!important; font-size:.61rem!important; }
        .lp-process { border:1px solid rgba(255,255,255,.9); border-radius:24px; padding:1.4rem; background:rgba(255,255,255,.7); box-shadow:0 16px 38px rgba(15,23,42,.055); backdrop-filter:blur(14px); }
        .lp-process-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.7rem; margin-top:1.2rem; }
        .lp-process-step { position:relative; padding:.85rem; border-left:2px solid rgba(13,158,138,.24); }
        .lp-process-number { color:#0d9e8a; font-size:.55rem; font-weight:850; letter-spacing:.07em; }
        .lp-process-step h3 { margin:.45rem 0 .25rem; font-family:"Sora",sans-serif; font-size:.76rem; }
        .lp-process-step p { margin:0; color:#64748b; font-size:.64rem; line-height:1.5; }
        .lp-process-icon { color:#0d9e8a; }
        .lp-proof { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); margin-top:1rem; overflow:hidden; border:1px solid #dfeaf3; border-radius:18px; background:rgba(255,255,255,.75); box-shadow:0 12px 30px rgba(15,23,42,.04); }
        .lp-proof-item { padding:1rem; border-right:1px solid #e5edf4; text-align:center; }
        .lp-proof-item:last-child { border-right:0; }
        .lp-proof-item strong { display:block; color:#071527; font-family:"Sora",sans-serif; font-size:1.3rem; }
        .lp-proof-item span { display:block; margin-top:.2rem; color:#64748b; font-size:.63rem; }
        .lp-final { padding:1rem 0 4.2rem; }
        .lp-final-card { position:relative; overflow:hidden; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:1.35rem; border:1px solid rgba(255,255,255,.1); border-radius:24px; padding:1.65rem; color:#fff; background:radial-gradient(circle at 90% 0,rgba(103,227,214,.22),transparent 34%),linear-gradient(135deg,#071527,#0b1d35 62%,#0f3045); box-shadow:0 22px 48px rgba(7,21,39,.17); }
        .lp-final-brand { display:grid; width:68px; height:68px; place-items:center; border:1px solid rgba(103,227,214,.2); border-radius:20px; background:rgba(103,227,214,.08); box-shadow:0 0 28px rgba(103,227,214,.1); }
        .lp-final-card h2 { margin:0; font-family:"Sora",sans-serif; font-size:clamp(1.4rem,3vw,2.15rem); }
        .lp-final-card p { max-width:650px; margin:.5rem 0 0; color:rgba(255,255,255,.57); font-size:.78rem; line-height:1.65; }
        .lp-final-actions { display:flex; flex:none; flex-wrap:wrap; gap:.55rem; }
        .lp-final-trust { display:flex; flex-wrap:wrap; gap:.45rem; margin-top:.75rem; }
        .lp-final-trust span { display:inline-flex; align-items:center; gap:.35rem; border:1px solid rgba(255,255,255,.09); border-radius:999px; padding:.3rem .55rem; background:rgba(255,255,255,.04); color:rgba(255,255,255,.62); font-size:.57rem; font-weight:650; }
        .lp-final-trust svg { color:#67e3d6; }
        .lp-btn-on-dark { border:1px solid rgba(255,255,255,.16); color:#fff; background:rgba(255,255,255,.07); }
        .lp-footer { padding:2.25rem 0 1.6rem; color:rgba(255,255,255,.55); background:linear-gradient(135deg,#06111f,#071527 55%,#0f2f46); border-top:1px solid rgba(255,255,255,.08); }
        .lp-footer-grid { display:grid; grid-template-columns:minmax(240px,1.5fr) repeat(3,minmax(130px,.5fr)); gap:2rem; }
        .lp-footer .lp-brand { color:#fff; }
        .lp-footer .lp-brand span { color:rgba(255,255,255,.4); }
        .lp-footer-copy { max-width:430px; margin:.85rem 0 0; font-size:.7rem; line-height:1.6; }
        .lp-footer-note { display:inline-flex; align-items:center; gap:.4rem; margin-top:.8rem; color:rgba(255,255,255,.38); font-size:.61rem; }
        .lp-footer-note i { width:5px; height:5px; border-radius:50%; background:#67e3d6; }
        .lp-footer h3 { margin:0 0 .7rem; color:#67e3d6; font-size:.59rem; letter-spacing:.08em; text-transform:uppercase; }
        .lp-footer-link { display:block; margin:.45rem 0; color:rgba(255,255,255,.56); font-size:.68rem; text-decoration:none; }
        .lp-footer-link:hover { color:#fff; }
        .lp-footer-bottom { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-top:1.5rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,.08); font-size:.62rem; }
        @media(max-width:960px) {
          .lp-hero-grid { grid-template-columns:1fr; }
          .lp-preview-wrap { width:min(100%,620px); margin:0 auto; }
          .lp-problem-grid,.lp-module-grid,.lp-role-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .lp-process-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .lp-footer-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
        }
        @media(max-width:680px) {
          .lp-nav-shell { align-items:flex-start; }
          .lp-nav { justify-content:flex-end; }
          .lp-nav-link { display:none; }
          .lp-hero { padding:2.5rem 0 3rem; }
          .lp-hero-grid { gap:2rem; }
          .lp-preview-wrap { padding:.2rem; }
          .lp-float-card { display:none; }
          .lp-preview-grid { grid-template-columns:1fr; }
          .lp-preview { max-height:none; }
          .lp-pulse-card { grid-template-columns:1fr; }
          .lp-pulse-score { display:none; }
          .lp-problem-grid,.lp-module-grid,.lp-role-grid,.lp-process-grid,.lp-proof,.lp-footer-grid { grid-template-columns:1fr; }
          .lp-proof-item { border-right:0; border-bottom:1px solid #e5edf4; }
          .lp-proof-item:last-child { border-bottom:0; }
          .lp-final-card { grid-template-columns:1fr; align-items:flex-start; padding:1.4rem; }
          .lp-final-brand { width:58px; height:58px; }
          .lp-final-actions { width:100%; }
          .lp-final-actions .lp-btn { flex:1; }
          .lp-footer-bottom { align-items:flex-start; flex-direction:column; }
        }
      `}</style>

      <header className="lp-header">
        <div className="lp-container lp-nav-shell">
          <Link className="lp-brand" to="/">
            <CampusCareLogoMark size={36} variant="light" />
            <span>
              <strong>CampusCare</strong>
              <span>Student support platform</span>
            </span>
          </Link>
          <nav className="lp-nav" aria-label="Landing page navigation">
            <a className="lp-nav-link" href="#modules">Modules</a>
            <a className="lp-nav-link" href="#roles">Roles</a>
            {isAuthenticated ? (
              <Link className="lp-btn lp-btn-primary" to="/dashboard">Go to dashboard</Link>
            ) : (
              <>
                <Link className="lp-btn lp-btn-secondary" to="/login">Login</Link>
                <Link className="lp-btn lp-btn-primary" to="/start">Get Started</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-copy">
            <span className="lp-eyebrow"><i />University wellbeing, skills & support</span>
            <h1>Supporting students <span>academically,</span> emotionally, and practically.</h1>
            <p>
              CampusCare helps students ask for anonymous help, share skills, track exam stress, reflect on mood, and organize lost & found reports, all in one safe digital faculty platform.
            </p>
            <div className="lp-hero-actions">
              <Link className="lp-btn lp-btn-primary" to="/start">Get Started <Icon name="arrow" size={17} /></Link>
              <Link className="lp-btn lp-btn-secondary" to="/login">Login</Link>
              <a className="lp-btn lp-btn-ghost" href="#modules">Explore Modules</a>
            </div>
            <div className="lp-trust-points">
              <span className="lp-trust-point"><Icon name="privacy" size={15} />Anonymous by choice</span>
              <span className="lp-trust-point"><Icon name="workspace" size={15} />Role-aware workspaces</span>
              <span className="lp-trust-point"><Icon name="connected" size={15} />One connected platform</span>
            </div>
          </div>

          <div className="lp-preview-wrap">
            <div className="lp-float-card lp-float-one">
              <strong>Silent Help</strong>
              <span>Anonymous request received</span>
            </div>
            <div className="lp-float-card lp-float-two">
              <strong>MoodCampus</strong>
              <span>Weekly reflection updated</span>
            </div>
            <div className="lp-preview">
              <div className="lp-preview-head">
                <div className="lp-preview-brand">
                  <span className="lp-preview-logo"><CampusCareLogoMark size={54} variant="dark" /></span>
                  <span><strong>CampusCare</strong><span>Student support workspace</span></span>
                </div>
                <span className="lp-live"><i />Workspace active</span>
              </div>
              <div className="lp-preview-grid">
                {[
                  ['help', 'Silent Help', '2 open requests'],
                  ['skills', 'SkillMap', '6 profile skills'],
                  ['stress', 'ExamStress', '3.1 weekly average'],
                  ['mood', 'MoodCampus', 'Calm this week'],
                  ['lostFound', 'Lost & Found', '3 campus reports'],
                  ['dashboard', 'Dashboard', 'Activity updated']
                ].map(([icon, title, detail]) => (
                  <div className="lp-preview-module" key={title}>
                    <span className="lp-preview-module-icon"><Icon name={icon as IconName} size={17} /></span>
                    <span><strong>{title}</strong><span>{detail}</span></span>
                  </div>
                ))}
              </div>
              <div className="lp-pulse-card">
                <div>
                  <h3>Campus support pulse</h3>
                  <div className="lp-pulse-bars">
                    <div className="lp-pulse-row"><span>Help requests</span><div className="lp-pulse-track"><span style={{ width: '76%' }} /></div></div>
                    <div className="lp-pulse-row"><span>Skill activity</span><div className="lp-pulse-track"><span style={{ width: '62%' }} /></div></div>
                    <div className="lp-pulse-row"><span>Check-ins</span><div className="lp-pulse-track"><span style={{ width: '70%' }} /></div></div>
                  </div>
                </div>
                <div className="lp-pulse-score"><span>72%</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-section-kicker">Why CampusCare matters</span>
            <h2>Student needs deserve one trusted place.</h2>
            <p>Students do not always know where to ask, who can help, or how to express academic pressure. CampusCare brings support, skills, wellbeing, and campus needs into one clearer system.</p>
          </div>
          <div className="lp-problem-grid">
            {problems.map((problem) => (
              <article className="lp-card lp-problem-card" key={problem.title}>
                <span className="lp-icon-box"><Icon name={problem.icon} /></span>
                <div><h3>{problem.title}</h3><p>{problem.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-module-section" id="modules">
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-section-kicker">Connected modules</span>
            <h2>Everything students need to ask, connect, reflect, and participate.</h2>
            <p>Each module solves a specific faculty need while contributing to one clear, role-aware workspace.</p>
          </div>
          <div className="lp-module-grid">
            {modules.map((module) => (
              <article className="lp-card lp-module-card" key={module.title} style={{ '--accent': module.color } as CSSProperties}>
                <div className="lp-module-top">
                  <span className="lp-icon-box" style={{ color: module.color }}><Icon name={module.icon} /></span>
                  <span className="lp-module-badge">{module.badge}</span>
                </div>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-role-section" id="roles">
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-section-kicker">Role-aware experience</span>
            <h2>One platform, three focused workspaces.</h2>
            <p>CampusCare adapts its information, actions, and support view to the responsibilities of each role.</p>
          </div>
          <div className="lp-role-grid">
            {roles.map((role) => (
              <Link className={`lp-card lp-role-card ${role.className}`} key={role.title} to={role.to}>
                <div className="lp-role-top">
                  <span className="lp-icon-box"><Icon name={role.icon} /></span>
                  <span className="lp-module-badge">{role.badge}</span>
                </div>
                <h3>{role.title}</h3>
                <p>{role.text}</p>
                <div className="lp-role-items">
                  {role.items.map((item) => <span className="lp-role-item" key={item}><i />{item}</span>)}
                </div>
                {role.title === 'Admin' ? <p className="lp-admin-note">Admin accounts are created manually.</p> : null}
                <span className="lp-role-action">{role.action}<Icon name="arrow" size={17} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-process">
            <div className="lp-section-head">
              <span className="lp-section-kicker">How it works</span>
              <h2>Start with your role. CampusCare adapts from there.</h2>
              <p>A short entry path keeps every user focused on the tools and information relevant to their workspace.</p>
            </div>
            <div className="lp-process-grid">
              {steps.map((step) => (
                <article className="lp-process-step" key={step.number}>
                  <span className="lp-process-icon"><Icon name={step.icon} size={19} /></span>
                  <span className="lp-process-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="lp-proof">
            <div className="lp-proof-item"><strong>5</strong><span>focused support modules</span></div>
            <div className="lp-proof-item"><strong>3</strong><span>role-aware workspaces</span></div>
            <div className="lp-proof-item"><strong>1</strong><span>connected faculty platform</span></div>
            <div className="lp-proof-item"><strong>Private</strong><span>anonymous support option</span></div>
          </div>
        </div>
      </section>

      <section className="lp-final">
        <div className="lp-container lp-final-card">
          <span className="lp-final-brand"><CampusCareLogoMark size={54} variant="dark" /></span>
          <div>
            <h2>Ready to enter CampusCare?</h2>
            <p>Choose your role and open a workspace built for support, guidance, wellbeing, skills, and campus reports.</p>
            <div className="lp-final-trust">
              <span><Icon name="privacy" size={13} />Anonymous support</span>
              <span><Icon name="workspace" size={13} />Role-aware workspaces</span>
              <span><Icon name="connected" size={13} />Connected campus modules</span>
            </div>
          </div>
          <div className="lp-final-actions">
            <Link className="lp-btn lp-btn-primary" to="/start">Get Started <Icon name="arrow" size={17} /></Link>
            <Link className="lp-btn lp-btn-on-dark" to="/login">Login</Link>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div>
              <Link className="lp-brand" to="/">
                <CampusCareLogoMark size={42} variant="dark" />
                <span><strong>CampusCare</strong><span>Student support platform</span></span>
              </Link>
              <p className="lp-footer-copy">Student support platform for academic help, skills, wellbeing, and campus reports.</p>
              <span className="lp-footer-note"><i />Admin accounts are created manually.</span>
            </div>
            <div>
              <h3>Platform</h3>
              <a className="lp-footer-link" href="#modules">Modules</a>
              <a className="lp-footer-link" href="#roles">Roles</a>
              <Link className="lp-footer-link" to="/start">Get Started</Link>
            </div>
            <div>
              <h3>Access</h3>
              <Link className="lp-footer-link" to="/login">Login</Link>
              <Link className="lp-footer-link" to="/register?role=student">Student workspace</Link>
              <Link className="lp-footer-link" to="/register?role=mentor">Mentor workspace</Link>
              <Link className="lp-footer-link" to="/login?role=admin">Admin access</Link>
            </div>
            <div>
              <h3>Modules</h3>
              <a className="lp-footer-link" href="#modules">Silent Help</a>
              <a className="lp-footer-link" href="#modules">SkillMap</a>
              <a className="lp-footer-link" href="#modules">ExamStress</a>
              <a className="lp-footer-link" href="#modules">MoodCampus</a>
              <a className="lp-footer-link" href="#modules">Lost & Found</a>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>Built for university support workflows.</span>
            <span>University "Isa Boletini" - Faculty of Computer Science and Engineering</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
