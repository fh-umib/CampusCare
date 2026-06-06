import type { ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── BRAND MARK ─────────────────────────────────────────────── */
function BrandMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
      background: inverted ? 'rgba(255,255,255,.08)' : '#071527',
      border: inverted ? '1px solid rgba(255,255,255,.14)' : '1px solid rgba(255,255,255,.7)',
      boxShadow: inverted ? 'none' : '0 2px 8px rgba(0,0,0,.18)',
    }}>
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M4 10.5 16 5l12 5.5L16 16 4 10.5Z" fill="#67e3d6" />
        <path d="M8.5 13.2v5.1c0 2.4 3.4 4.7 7.5 4.7s7.5-2.3 7.5-4.7v-5.1L16 16.7l-7.5-3.5Z" fill="#0d9e8a" />
        <path d="M26.5 12v7" stroke="#67e3d6" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 27.2s-5.2-2.8-5.2-6.2c0-1.7 1.2-2.9 2.8-2.9 1 0 1.9.5 2.4 1.3.5-.8 1.4-1.3 2.4-1.3 1.6 0 2.8 1.2 2.8 2.9 0 3.4-5.2 6.2-5.2 6.2Z"
          fill={inverted ? '#fff' : '#f8ffff'} stroke="#67e3d6" strokeWidth="1.1" />
      </svg>
    </span>
  );
}

/* ─── MODULE ICON ────────────────────────────────────────────── */
type IconName = 'help' | 'skills' | 'stress' | 'mood' | 'lostFound' | 'dashboard';

const iconPaths: Record<IconName, ReactNode> = {
  help: <><path d="M12 3.5 20 7v5.8c0 4.5-3.1 7.3-8 9.2-4.9-1.9-8-4.7-8-9.2V7l8-3.5Z" /><path d="M8.3 10h7.4v5H12l-2.7 2v-2h-1v-5Z" /></>,
  skills: <><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8" /></>,
  stress: <><path d="M3 13h4l2-6 3.2 11 2.5-8 1.8 3H21" /><path d="M4 21h16" /></>,
  mood: <><circle cx="12" cy="12" r="9" /><path d="M8.2 10h.1M15.7 10h.1M7.8 15c1.2 1.5 2.6 2.2 4.2 2.2s3-.7 4.2-2.2" /><path d="M4.5 19.5c3-1.2 5.6-1.2 7.8 0 2.2 1.1 4.6 1.1 7.2 0" /></>,
  lostFound: <><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" /><circle cx="12" cy="10" r="2.4" /><path d="M8.5 20.5h7" /></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="4" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
};

function ModuleIcon({ name, size = 48 }: { name: IconName; size?: number }) {
  return (
    <span style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: size * 0.33,
      background: 'linear-gradient(135deg, rgba(13,158,138,.12), rgba(103,227,214,.06))',
      border: '1px solid rgba(13,158,138,.22)', flexShrink: 0,
    }}>
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 24 24" fill="none"
        stroke="#0d9e8a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {iconPaths[name]}
      </svg>
    </span>
  );
}

/* ─── DATA ───────────────────────────────────────────────────── */
const modules = [
  { icon: 'help' as IconName,      title: 'Silent Help',     tag: 'Safe support',        color: '#0d9e8a', desc: 'Ask anonymously and receive supportive replies for academic, project, and personal concerns.' },
  { icon: 'skills' as IconName,    title: 'SkillMap',        tag: 'Collaboration',        color: '#2563eb', desc: 'Show what you can do and discover classmates or mentors by skill and availability.' },
  { icon: 'stress' as IconName,    title: 'ExamStress',      tag: 'Pressure awareness',   color: '#d97706', desc: 'Track exam pressure by subject before it becomes difficult to manage alone.' },
  { icon: 'mood' as IconName,      title: 'MoodCampus',      tag: 'Weekly reflection',    color: '#7c3aed', desc: 'Reflect on weekly mood and understand personal or campus wellbeing patterns.' },
  { icon: 'lostFound' as IconName, title: 'Lost & Found',    tag: 'Campus reports',       color: '#059669', desc: 'Report and find campus items with clear dates, locations, and status tracking.' },
  { icon: 'dashboard' as IconName, title: 'Profile & Dashboard', tag: 'Personal overview', color: '#0b1d35', desc: 'See role-aware activity, useful summaries, quick actions, and profile information.' },
];

