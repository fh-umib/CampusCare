import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { profileService } from '../services/profileService';
import { skillService } from '../services/skillService';
import type { UserProfile } from '../types/profile';
import type { StudentSkill } from '../types/skill';
import { formatDate } from '../utils/formatDate';

/* ─── DESIGN TOKENS ──────────────────────────────────────────── */
const T = {
  navy:    '#0b1d35',
  navy2:   '#0f2647',
  teal:    '#0d9e8a',
  teal2:   '#0bbfaa',
  cyan:    '#67e3d6',
  bg:      '#f4f8fc',
  card:    '#ffffff',
  border:  '#dfeaf3',
  muted:   '#64748b',
  dark:    '#0b1d35',
  g50:     '#f8fafc',
  g100:    '#f1f5f9',
  g200:    '#e2e8f0',
  g400:    '#94a3b8',
  blue:    '#2563eb',
  amber:   '#d97706',
  green:   '#059669',
  purple:  '#7c3aed',
  red:     '#dc2626',
  fontD:   "'Sora', sans-serif",
  fontB:   "'DM Sans', sans-serif",
  rSm: 8, rMd: 14, rLg: 22, rXl: 32,
  shadowSm: '0 1px 4px rgba(11,29,53,.06), 0 2px 8px rgba(11,29,53,.04)',
  shadowMd: '0 4px 20px rgba(11,29,53,.10)',
  shadowLg: '0 12px 40px rgba(11,29,53,.14)',
};

/* ─── HELPERS ────────────────────────────────────────────────── */
function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getRoleConfig(role?: string) {
  if (role === 'admin') return {
    label: 'Admin Workspace',
    desc: 'Your platform management profile for monitoring CampusCare activity.',
    badge: 'Admin',
    color: T.navy,
    bg: 'rgba(11,29,53,.1)',
    border: 'rgba(11,29,53,.2)',
  };
  if (role === 'mentor') return {
    label: 'Mentor Workspace',
    desc: 'Your guidance profile for supporting students and following academic wellbeing trends.',
    badge: 'Mentor',
    color: T.blue,
    bg: 'rgba(37,99,235,.1)',
    border: 'rgba(37,99,235,.2)',
  };
  return {
    label: 'Student Workspace',
    desc: 'Your personal support, skills, and wellbeing identity inside CampusCare.',
    badge: 'Student',
    color: T.teal,
    bg: 'rgba(13,158,138,.1)',
    border: 'rgba(13,158,138,.2)',
  };
}

const SKILL_LEVEL_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  beginner:     { color: T.teal,   bg: 'rgba(13,158,138,.08)',   border: 'rgba(13,158,138,.2)' },
  intermediate: { color: T.blue,   bg: 'rgba(37,99,235,.08)',    border: 'rgba(37,99,235,.2)' },
  advanced:     { color: T.amber,  bg: 'rgba(217,119,6,.08)',     border: 'rgba(217,119,6,.2)' },
  expert:       { color: T.purple, bg: 'rgba(124,58,237,.08)',    border: 'rgba(124,58,237,.2)' },
};

type InfoRow = { label: string; value?: string | null; icon: string };

/* ─── ROLE IDENTITY CARDS ────────────────────────────────────── */
const IDENTITY_CARDS: Record<string, Array<{ title: string; desc: string; icon: string; color: string }>> = {
  student: [
    { title: 'Academic Support',      desc: 'Ask for help anonymously and get answers from mentors.',    icon: '💬', color: T.teal },
    { title: 'Wellbeing Check-ins',   desc: 'Track stress and mood to understand your own patterns.',   icon: '🌙', color: T.purple },
    { title: 'Skills & Collaboration',desc: 'Share your skills and discover who can help you grow.',    icon: '⚡', color: T.blue },
    { title: 'Campus Reports',        desc: 'Report lost/found items and resolve practical issues.',    icon: '📍', color: T.green },
  ],
  mentor: [
    { title: 'Student Guidance',      desc: 'Reply to help requests and support students meaningfully.', icon: '💬', color: T.teal },
    { title: 'Stress/Mood Awareness', desc: 'Understand wellbeing trends to guide students better.',    icon: '📊', color: T.amber },
    { title: 'Skill Discovery',       desc: 'Explore student skills and identify collaboration needs.', icon: '⚡', color: T.blue },
    { title: 'Help Request Replies',  desc: 'Respond to open anonymous requests in the platform.',     icon: '🔔', color: T.red },
  ],
  admin: [
    { title: 'Platform Monitoring',   desc: 'View global statistics and module activity at a glance.', icon: '📈', color: T.teal },
    { title: 'Status Management',     desc: 'Manage open/closed statuses across all modules.',         icon: '⚙️', color: T.blue },
    { title: 'User Activity Overview',desc: 'Track user engagement across students and mentors.',      icon: '👥', color: T.navy },
    { title: 'Support Trend Awareness',desc:'Understand how students are using support features.',     icon: '🌐', color: T.purple },
  ],
};

const QUICK_ACTIONS: Record<string, Array<{ label: string; to: string; color: string }>> = {
  student: [
    { label: 'Ask for help',        to: '/silent-help',    color: T.teal },
    { label: 'Add skill',           to: '/skill-map',      color: T.blue },
    { label: 'Log stress',          to: '/stress-tracker', color: T.amber },
    { label: 'Log mood',            to: '/mood-campus',    color: T.purple },
    { label: 'Report lost/found',   to: '/lost-found',     color: T.green },
    { label: 'Update onboarding',   to: '/onboarding',     color: T.muted },
  ],
  mentor: [
    { label: 'Review requests',  to: '/silent-help',    color: T.teal },
    { label: 'View SkillMap',    to: '/skill-map',      color: T.blue },
    { label: 'Check stress',     to: '/stress-tracker', color: T.amber },
    { label: 'Update profile',   to: '/onboarding',     color: T.muted },
  ],
  admin: [
    { label: 'View dashboard',   to: '/dashboard',      color: T.teal },
    { label: 'Review reports',   to: '/lost-found',     color: T.green },
    { label: 'Monitor requests', to: '/silent-help',    color: T.amber },
    { label: 'Skill overview',   to: '/skill-map',      color: T.blue },
  ],
};