const problems = [
  { num: '01', text: 'Students hesitate to ask questions publicly, fearing judgment or embarrassment.' },
  { num: '02', text: 'Exam stress builds silently and is rarely noticed until it becomes overwhelming.' },
  { num: '03', text: 'Useful student skills stay invisible — collaboration never starts because no one knows who can help.' },
  { num: '04', text: 'Lost and found information is scattered, slow, and unreliable on campus.' },
  { num: '05', text: 'Mentors lack context about student needs, making support reactive rather than proactive.' },
  { num: '06', text: 'Admins have no clear view of support trends, making it hard to improve faculty wellbeing.' },
];

const roles = [
  {
    title: 'Student', tag: 'Personal support space',
    desc: 'Ask for help, track wellbeing, share skills, and manage campus reports.',
    to: '/register?role=student', dark: true,
    items: ['Ask anonymously', 'Track stress & mood', 'Share skills', 'Report lost items'],
  },
  {
    title: 'Mentor', tag: 'Guidance workspace',
    desc: 'Review open requests, reply supportively, and follow student wellbeing trends.',
    to: '/register?role=mentor', dark: false,
    items: ['Reply to requests', 'View stress trends', 'Discover skills', 'Support students'],
  },
  {
    title: 'Admin', tag: 'Protected overview',
    desc: 'Monitor platform activity, reports, status management, and support data.',
    to: '/login?role=admin', dark: false,
    items: ['Monitor activity', 'Manage statuses', 'View reports', 'Follow trends'],
  },
];

const trustItems = [
  { label: 'Anonymous support',     value: 72, detail: 'Safe requests & replies',   color: '#0d9e8a' },
  { label: 'Skills shared',         value: 64, detail: 'Collaboration visibility',  color: '#2563eb' },
  { label: 'Wellbeing check-ins',   value: 81, detail: 'Mood and stress records',   color: '#7c3aed' },
  { label: 'Campus reports',        value: 48, detail: 'Lost and found activity',   color: '#059669' },
];

const supportPulse = [
  { label: 'Programming requests', value: 72 },
  { label: 'Exam stress check-ins', value: 54 },
  { label: 'Lost & found resolved', value: 38 },
];

const floatingCards = [
  { label: 'Silent Help', text: 'Anonymous request created', dot: '#0d9e8a', top: '12%', left: '-5%' },
  { label: 'MoodCampus', text: 'Feeling calm this week',     dot: '#7c3aed', bottom: '22%', right: '-5%' },
  { label: 'Lost & Found', text: 'Item reported — resolved', dot: '#059669', top: '60%', left: '-4%' },
];

/* ─── COMPONENT ──────────────────────────────────────────────── */
export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        @keyframes lp-fade-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lp-bar { from{width:0%} to{width:var(--w)} }
        .lp-module-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--accent); border-radius:inherit; transform:scaleX(0); transform-origin:left; transition:transform .3s ease; }
        .lp-module-card:hover::after { transform:scaleX(1); }
        .lp-module-card:hover { box-shadow:0 8px 32px rgba(11,29,53,.12); transform:translateY(-3px); border-color:rgba(13,158,138,.25) !important; }
        .lp-role-card:hover { transform:translateY(-4px) !important; box-shadow:0 12px 40px rgba(11,29,53,.16) !important; }
        .lp-btn-primary { display:inline-flex;align-items:center;gap:6px;background:#0d9e8a;color:#fff;border-radius:999px;padding:.65rem 1.5rem;font-size:.9rem;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif; }
        .lp-btn-primary:hover { background:#0bbfaa;transform:translateY(-1px);box-shadow:0 4px 16px rgba(13,158,138,.35); }
        .lp-btn-outline { display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.8);color:#0b1d35;border-radius:999px;padding:.65rem 1.5rem;font-size:.9rem;font-weight:600;text-decoration:none;border:1.5px solid #dfeaf3;cursor:pointer;transition:all .18s;backdrop-filter:blur(8px);font-family:'DM Sans',sans-serif; }
        .lp-btn-outline:hover { border-color:#0d9e8a;color:#0d9e8a;background:#fff; }
        .lp-btn-ghost { display:inline-flex;align-items:center;gap:6px;background:transparent;color:#475569;border-radius:999px;padding:.65rem 1.25rem;font-size:.9rem;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif; }
        .lp-btn-ghost:hover { color:#0d9e8a;background:rgba(13,158,138,.06); }
        .lp-btn-dark { display:inline-flex;align-items:center;gap:6px;background:#0b1d35;color:#fff;border-radius:999px;padding:.65rem 1.5rem;font-size:.9rem;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif; }
        .lp-btn-dark:hover { background:#0f2647;transform:translateY(-1px);box-shadow:0 4px 16px rgba(11,29,53,.3); }
        .lp-btn-ondark { display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);color:#fff;border-radius:999px;padding:.65rem 1.5rem;font-size:.9rem;font-weight:600;text-decoration:none;border:1px solid rgba(255,255,255,.2);cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif; }
        .lp-btn-ondark:hover { background:rgba(255,255,255,.18); }
        .lp-section-eyebrow { display:inline-block;font-family:'Sora',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#0d9e8a;margin-bottom:.875rem; }
        @media(max-width:900px) { .lp-hero-grid{grid-template-columns:1fr!important} .lp-hero-visual{display:none!important} .lp-problem-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important} }
        @media(max-width:640px) { .lp-module-grid{grid-template-columns:1fr!important} .lp-trust-grid{grid-template-columns:1fr 1fr!important} .lp-problem-grid{grid-template-columns:1fr!important} }
      `}</style>

      <main style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(180deg,#f9fcfe 0%,#f4f8fc 40%,#eef6f8 70%,#f4f8fc 100%)', color: '#0b1d35', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ━━━ NAV ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <header style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px clamp(1rem,4vw,3rem)' }}>
          <div style={{
            maxWidth: 1280, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
            background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,.85)', borderRadius: 18,
            padding: '8px 14px 8px 10px',
            boxShadow: '0 2px 16px rgba(11,29,53,.08)',
          }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <BrandMark />
              <span>
                <span style={{ display: 'block', fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#071527', lineHeight: 1.2 }}>CampusCare</span>
                <span style={{ display: 'block', fontSize: '.7rem', fontWeight: 500, color: '#64748b' }}>Student support platform</span>
              </span>
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <a href="#modules" className="lp-btn-ghost" style={{ padding: '.4rem .875rem', fontSize: '.875rem' }}>Modules</a>
              <a href="#roles" className="lp-btn-ghost" style={{ padding: '.4rem .875rem', fontSize: '.875rem' }}>Roles</a>
              <Link to="/login" className="lp-btn-outline" style={{ padding: '.45rem 1.1rem', fontSize: '.875rem' }}>Login</Link>
              <Link to="/start" className="lp-btn-primary" style={{ padding: '.45rem 1.1rem', fontSize: '.875rem' }}>Get Started</Link>
            </nav>
          </div>
        </header>

        {/* ━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          {/* bg glows */}
          <div style={{ position: 'absolute', top: -60, left: -80, width: 500, height: 500, borderRadius: '50%', background: 'rgba(103,227,214,.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 40, right: -60, width: 400, height: 400, borderRadius: '50%', background: 'rgba(125,211,252,.14)', filter: 'blur(70px)', pointerEvents: 'none' }} />

          <div className="lp-hero-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem clamp(1rem,5vw,4rem) 5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'center' }}>

            {/* Left */}
            <div style={{ animation: 'lp-fade-up .5s ease both' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.8)', border: '1px solid rgba(13,158,138,.25)', borderRadius: 999, padding: '.35rem 1rem', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#0d9e8a', marginBottom: '1.5rem', backdropFilter: 'blur(8px)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9e8a', animation: 'lp-pulse 2s infinite' }} />
                University wellbeing, skills & support
              </span>

              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2.1rem, 4.5vw, 3.6rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-.02em', color: '#071527', margin: '0 0 1.25rem' }}>
                Supporting students{' '}
                <span style={{ color: '#0d9e8a' }}>academically,</span>{' '}
                emotionally, and practically.
              </h1>

              <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.75, margin: '0 0 2rem', maxWidth: 480 }}>
                CampusCare helps students ask for anonymous help, share skills, track exam stress, reflect on mood, and organize lost & found reports — all in one safe digital faculty platform.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.625rem', marginBottom: '2rem' }}>
                <Link to="/start" className="lp-btn-primary">Get Started</Link>
                <Link to="/login" className="lp-btn-outline">Login</Link>
                <a href="#modules" className="lp-btn-ghost">Explore Modules</a>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.625rem' }}>
                {['Anonymous by choice', 'Role-aware access', 'One connected platform'].map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.7)', border: '1px solid #dfeaf3', borderRadius: 999, padding: '.35rem .875rem', fontSize: '.78rem', fontWeight: 500, color: '#64748b', backdropFilter: 'blur(6px)' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#0d9e8a' }} />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Dashboard preview */}
            <div className="lp-hero-visual" style={{ position: 'relative', animation: 'lp-fade-up .6s ease .1s both' }}>
              {/* Floating cards */}
              {floatingCards.map(c => (
                <div key={c.label} style={{
                  position: 'absolute', ...(c.top ? { top: c.top } : { bottom: c.bottom }), ...(c.left ? { left: c.left } : { right: c.right }),
                  background: '#fff', border: '1px solid #dfeaf3', borderRadius: 12, padding: '.7rem 1rem',
                  boxShadow: '0 4px 20px rgba(11,29,53,.1)', fontSize: '.78rem', zIndex: 10,
                  animation: `lp-float 4s ease-in-out infinite`, animationDelay: `${Math.random() * 1.5}s`,
                  minWidth: 160,
                }}>
                  <p style={{ fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', fontWeight: 600, marginBottom: 3 }}>{c.label}</p>
                  <p style={{ fontWeight: 500, color: '#0b1d35', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block', flexShrink: 0 }} />
                    {c.text}
                  </p>
                </div>
              ))}

              {/* Shell */}
              <div style={{ background: 'linear-gradient(145deg,#0f2647,#0b1d35)', borderRadius: 28, padding: 2, boxShadow: '0 16px 56px rgba(11,29,53,.22), 0 0 0 1px rgba(255,255,255,.06)' }}>
                <div style={{ background: 'linear-gradient(145deg,#112240,#0d1b2e)', borderRadius: 26, padding: '1.5rem', border: '1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <p style={{ fontFamily: "'Sora',sans-serif", fontSize: '.85rem', fontWeight: 600, color: 'rgba(255,255,255,.9)', margin: 0 }}>CampusCare</p>
                      <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Student workspace</p>
                    </div>
                    <span style={{ background: 'rgba(13,158,138,.18)', border: '1px solid rgba(13,158,138,.3)', borderRadius: 999, padding: '.25rem .75rem', fontSize: '.68rem', fontWeight: 700, color: '#67e3d6', textTransform: 'uppercase', letterSpacing: '.04em' }}>Active</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.625rem' }}>
                    {[
                      { label: 'Silent Help', value: '7', sub: 'open requests', accent: '#0d9e8a' },
                      { label: 'SkillMap', value: '42', sub: 'skills shared', accent: '#2563eb' },
                      { label: 'ExamStress', value: '3 / 5', sub: 'current level', accent: '#d97706', sm: true },
                      { label: 'MoodCampus', value: 'calm', sub: 'this week', accent: '#67e3d6', sm: true },
                    ].map(c => (
                      <div key={c.label} style={{ background: 'rgba(255,255,255,.06)', border: `1px solid rgba(255,255,255,.08)`, borderRadius: 13, padding: '1rem', borderLeft: `2px solid ${c.accent}` }}>
                        <p style={{ fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.38)', fontWeight: 600 }}>{c.label}</p>
                        <p style={{ fontFamily: "'Sora',sans-serif", fontSize: c.sm ? '1.1rem' : '1.7rem', fontWeight: 700, color: c.sm ? c.accent : '#fff', lineHeight: 1, margin: '.4rem 0 .2rem' }}>{c.value}</p>
                        <p style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.38)' }}>{c.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Wide bar — Lost & Found */}
                  <div style={{ marginTop: '.625rem', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 13, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p style={{ fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.38)', fontWeight: 600 }}>Lost & Found</p>
                      <p style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.7rem', fontWeight: 700, color: '#fff', lineHeight: 1, margin: '.4rem 0 .2rem' }}>12</p>
                      <p style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.38)' }}>campus reports</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
                      {[35, 58, 44, 76, 52, 68].map((h, i) => (
                        <span key={i} style={{ width: 9, height: `${h}%`, borderRadius: '3px 3px 0 0', background: i === 3 ? '#0d9e8a' : 'rgba(13,158,138,.35)', display: 'block' }} />
                      ))}
                    </div>
                  </div>

                  {/* Pulse */}
                  <div style={{ marginTop: '.625rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 13, padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                      <p style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#67e3d6' }}>Campus Support Pulse</p>
                      <p style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.35)' }}>This week</p>
                    </div>
                    {supportPulse.map(item => (
                      <div key={item.label} style={{ marginBottom: '.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '.72rem', color: 'rgba(255,255,255,.55)' }}>
                          <span>{item.label}</span><span>{item.value}%</span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,.08)', borderRadius: 999 }}>
                          <div style={{ height: '100%', width: `${item.value}%`, background: 'linear-gradient(90deg,#0d9e8a,#67e3d6)', borderRadius: 999 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ WHY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ background: '#fff', padding: '5rem clamp(1rem,5vw,4rem)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
              <div>
                <span className="lp-section-eyebrow">Why CampusCare matters</span>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 700, color: '#071527', letterSpacing: '-.02em', lineHeight: 1.2, margin: 0 }}>
                  Student needs deserve one trusted place.
                </h2>
              </div>
              <p style={{ fontSize: '.95rem', color: '#64748b', lineHeight: 1.8, margin: 0 }}>
                Students do not always know where to ask, who can help, or how to express academic pressure. CampusCare organizes support, skills, wellbeing, and campus needs so students act earlier and support teams respond with better context.
              </p>
            </div>
            <div className="lp-problem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '1rem', width: '100%' }}>
              {problems.map(p => (
                <div key={p.num} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 18, padding: '1.5rem', transition: 'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(11,29,53,.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#c5f3ee'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#0b1d35,#0f2647)', color: '#fff', fontFamily: "'Sora',sans-serif", fontSize: '.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>{p.num}</div>
                  <p style={{ fontSize: '.875rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="modules" style={{ padding: '5rem clamp(1rem,5vw,4rem)', background: '#f4f8fc' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '3rem' }}>
              <div>
                <span className="lp-section-eyebrow">What CampusCare offers</span>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 700, color: '#071527', letterSpacing: '-.02em', lineHeight: 1.2, margin: 0 }}>
                  Everything students need to ask,<br />connect, reflect, and participate.
                </h2>
              </div>
              <Link to="/start" className="lp-btn-dark">Choose your role</Link>
            </div>

            <div className="lp-module-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.1rem' }}>
              {modules.map(m => (
                <article key={m.title} className="lp-module-card" style={{
                  background: '#fff', border: '1px solid #dfeaf3', borderRadius: 20, padding: '1.75rem',
                  transition: 'all .22s', position: 'relative', overflow: 'hidden',
                  ['--accent' as string]: m.color,
                }}>
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `${m.color}0d`, pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <ModuleIcon name={m.icon} />
                    <span style={{ background: `${m.color}12`, border: `1px solid ${m.color}28`, borderRadius: 999, padding: '.2rem .7rem', fontSize: '.68rem', fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '.06em' }}>{m.tag}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.05rem', fontWeight: 600, color: '#0b1d35', marginBottom: '.5rem' }}>{m.title}</h3>
                  <p style={{ fontSize: '.85rem', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{m.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ ROLES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="roles" style={{ padding: '5rem clamp(1rem,5vw,4rem)', background: 'linear-gradient(180deg,#eef6f8,#f4f8fc)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="lp-section-eyebrow">For every role</span>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.75rem,3.5vw,2.6rem)', fontWeight: 700, color: '#071527', letterSpacing: '-.02em', lineHeight: 1.2, margin: '0 auto .875rem', maxWidth: 600 }}>
                One platform, three focused workspaces.
              </h2>
              <p style={{ fontSize: '.95rem', color: '#64748b', margin: '0 auto', maxWidth: 520, lineHeight: 1.75 }}>
                CampusCare changes its focus based on who signs in, while keeping student support connected across all roles.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '1.25rem' }}>
              {roles.map(r => (
                <Link key={r.title} to={r.to} className="lp-role-card" style={{
                  display: 'block', textDecoration: 'none',
                  background: r.dark ? 'linear-gradient(145deg,#0f2647,#0b1d35)' : '#fff',
                  border: r.dark ? '1px solid rgba(255,255,255,.08)' : '1px solid #dfeaf3',
                  borderRadius: 22, padding: '2rem', transition: 'all .22s',
                  boxShadow: r.dark ? '0 8px 32px rgba(11,29,53,.2)' : '0 2px 8px rgba(11,29,53,.06)',
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '.25rem .8rem',
                    fontSize: '.68rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: '1.25rem',
                    background: r.dark ? 'rgba(103,227,214,.12)' : 'rgba(13,158,138,.1)',
                    border: r.dark ? '1px solid rgba(103,227,214,.2)' : '1px solid rgba(13,158,138,.22)',
                    color: r.dark ? '#67e3d6' : '#0d9e8a',
                  }}>{r.tag}</span>
                  <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.5rem', fontWeight: 700, color: r.dark ? '#fff' : '#071527', marginBottom: '.625rem' }}>{r.title}</h3>
                  <p style={{ fontSize: '.875rem', color: r.dark ? 'rgba(255,255,255,.55)' : '#64748b', lineHeight: 1.7, marginBottom: '1.5rem' }}>{r.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                    {r.items.map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.825rem', color: r.dark ? 'rgba(255,255,255,.65)' : '#374151' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.dark ? '#67e3d6' : '#0d9e8a', flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ padding: '5rem clamp(1rem,5vw,4rem)', background: '#fff' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: '3rem', alignItems: 'center' }}>
              <div>
                <span className="lp-section-eyebrow">How it works</span>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: 700, color: '#071527', letterSpacing: '-.02em', lineHeight: 1.2, margin: '0 0 1rem' }}>
                  From first visit to a useful workspace in four steps.
                </h2>
                <p style={{ fontSize: '.95rem', color: '#64748b', lineHeight: 1.75, margin: 0 }}>
                  The entry flow stays clear and role-aware so every user reaches the right CampusCare experience without friction.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', position: 'relative' }}>
                {[
                  ['1', 'Choose your role', 'Enter as a student, mentor, or authorized admin.'],
                  ['2', 'Create your account', 'Add account details and helpful profile context.'],
                  ['3', 'Complete your profile', 'Add skills, preferences, and onboarding answers.'],
                  ['4', 'Start using CampusCare', 'Open your dashboard and use connected modules.'],
                ].map(([n, title, desc]) => (
                  <div key={n} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 18, padding: '1.5rem', position: 'relative' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9e8a,#0bbfaa)', color: '#fff', fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 12px rgba(13,158,138,.3)' }}>{n}</div>
                    <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '.95rem', fontWeight: 600, color: '#0b1d35', marginBottom: '.4rem' }}>{title}</h3>
                    <p style={{ fontSize: '.82rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ TRUST / STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ padding: '5rem clamp(1rem,5vw,4rem)', background: '#f4f8fc' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ background: '#fff', border: '1px solid #dfeaf3', borderRadius: 24, padding: 'clamp(1.5rem,4vw,3rem)', boxShadow: '0 4px 24px rgba(11,29,53,.06)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div>
                  <span className="lp-section-eyebrow">Platform activity</span>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 700, color: '#071527', letterSpacing: '-.02em', lineHeight: 1.2, margin: 0 }}>
                    Support signals that make campus needs easier to understand.
                  </h2>
                </div>
                <p style={{ fontSize: '.875rem', color: '#64748b', maxWidth: 320, lineHeight: 1.65, margin: 0 }}>Illustrative indicators showing how CampusCare connects support, skills, wellbeing, and campus reports.</p>
              </div>
              <div className="lp-trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
                {trustItems.map(item => (
                  <div key={item.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                      <p style={{ fontFamily: "'Sora',sans-serif", fontSize: '.82rem', fontWeight: 600, color: '#0b1d35', margin: 0 }}>{item.label}</p>
                      <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '.82rem', fontWeight: 700, color: item.color }}>{item.value}%</span>
                    </div>
                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.value}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`, borderRadius: 999 }} />
                    </div>
                    <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '.625rem', lineHeight: 1.5 }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ ACADEMIC CONTEXT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ padding: '5rem clamp(1rem,5vw,4rem)', background: '#fff' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="lp-section-eyebrow">Academic context</span>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: 700, color: '#071527', letterSpacing: '-.02em', lineHeight: 1.2, margin: '0 0 1rem' }}>
                Built for a more supportive faculty experience.
              </h2>
              <p style={{ fontSize: '.95rem', color: '#64748b', lineHeight: 1.8, margin: '0 0 1.5rem' }}>
                CampusCare was developed as a Programming Club project to solve the real challenges students and mentors face every day in a university environment.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #dfeaf3', borderRadius: 12, padding: '.75rem 1.25rem', fontSize: '.82rem', color: '#64748b' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0d9e8a', flexShrink: 0 }} />
                University "Isa Boletini" – Mitrovicë · Faculty of Computer Science & Engineering
              </div>
            </div>

            {/* Final CTA card */}
            <div style={{ background: 'linear-gradient(145deg,#0f2647,#0b1d35)', borderRadius: 24, padding: '2.5rem', color: '#fff', border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 12px 40px rgba(11,29,53,.18)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(13,158,138,.1)', pointerEvents: 'none' }} />
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '.875rem' }}>
                Start building a more supportive campus experience today.
              </p>
              <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                Join students, mentors, and admins who use CampusCare to make university life a little easier, a little less stressful, and a lot more connected.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.625rem' }}>
                <Link to="/start" className="lp-btn-primary">Create account</Link>
                <Link to="/login" className="lp-btn-ondark">Login</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <footer style={{ background: 'linear-gradient(135deg,#071527,#0b1d35,#0f2f46)', padding: '3rem clamp(1rem,5vw,4rem) 2rem', color: 'rgba(255,255,255,.6)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '1rem' }}>
                  <BrandMark inverted />
                  <span>
                    <span style={{ display: 'block', fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#fff' }}>CampusCare</span>
                    <span style={{ display: 'block', fontSize: '.7rem', color: 'rgba(255,255,255,.45)' }}>Student support platform</span>
                  </span>
                </Link>
                <p style={{ fontSize: '.85rem', lineHeight: 1.7, maxWidth: 340 }}>A calmer academic support workspace for students, mentors, and admins at every university.</p>
                <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)', marginTop: '.75rem' }}>University "Isa Boletini" – Mitrovicë, Faculty of Computer Science & Engineering</p>
              </div>
              <div>
                <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#67e3d6', marginBottom: '1rem' }}>Explore</p>
                {[['Modules', '#modules'], ['Roles', '#roles'], ['Login', '/login']].map(([label, href]) => (
                  href.startsWith('#')
                    ? <a key={label} href={href} style={{ display: 'block', fontSize: '.875rem', color: 'rgba(255,255,255,.55)', textDecoration: 'none', marginBottom: '.5rem', transition: 'color .15s' }}>{label}</a>
                    : <Link key={label} to={href} style={{ display: 'block', fontSize: '.875rem', color: 'rgba(255,255,255,.55)', textDecoration: 'none', marginBottom: '.5rem' }}>{label}</Link>
                ))}
              </div>
              <div>
                <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#67e3d6', marginBottom: '1rem' }}>Role entry</p>
                {[['Student', '/register?role=student'], ['Mentor', '/register?role=mentor'], ['Admin', '/login?role=admin']].map(([label, to]) => (
                  <Link key={label} to={to} style={{ display: 'block', fontSize: '.875rem', color: 'rgba(255,255,255,.55)', textDecoration: 'none', marginBottom: '.5rem' }}>{label}</Link>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem' }}>
              <span style={{ fontSize: '.8rem' }}>CampusCare academic full-stack project</span>
              <Link to="/start" style={{ fontSize: '.8rem', fontWeight: 600, color: '#67e3d6', textDecoration: 'none' }}>Get Started →</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