/* ─── COMPONENT ──────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([skillService.getMySkills(), profileService.getCurrentProfile()])
      .then(([skillsData, profileData]) => {
        setSkills(skillsData);
        setProfile(profileData);
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err)));
  }, []);

  const role = user?.role ?? 'student';
  const roleConfig = getRoleConfig(role);
  const identityCards = IDENTITY_CARDS[role] ?? IDENTITY_CARDS.student;
  const quickActions = QUICK_ACTIONS[role] ?? QUICK_ACTIONS.student;

  /* Profile rows — same logic as original, untouched */
  const profileRows: InfoRow[] =
    role === 'mentor'
      ? [
          { label: 'Expertise areas',       value: profile?.expertiseAreas,       icon: '🎓' },
          { label: 'Can help with',          value: profile?.canHelpWith,          icon: '🤝' },
          { label: 'Availability',           value: profile?.availability,         icon: '📅' },
          { label: 'Mentoring reason',       value: profile?.mentoringReason,      icon: '💡' },
          { label: 'Preferred support type', value: profile?.preferredSupportType, icon: '⭐' },
        ]
      : role === 'admin'
      ? [
          { label: 'Position',           value: profile?.adminPosition,         icon: '🏢' },
          { label: 'Department / unit',  value: profile?.adminDepartmentUnit,   icon: '🗂️' },
          { label: 'Access reason',      value: profile?.adminAccessReason,     icon: '🔑' },
        ]
      : [
          { label: 'Study year',       value: profile?.studyYear,       icon: '📚' },
          { label: 'Department',       value: profile?.department,      icon: '🏫' },
          { label: 'Support interest', value: profile?.supportInterest, icon: '💬' },
          { label: 'Reason for joining',value: profile?.reasonForJoining,icon: '✏️' },
        ];

  /* Completion score */
  const filled = profileRows.filter(r => r.value).length;
  const total  = profileRows.length + 2; // +name +email always filled
  const pct    = Math.round(((filled + 2) / total) * 100);

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes pf-fade-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pf-bar     { from{width:0%} to{width:${pct}%} }
        .pf-card   { background:#fff; border:1px solid #dfeaf3; border-radius:22px; padding:1.75rem; }
        .pf-card-hover:hover { box-shadow:0 4px 20px rgba(11,29,53,.10); transform:translateY(-2px); }
        .pf-id-card:hover    { box-shadow:0 4px 20px rgba(11,29,53,.10); transform:translateY(-2px); border-color:rgba(13,158,138,.25) !important; }
        .pf-qa:hover         { transform:translateY(-1px); box-shadow:0 1px 4px rgba(11,29,53,.06); }
        .pf-skill:hover      { transform:translateY(-1px); }
        .pf-anim-1 { animation: pf-fade-up .4s ease .05s both; }
        .pf-anim-2 { animation: pf-fade-up .4s ease .10s both; }
        .pf-anim-3 { animation: pf-fade-up .4s ease .15s both; }
        .pf-anim-4 { animation: pf-fade-up .4s ease .20s both; }
        .pf-anim-5 { animation: pf-fade-up .4s ease .25s both; }
        .pf-anim-6 { animation: pf-fade-up .4s ease .30s both; }
        .pf-anim-7 { animation: pf-fade-up .4s ease .35s both; }
        .pf-bar-anim { animation: pf-bar .8s cubic-bezier(.4,0,.2,1) .4s both; }
      `}</style>

      <div style={{ fontFamily: T.fontB, color: T.dark, minHeight: '100%', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── ERROR ───────────────────────────────────────────────── */}
        {error && (
          <div style={{ background: 'rgba(220,38,38,.07)', border: '1px solid rgba(220,38,38,.2)', borderRadius: T.rMd, padding: '1rem 1.25rem', color: T.red, fontSize: '.875rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* ━━━━ 1. HERO CARD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="pf-anim-1" style={{
          background: `linear-gradient(135deg, ${T.navy2} 0%, ${T.navy} 100%)`,
          borderRadius: T.rXl, padding: '2.5rem',
          marginBottom: '1.25rem', position: 'relative', overflow: 'hidden',
          boxShadow: T.shadowLg,
        }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(13,158,138,.12)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(103,227,214,.06)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start', position: 'relative' }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(13,158,138,.4), rgba(13,158,138,.2))',
              border: '2px solid rgba(103,227,214,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontD, fontSize: '1.4rem', fontWeight: 700, color: T.cyan,
            }}>
              {getInitials(user?.fullName)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: '.5rem' }}>
                <h1 style={{ fontFamily: T.fontD, fontSize: 'clamp(1.3rem,3vw,1.75rem)', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-.02em' }}>
                  {user?.fullName}
                </h1>
                <span style={{
                  background: roleConfig.bg, color: roleConfig.color === T.navy ? T.cyan : roleConfig.color,
                  border: `1px solid ${roleConfig.border}`, borderRadius: 999,
                  padding: '.25rem .8rem', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
                }}>{roleConfig.badge}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.875rem', margin: '0 0 .5rem' }}>{user?.email}</p>
              <p style={{ fontFamily: T.fontD, fontWeight: 600, color: T.cyan, fontSize: '.85rem', margin: '0 0 .25rem' }}>{roleConfig.label}</p>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.8rem', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>{roleConfig.desc}</p>
            </div>

            {/* Status badge */}
            <div style={{
              background: 'rgba(13,158,138,.15)', border: '1px solid rgba(13,158,138,.25)',
              borderRadius: T.rMd, padding: '.75rem 1.25rem', textAlign: 'center', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.cyan, display: 'inline-block' }} />
                <span style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: T.cyan }}>Active</span>
              </div>
              <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)', margin: 0, lineHeight: 1.4 }}>CampusCare<br />profile</p>
            </div>
          </div>
        </div>

        {/* ━━━━ 2. COMPLETION + QUICK ACTIONS ROW ━━━━━━━━━━━━━━━━ */}
        <div className="pf-anim-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px),1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>

          {/* Completion */}
          <div className="pf-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontFamily: T.fontD, fontSize: '.9rem', fontWeight: 600, color: T.dark, marginBottom: '.25rem' }}>Profile Completeness</p>
                <p style={{ fontSize: '.78rem', color: T.muted }}>Fill in your profile to get the most out of CampusCare.</p>
              </div>
              <span style={{ fontFamily: T.fontD, fontSize: '1.5rem', fontWeight: 700, color: pct >= 80 ? T.teal : pct >= 50 ? T.amber : T.red }}>{pct}%</span>
            </div>
            {/* Bar */}
            <div style={{ height: 7, background: T.g100, borderRadius: 999, overflow: 'hidden', marginBottom: '1rem' }}>
              <div className="pf-bar-anim" style={{ height: '100%', background: pct >= 80 ? T.teal : pct >= 50 ? T.amber : T.red, borderRadius: 999, width: `${pct}%` }} />
            </div>
            {/* Missing */}
            {profileRows.filter(r => !r.value).length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: T.muted, marginBottom: '.5rem' }}>Missing</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                  {profileRows.filter(r => !r.value).map(r => (
                    <span key={r.label} style={{ background: T.g50, border: `1px solid ${T.g200}`, borderRadius: 999, padding: '.2rem .65rem', fontSize: '.72rem', color: T.muted }}>{r.label}</span>
                  ))}
                </div>
              </div>
            )}
            <Link to="/onboarding" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: T.navy, color: '#fff', borderRadius: 999,
              padding: '.5rem 1.25rem', fontSize: '.82rem', fontWeight: 500,
              textDecoration: 'none', transition: 'all .18s',
            }}>
              {profile?.onboardingCompleted ? 'Update onboarding' : 'Complete onboarding'}
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="pf-card">
            <p style={{ fontFamily: T.fontD, fontSize: '.9rem', fontWeight: 600, color: T.dark, marginBottom: '.25rem' }}>Quick Actions</p>
            <p style={{ fontSize: '.78rem', color: T.muted, marginBottom: '1rem' }}>Jump straight to the modules you use most.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {quickActions.map(a => (
                <Link key={a.to} to={a.to} className="pf-qa" style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: T.g50, border: `1px solid ${T.g200}`,
                  borderLeft: `3px solid ${a.color}`,
                  borderRadius: 999, padding: '.4rem 1rem',
                  fontSize: '.78rem', fontWeight: 500, color: T.dark,
                  textDecoration: 'none', transition: 'all .15s',
                }}>{a.label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* ━━━━ 3. PERSONAL INFO + ROLE IDENTITY ROW ━━━━━━━━━━━━━ */}
        <div className="pf-anim-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,340px),1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>

          {/* Personal Info */}
          <div className="pf-card">
            <p style={{ fontFamily: T.fontD, fontSize: '.9rem', fontWeight: 600, color: T.dark, marginBottom: '1.25rem' }}>Account Information</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {[
                { icon: '👤', label: 'Full name',   value: user?.fullName },
                { icon: '✉️', label: 'Email',       value: user?.email },
                { icon: '🎭', label: 'Role',        value: role, badge: true },
                { icon: '📅', label: 'Joined',      value: user?.createdAt ? formatDate(user.createdAt) : null },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '.75rem',
                  paddingBottom: i < arr.length - 1 ? '.75rem' : 0,
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.g100}` : 'none',
                }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>{row.icon}</span>
                  <div>
                    <p style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: T.g400, marginBottom: 2 }}>{row.label}</p>
                    {row.badge ? (
                      <span style={{
                        background: roleConfig.bg, color: roleConfig.color,
                        border: `1px solid ${roleConfig.border}`,
                        borderRadius: 999, padding: '.2rem .7rem',
                        fontSize: '.75rem', fontWeight: 600, textTransform: 'capitalize',
                      }}>{row.value}</span>
                    ) : (
                      <p style={{ fontSize: '.875rem', fontWeight: 500, color: row.value ? T.dark : T.g400, margin: 0 }}>
                        {row.value ?? 'Not available'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Identity */}
          <div className="pf-card" style={{ padding: '1.75rem 1.5rem' }}>
            <p style={{ fontFamily: T.fontD, fontSize: '.9rem', fontWeight: 600, color: T.dark, marginBottom: '.25rem' }}>
              {role === 'student' ? 'Your student support identity' : role === 'mentor' ? 'Your mentor support identity' : 'Your admin management identity'}
            </p>
            <p style={{ fontSize: '.78rem', color: T.muted, marginBottom: '1.25rem' }}>The areas you are active in on CampusCare.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.625rem' }}>
              {identityCards.map(card => (
                <div key={card.title} className="pf-id-card" style={{
                  background: T.g50, border: `1px solid ${T.border}`,
                  borderRadius: T.rMd, padding: '1rem',
                  transition: 'all .2s',
                }}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '.5rem' }}>{card.icon}</div>
                  <p style={{ fontFamily: T.fontD, fontSize: '.78rem', fontWeight: 600, color: T.dark, marginBottom: '.25rem' }}>{card.title}</p>
                  <p style={{ fontSize: '.72rem', color: T.muted, lineHeight: 1.5, margin: 0 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ━━━━ 4. ONBOARDING DETAILS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="pf-card pf-anim-4" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontFamily: T.fontD, fontSize: '.9rem', fontWeight: 600, color: T.dark, marginBottom: '.25rem' }}>Onboarding Details</p>
              <p style={{ fontSize: '.78rem', color: T.muted }}>
                {profile?.onboardingCompleted ? 'These details help shape a more useful role experience.' : 'Complete onboarding to make CampusCare feel more personal.'}
              </p>
            </div>
            <Link to="/onboarding" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: T.g50, border: `1px solid ${T.g200}`,
              color: T.dark, borderRadius: 999,
              padding: '.45rem 1.1rem', fontSize: '.8rem', fontWeight: 500,
              textDecoration: 'none', transition: 'all .15s',
            }}>Update onboarding</Link>
          </div>

          {profileRows.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,240px),1fr))', gap: '.75rem' }}>
              {profileRows.map(row => (
                <div key={row.label} style={{
                  background: T.g50, border: `1px solid ${T.g200}`,
                  borderRadius: T.rMd, padding: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '.4rem' }}>
                    <span style={{ fontSize: '.875rem' }}>{row.icon}</span>
                    <p style={{ fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: T.g400, margin: 0 }}>{row.label}</p>
                  </div>
                  <p style={{ fontSize: '.875rem', fontWeight: row.value ? 500 : 400, color: row.value ? T.dark : T.g400, margin: 0, lineHeight: 1.55 }}>
                    {row.value ?? <span style={{ fontStyle: 'italic' }}>Not added yet</span>}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="✏️" title="No onboarding data yet" desc="Complete your onboarding to personalize CampusCare for your role." action={{ label: 'Start onboarding', to: '/onboarding' }} />
          )}
        </div>

        {/* ━━━━ 5. SKILLS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="pf-card pf-anim-5" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontFamily: T.fontD, fontSize: '.9rem', fontWeight: 600, color: T.dark, marginBottom: '.25rem' }}>My Skills</p>
              <p style={{ fontSize: '.78rem', color: T.muted }}>Skills attached to your SkillMap profile.</p>
            </div>
            <Link to="/skill-map" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: T.g50, border: `1px solid ${T.g200}`,
              color: T.dark, borderRadius: 999,
              padding: '.45rem 1.1rem', fontSize: '.8rem', fontWeight: 500,
              textDecoration: 'none', transition: 'all .15s',
            }}>Manage skills</Link>
          </div>

          {skills.length === 0 ? (
            <EmptyState icon="⚡" title="No skills added yet" desc="Add your first skill to let classmates and mentors discover how you can help." action={{ label: 'Add a skill', to: '/skill-map' }} />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.625rem' }}>
              {skills.map(skill => {
                const lvl = (skill.level ?? '').toLowerCase();
                const c = SKILL_LEVEL_COLORS[lvl] ?? SKILL_LEVEL_COLORS.beginner;
                return (
                  <span key={skill.skillId} className="pf-skill" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: c.bg, border: `1px solid ${c.border}`,
                    color: c.color, borderRadius: 999,
                    padding: '.3rem .9rem', fontSize: '.8rem', fontWeight: 500,
                    transition: 'all .15s', cursor: 'default',
                  }}>
                    {skill.name}
                    <span style={{ fontSize: '.68rem', opacity: .7, textTransform: 'capitalize' }}>{skill.level}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* ━━━━ 6. NEXT STEPS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="pf-anim-6" style={{
          background: `linear-gradient(135deg, ${T.navy2} 0%, ${T.navy} 100%)`,
          borderRadius: T.rLg, padding: '1.75rem 2rem',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', gap: '1.5rem',
          boxShadow: T.shadowMd, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(13,158,138,.1)', pointerEvents: 'none' }} />
          <div>
            <p style={{ fontFamily: T.fontD, fontWeight: 600, color: '#fff', fontSize: '1rem', marginBottom: '.35rem' }}>Keep building your CampusCare profile</p>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.825rem', margin: 0, lineHeight: 1.6 }}>
              A complete profile helps mentors, admins, and your future self understand your journey.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.625rem', flexShrink: 0 }}>
            <Link to="/onboarding" style={{
              display: 'inline-flex', alignItems: 'center',
              background: T.teal, color: '#fff', borderRadius: 999,
              padding: '.55rem 1.25rem', fontSize: '.85rem', fontWeight: 500,
              textDecoration: 'none',
            }}>Update profile</Link>
            <Link to="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,.1)', color: '#fff',
              border: '1px solid rgba(255,255,255,.18)', borderRadius: 999,
              padding: '.55rem 1.25rem', fontSize: '.85rem', fontWeight: 500,
              textDecoration: 'none',
            }}>Go to dashboard</Link>
          </div>
        </div>

      </div>
    </>
  );
}

/* ─── EMPTY STATE ────────────────────────────────────────────── */
function EmptyState({ icon, title, desc, action }: {
  icon: string; title: string; desc: string;
  action?: { label: string; to: string };
}) {
  return (
    <div style={{
      background: '#f8fafc', border: '1px dashed #dfeaf3',
      borderRadius: 14, padding: '2rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.75rem', marginBottom: '.75rem' }}>{icon}</div>
      <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '.9rem', color: '#0b1d35', marginBottom: '.35rem' }}>{title}</p>
      <p style={{ fontSize: '.825rem', color: '#64748b', marginBottom: action ? '1.25rem' : 0, lineHeight: 1.6 }}>{desc}</p>
      {action && (
        <Link to={action.to} style={{
          display: 'inline-flex', alignItems: 'center',
          background: '#0b1d35', color: '#fff', borderRadius: 999,
          padding: '.45rem 1.25rem', fontSize: '.8rem', fontWeight: 500,
          textDecoration: 'none',
        }}>{action.label}</Link>
      )}
    </div>
  );
}