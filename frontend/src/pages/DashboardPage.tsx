import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../types/dashboard';
import { formatDate } from '../utils/formatDate';

/* ─── TYPES ─────────────────────────────────────────────────── */
type StatCard = {
  label: string;
  value: number;
  description: string;
};

type EngagementCard = {
  title: string;
  description: string;
  to?: string;
  action?: string;
};

function formatMetric(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function roleIntro(role?: string) {
  if (role === 'admin') {
    return {
      title: 'Admin Dashboard',
      description:
        'Global CampusCare activity, support load, wellbeing signals, and report status.',
    };
  }

  if (role === 'mentor') {
    return {
      title: 'Mentor Dashboard',
      description:
        'Support-focused overview for help requests, student skills, and wellbeing trends.',
    };
  }

  return {
    title: 'Student Dashboard',
    description:
      'Your personal CampusCare activity across help requests, skills, stress, mood, and lost/found reports.',
  };
}

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const T = {
  navy: '#0b1d35',
  navy2: '#0f2647',
  teal: '#0d9e8a',
  teal2: '#0bbfaa',
  cyan: '#67e3d6',
  white: '#ffffff',

  g50: '#f4f8fc',
  g100: '#eef4f8',
  g200: '#dce7f1',
  g400: '#94a3b8',
  g500: '#64748b',
  g600: '#475569',
  g800: '#1e293b',

  blue: '#2563eb',
  amber: '#d97706',
  red: '#dc2626',
  green: '#059669',

  fontDisplay: "'Sora', sans-serif",
  fontBody: "'DM Sans', sans-serif",

  radiusSm: 8,
  radiusMd: 14,
  radiusLg: 22,
  radiusXl: 32,

  shadowSm: '0 1px 4px rgba(11,29,53,.06), 0 2px 8px rgba(11,29,53,.04)',
  shadowMd: '0 4px 20px rgba(11,29,53,.10)',
  shadowLg: '0 12px 40px rgba(11,29,53,.14)',

  pageBg:
    'radial-gradient(circle at top right, rgba(13,158,138,.10), transparent 28rem), radial-gradient(circle at top left, rgba(37,99,235,.08), transparent 26rem), linear-gradient(180deg, #f8fbff 0%, #f3f7fb 48%, #eef4f8 100%)',

  cardBg: 'rgba(255,255,255,.88)',
  cardShadow: '0 14px 34px rgba(15, 23, 42, .07)',
  cardBorder: '#dfeaf3',
};

/* ─── MODULE META ───────────────────────────────────────────── */
const MODULE_META: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  'My Help Requests': {
    color: T.teal,
    bg: 'rgba(13,158,138,.1)',
    border: 'rgba(13,158,138,.2)',
    icon: '💬',
  },
  'Open Help Requests': {
    color: T.red,
    bg: 'rgba(220,38,38,.08)',
    border: 'rgba(220,38,38,.18)',
    icon: '🔔',
  },
  'Help Requests': {
    color: T.teal,
    bg: 'rgba(13,158,138,.1)',
    border: 'rgba(13,158,138,.2)',
    icon: '💬',
  },
  'My Skills': {
    color: T.blue,
    bg: 'rgba(37,99,235,.08)',
    border: 'rgba(37,99,235,.18)',
    icon: '⚡',
  },
  'SkillMap Skills': {
    color: T.blue,
    bg: 'rgba(37,99,235,.08)',
    border: 'rgba(37,99,235,.18)',
    icon: '⚡',
  },
  'Student Skill Profiles': {
    color: T.blue,
    bg: 'rgba(37,99,235,.08)',
    border: 'rgba(37,99,235,.18)',
    icon: '⚡',
  },
  'Skill Profiles': {
    color: T.blue,
    bg: 'rgba(37,99,235,.08)',
    border: 'rgba(37,99,235,.18)',
    icon: '⚡',
  },
  'Skills Added': {
    color: T.blue,
    bg: 'rgba(37,99,235,.08)',
    border: 'rgba(37,99,235,.18)',
    icon: '⚡',
  },
  'My Stress Records': {
    color: T.amber,
    bg: 'rgba(217,119,6,.08)',
    border: 'rgba(217,119,6,.18)',
    icon: '📊',
  },
  'Stress Records': {
    color: T.amber,
    bg: 'rgba(217,119,6,.08)',
    border: 'rgba(217,119,6,.18)',
    icon: '📊',
  },
  'Average Stress': {
    color: T.amber,
    bg: 'rgba(217,119,6,.08)',
    border: 'rgba(217,119,6,.18)',
    icon: '📈',
  },
  'My Mood Records': {
    color: '#7c3aed',
    bg: 'rgba(124,58,237,.08)',
    border: 'rgba(124,58,237,.18)',
    icon: '🌙',
  },
  'Mood Records': {
    color: '#7c3aed',
    bg: 'rgba(124,58,237,.08)',
    border: 'rgba(124,58,237,.18)',
    icon: '🌙',
  },
  'My Lost/Found Reports': {
    color: T.green,
    bg: 'rgba(5,150,105,.08)',
    border: 'rgba(5,150,105,.18)',
    icon: '📍',
  },
  'Lost/Found Items': {
    color: T.green,
    bg: 'rgba(5,150,105,.08)',
    border: 'rgba(5,150,105,.18)',
    icon: '📍',
  },
  'Resolved Reports': {
    color: T.green,
    bg: 'rgba(5,150,105,.08)',
    border: 'rgba(5,150,105,.18)',
    icon: '✅',
  },
  'Total Users': {
    color: T.navy,
    bg: 'rgba(11,29,53,.06)',
    border: 'rgba(11,29,53,.12)',
    icon: '👥',
  },
};

const MOOD_COLORS: Record<string, string> = {
  calm: T.teal,
  motivated: T.blue,
  tired: T.amber,
  stressed: T.red,
  overwhelmed: '#7c3aed',
};

const QUICK_ACTIONS = [
  { label: 'Ask for help', to: '/silent-help', color: T.teal },
  { label: 'Add skill', to: '/skill-map', color: T.blue },
  { label: 'Log stress', to: '/stress-tracker', color: T.amber },
  { label: 'Log mood', to: '/mood-campus', color: '#7c3aed' },
  { label: 'Report item', to: '/lost-found', color: T.green },
];

/* ─── COMPONENT ─────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .stats()
      .then(setStats)
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const moodTotal = useMemo(() => {
    return (
      stats?.totalMoodRecords ??
      Object.values(stats?.moodCounts ?? {}).reduce((total, count) => total + count, 0)
    );
  }, [stats]);

  const cards = useMemo<StatCard[]>(() => {
    if (!stats) return [];

    if (user?.role === 'admin') {
      return [
        {
          label: 'Total Users',
          value: stats.totalUsers,
          description: 'Registered students, mentors, and admins',
        },
        {
          label: 'Help Requests',
          value: stats.totalHelpRequests,
          description: 'All submitted help requests',
        },
        {
          label: 'Open Help Requests',
          value: stats.openHelpRequests,
          description: 'Requests needing attention',
        },
        {
          label: 'Skills Added',
          value: stats.totalSkills,
          description: 'Shared SkillMap catalog entries',
        },
        {
          label: 'Skill Profiles',
          value: stats.totalStudentSkills ?? 0,
          description: 'Skills attached to user profiles',
        },
        {
          label: 'Stress Records',
          value: stats.totalStressRecords,
          description: 'ExamStress check-ins',
        },
        {
          label: 'Mood Records',
          value: moodTotal,
          description: 'MoodCampus check-ins',
        },
        {
          label: 'Lost/Found Items',
          value: stats.totalLostFoundItems ?? 0,
          description: 'All lost/found reports',
        },
        {
          label: 'Average Stress',
          value: stats.averageStressLevel,
          description: 'Average recorded stress level',
        },
      ];
    }

    if (user?.role === 'mentor') {
      return [
        {
          label: 'Open Help Requests',
          value: stats.openHelpRequests,
          description: 'Students waiting for support',
        },
        {
          label: 'Help Requests',
          value: stats.totalHelpRequests,
          description: 'Support conversations visible to mentors',
        },
        {
          label: 'SkillMap Skills',
          value: stats.totalSkills,
          description: 'Skills available for collaboration',
        },
        {
          label: 'Student Skill Profiles',
          value: stats.totalStudentSkills ?? 0,
          description: 'Students showing practical skills',
        },
        {
          label: 'Average Stress',
          value: stats.averageStressLevel,
          description: 'Overall wellbeing signal',
        },
        {
          label: 'Stress Records',
          value: stats.totalStressRecords,
          description: 'Stress check-ins available',
        },
        {
          label: 'Mood Records',
          value: moodTotal,
          description: 'Mood check-ins available',
        },
      ];
    }

    return [
      {
        label: 'My Help Requests',
        value: stats.totalHelpRequests,
        description: 'Support requests connected to you',
      },
      {
        label: 'My Skills',
        value: stats.totalStudentSkills ?? 0,
        description: 'Skills attached to your SkillMap profile',
      },
      {
        label: 'My Stress Records',
        value: stats.totalStressRecords,
        description: 'Your ExamStress check-ins',
      },
      {
        label: 'My Mood Records',
        value: moodTotal,
        description: 'Your MoodCampus entries',
      },
      {
        label: 'My Lost/Found Reports',
        value: stats.totalLostFoundItems ?? 0,
        description: 'Lost/found reports connected to you',
      },
      {
        label: 'Resolved Reports',
        value: stats.lostFoundResolved,
        description: 'Your resolved lost/found reports',
      },
      {
        label: 'Average Stress',
        value: stats.averageStressLevel,
        description: 'Your average stress level',
      },
    ];
  }, [moodTotal, stats, user?.role]);

  const intro = roleIntro(user?.role);

  const engagementCards: EngagementCard[] =
    user?.role === 'admin'
      ? [
          {
            title: 'Platform activity overview',
            description:
              'Watch open support requests, lost/found reports, and module activity from one place.',
          },
          {
            title: 'Modules needing attention',
            description: `${stats?.openHelpRequests ?? 0} open help requests · ${
              stats?.lostFoundOpen ?? 0
            } open lost/found reports.`,
          },
          {
            title: 'Role-aware management',
            description: 'Admin controls appear only where status management is implemented.',
            to: '/lost-found',
            action: 'Review reports',
          },
        ]
      : user?.role === 'mentor'
        ? [
            {
              title: 'Requests needing attention',
              description: `${stats?.openHelpRequests ?? 0} open requests may need a supportive reply.`,
              to: '/silent-help',
              action: 'Review requests',
            },
            {
              title: 'Watch for stress patterns',
              description:
                'Use stress and mood summaries as signals for guidance, not judgment.',
              to: '/stress-tracker',
              action: 'View stress',
            },
            {
              title: 'Support impact',
              description:
                'Reply to anonymous requests and help students find the right direction.',
            },
          ]
        : [
            {
              title: 'How are you feeling today?',
              description: 'Small check-ins can help you understand your week.',
              to: '/mood-campus',
              action: 'Log mood',
            },
            {
              title: 'Need help with something?',
              description: 'You are not alone. You can ask anonymously.',
              to: '/silent-help',
              action: 'Ask for help',
            },
            {
              title: 'Your skills can help another student',
              description:
                'Add one skill so classmates and mentors can discover what you are good at.',
              to: '/skill-map',
              action: 'Add skill',
            },
          ];

  const roleBadgeStyle = getRoleBadgeStyle(user?.role);

  const greeting =
    user?.role === 'student'
      ? `Welcome back, ${user?.fullName?.split(' ')[0] ?? 'Student'}`
      : user?.role === 'mentor'
        ? 'Good to see you, Mentor'
        : 'Admin overview';

  const bannerTip =
    user?.role === 'student'
      ? "Today's tip: if a question feels too small to ask publicly, it still belongs in Silent Help."
      : user?.role === 'mentor'
        ? 'Reply to anonymous requests, watch for stress patterns, and help students find the right next step.'
        : 'Use the dashboard as a quick signal board for open support needs, module activity, and resolved reports.';

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes db-fade-up {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .db-stat:hover {
          box-shadow: 0 18px 45px rgba(15,23,42,.10);
          transform: translateY(-3px);
          border-color: rgba(13,158,138,.28) !important;
        }

        .db-engage:hover {
          box-shadow: 0 18px 45px rgba(15,23,42,.10);
          transform: translateY(-3px);
          border-color: rgba(13,158,138,.30) !important;
        }

        .db-action:hover {
          transform: translateY(-1px);
          box-shadow: ${T.shadowSm};
        }

        .db-mood-bar {
          transition: width .6s cubic-bezier(.4,0,.2,1);
        }

        @media (max-width: 720px) {
          .dashboard-page-shell {
            margin: -1rem !important;
            padding: 1rem !important;
          }
        }
      `}</style>

      <div
        className="dashboard-page-shell"
        style={{
          fontFamily: T.fontBody,
          color: T.navy,
          minHeight: '100vh',
          margin: '-2rem',
          padding: '2rem',
          background: T.pageBg,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 120,
            right: 80,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'rgba(13,158,138,.08)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 280,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'rgba(37,99,235,.06)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'none' }}>
            <PageHeader title={intro.title} description={intro.description} />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem',
              marginBottom: '1.75rem',
              animation: 'db-fade-up .4s ease both',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1
                  style={{
                    fontFamily: T.fontDisplay,
                    fontSize: 'clamp(1.4rem,3vw,1.9rem)',
                    fontWeight: 700,
                    letterSpacing: '-.02em',
                    color: T.navy,
                    margin: 0,
                  }}
                >
                  {intro.title}
                </h1>
                <span style={roleBadgeStyle}>{user?.role}</span>
              </div>

              <p
                style={{
                  fontSize: '.9rem',
                  color: T.g600,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {intro.description}
              </p>
            </div>

            <Link
              to={user?.role === 'student' ? '/onboarding' : '/profile'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: T.navy,
                color: T.white,
                borderRadius: 999,
                padding: '.55rem 1.25rem',
                fontSize: '.85rem',
                fontWeight: 500,
                textDecoration: 'none',
                flexShrink: 0,
                transition: 'all .18s',
              }}
            >
              {user?.role === 'student' ? 'Update onboarding' : 'View profile'}
            </Link>
          </div>

          <div
            style={{
              background:
                'radial-gradient(circle at top right, rgba(45,212,191,.22), transparent 28%), linear-gradient(135deg, #0b1d35 0%, #102a46 48%, #133b5c 100%)',
              borderRadius: T.radiusLg,
              padding: '1.5rem 2rem',
              marginBottom: '1.75rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 18px 45px rgba(11,29,53,.18)',
              border: '1px solid rgba(255,255,255,.08)',
              animation: 'db-fade-up .45s ease both',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'rgba(13,158,138,.12)',
                pointerEvents: 'none',
              }}
            />

            <p
              style={{
                fontFamily: T.fontDisplay,
                fontWeight: 600,
                color: T.white,
                fontSize: '1rem',
                margin: 0,
              }}
            >
              {greeting}
            </p>

            <p
              style={{
                color: 'rgba(255,255,255,.62)',
                fontSize: '.85rem',
                margin: '.5rem 0 0',
                lineHeight: 1.65,
                maxWidth: 700,
              }}
            >
              {bannerTip}
            </p>
          </div>

          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  style={{
                    height: 80,
                    borderRadius: T.radiusMd,
                    background: T.g100,
                    animation: `db-fade-up .3s ease ${index * 0.06}s both`,
                  }}
                />
              ))}
            </div>
          )}

          {error && (
            <div
              style={{
                background: 'rgba(220,38,38,.07)',
                border: '1px solid rgba(220,38,38,.2)',
                borderRadius: T.radiusMd,
                padding: '1rem 1.25rem',
                color: T.red,
                fontSize: '.875rem',
                marginBottom: '1.75rem',
              }}
            >
              {error}
            </div>
          )}

          {stats && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px),1fr))',
                  gap: '1rem',
                  marginBottom: '1.75rem',
                }}
              >
                {engagementCards.map((card, index) => (
                  <div
                    key={card.title}
                    className="db-engage"
                    style={{
                      background: T.cardBg,
                      border: `1px solid ${T.cardBorder}`,
                      boxShadow: T.cardShadow,
                      backdropFilter: 'blur(10px)',
                      borderRadius: T.radiusMd,
                      padding: '1.25rem 1.5rem',
                      transition: 'all .2s',
                      cursor: card.to ? 'pointer' : 'default',
                      animation: `db-fade-up .4s ease ${index * 0.07}s both`,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: T.fontDisplay,
                        fontSize: '.9rem',
                        fontWeight: 600,
                        color: T.navy,
                        marginBottom: '.5rem',
                      }}
                    >
                      {card.title}
                    </p>

                    <p
                      style={{
                        fontSize: '.825rem',
                        color: T.g600,
                        lineHeight: 1.65,
                        marginBottom: card.to ? '1rem' : 0,
                      }}
                    >
                      {card.description}
                    </p>

                    {card.to && (
                      <Link
                        to={card.to}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          background: T.g50,
                          border: `1px solid ${T.g200}`,
                          color: T.navy,
                          borderRadius: 999,
                          padding: '.35rem .9rem',
                          fontSize: '.78rem',
                          fontWeight: 500,
                          textDecoration: 'none',
                          transition: 'all .15s',
                        }}
                      >
                        {card.action} →
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,190px),1fr))',
                  gap: '1rem',
                  marginBottom: '1.75rem',
                }}
              >
                {cards.map((card, index) => {
                  const meta =
                    MODULE_META[card.label] ?? {
                      color: T.teal,
                      bg: 'rgba(13,158,138,.08)',
                      border: 'rgba(13,158,138,.18)',
                      icon: '·',
                    };

                  const isEmpty = card.value === 0;

                  return (
                    <article
                      key={card.label}
                      className="db-stat"
                      style={{
                        background: T.cardBg,
                        border: `1px solid ${T.cardBorder}`,
                        boxShadow: T.cardShadow,
                        backdropFilter: 'blur(10px)',
                        borderRadius: T.radiusMd,
                        padding: '1.25rem',
                        transition: 'all .2s',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: `db-fade-up .4s ease ${index * 0.05}s both`,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background: isEmpty ? T.g200 : meta.color,
                          borderRadius: '14px 14px 0 0',
                          opacity: isEmpty ? 0.4 : 1,
                        }}
                      />

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: isEmpty ? T.g100 : meta.bg,
                          border: `1px solid ${isEmpty ? T.g200 : meta.border}`,
                          fontSize: '1rem',
                          marginBottom: '.75rem',
                        }}
                      >
                        {meta.icon}
                      </div>

                      <p
                        style={{
                          fontSize: '.7rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '.07em',
                          color: isEmpty ? T.g400 : T.g600,
                          marginBottom: '.35rem',
                        }}
                      >
                        {card.label}
                      </p>

                      <p
                        style={{
                          fontFamily: T.fontDisplay,
                          fontSize: '1.9rem',
                          fontWeight: 700,
                          color: isEmpty ? T.g400 : meta.color,
                          lineHeight: 1,
                          marginBottom: '.35rem',
                        }}
                      >
                        {formatMetric(card.value)}
                      </p>

                      <p
                        style={{
                          fontSize: '.72rem',
                          color: T.g400,
                          lineHeight: 1.5,
                        }}
                      >
                        {isEmpty ? 'No data yet' : card.description}
                      </p>
                    </article>
                  );
                })}
              </div>

              {user?.role === 'student' && (
                <div
                  style={{
                    background: T.cardBg,
                    border: `1px solid ${T.cardBorder}`,
                    boxShadow: T.cardShadow,
                    backdropFilter: 'blur(10px)',
                    borderRadius: T.radiusMd,
                    padding: '1.5rem',
                    marginBottom: '1.75rem',
                    animation: 'db-fade-up .4s ease .2s both',
                  }}
                >
                  <p
                    style={{
                      fontFamily: T.fontDisplay,
                      fontSize: '.9rem',
                      fontWeight: 600,
                      color: T.navy,
                      marginBottom: '.35rem',
                    }}
                  >
                    Quick Actions
                  </p>

                  <p
                    style={{
                      fontSize: '.8rem',
                      color: T.g500,
                      marginBottom: '1rem',
                    }}
                  >
                    Continue the main student flow from here.
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.625rem' }}>
                    {QUICK_ACTIONS.map((action) => (
                      <Link
                        key={action.to}
                        to={action.to}
                        className="db-action"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: T.g50,
                          border: `1px solid ${T.g200}`,
                          borderLeft: `3px solid ${action.color}`,
                          borderRadius: 999,
                          padding: '.45rem 1.1rem',
                          fontSize: '.8rem',
                          fontWeight: 500,
                          color: T.navy,
                          textDecoration: 'none',
                          transition: 'all .15s',
                        }}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px),1fr))',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    background: T.cardBg,
                    border: `1px solid ${T.cardBorder}`,
                    boxShadow: T.cardShadow,
                    backdropFilter: 'blur(10px)',
                    borderRadius: T.radiusMd,
                    padding: '1.5rem',
                    animation: 'db-fade-up .4s ease .25s both',
                  }}
                >
                  <p
                    style={{
                      fontFamily: T.fontDisplay,
                      fontSize: '.9rem',
                      fontWeight: 600,
                      color: T.navy,
                      marginBottom: '.3rem',
                    }}
                  >
                    Mood Summary
                  </p>

                  <p
                    style={{
                      fontSize: '.78rem',
                      color: T.g500,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {user?.role === 'student'
                      ? 'Your MoodCampus records.'
                      : 'MoodCampus counts for support awareness.'}
                  </p>

                  {Object.keys(stats.moodCounts ?? {}).length === 0 ? (
                    <div
                      style={{
                        background: T.g50,
                        borderRadius: T.radiusSm,
                        padding: '1.5rem',
                        textAlign: 'center',
                        color: T.g400,
                        fontSize: '.825rem',
                      }}
                    >
                      No mood records yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
                      {(() => {
                        const entries = Object.entries(stats.moodCounts ?? {});
                        const max = Math.max(...entries.map(([, value]) => value));

                        return entries.map(([mood, count]) => {
                          const percentage = max > 0 ? Math.round((count / max) * 100) : 0;
                          const color = MOOD_COLORS[mood] ?? T.g400;

                          return (
                            <div key={mood}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: 4,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '.8rem',
                                    fontWeight: 500,
                                    color: T.navy,
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {mood.replace('_', ' ')}
                                </span>

                                <span
                                  style={{
                                    fontSize: '.8rem',
                                    fontWeight: 600,
                                    color,
                                  }}
                                >
                                  {count}
                                </span>
                              </div>

                              <div
                                style={{
                                  height: 6,
                                  background: T.g100,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  className="db-mood-bar"
                                  style={{
                                    height: '100%',
                                    width: `${percentage}%`,
                                    background: color,
                                    borderRadius: 999,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: T.cardBg,
                    border: `1px solid ${T.cardBorder}`,
                    boxShadow: T.cardShadow,
                    backdropFilter: 'blur(10px)',
                    borderRadius: T.radiusMd,
                    padding: '1.5rem',
                    animation: 'db-fade-up .4s ease .3s both',
                  }}
                >
                  <p
                    style={{
                      fontFamily: T.fontDisplay,
                      fontSize: '.9rem',
                      fontWeight: 600,
                      color: T.navy,
                      marginBottom: '.3rem',
                    }}
                  >
                    Recent Activity
                  </p>

                  <p
                    style={{
                      fontSize: '.78rem',
                      color: T.g500,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {user?.role === 'student'
                      ? 'Your latest CampusCare activity.'
                      : 'Latest platform support and report activity.'}
                  </p>

                  {stats.recentActivity?.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                      {stats.recentActivity.map((activity, index) => {
                        const typeColor = activity.type.includes('help')
                          ? T.teal
                          : activity.type.includes('mood')
                            ? '#7c3aed'
                            : activity.type.includes('stress')
                              ? T.amber
                              : activity.type.includes('skill')
                                ? T.blue
                                : T.green;

                        return (
                          <div
                            key={`${activity.type}-${activity.createdAt}-${index}`}
                            style={{
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'flex-start',
                              paddingBottom: '.75rem',
                              borderBottom:
                                index < stats.recentActivity!.length - 1
                                  ? `1px solid ${T.g100}`
                                  : 'none',
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: typeColor,
                                flexShrink: 0,
                                marginTop: 6,
                              }}
                            />

                            <div>
                              <p
                                style={{
                                  fontSize: '.85rem',
                                  fontWeight: 500,
                                  color: T.navy,
                                  marginBottom: 2,
                                }}
                              >
                                {activity.title}
                              </p>

                              <p
                                style={{
                                  fontSize: '.75rem',
                                  color: T.g400,
                                }}
                              >
                                {activity.type.replace('_', ' ')} ·{' '}
                                {formatDate(activity.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        background: T.g50,
                        borderRadius: T.radiusSm,
                        padding: '1.5rem',
                        textAlign: 'center',
                        color: T.g400,
                        fontSize: '.825rem',
                      }}
                    >
                      No recent activity yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── HELPERS ───────────────────────────────────────────────── */
function getRoleBadgeStyle(role?: string): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
    padding: '.25rem .8rem',
    fontSize: '.7rem',
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    border: '1px solid transparent',
  };

  if (role === 'admin') {
    return {
      ...base,
      background: 'rgba(11,29,53,.08)',
      color: '#0b1d35',
      borderColor: 'rgba(11,29,53,.15)',
    };
  }

  if (role === 'mentor') {
    return {
      ...base,
      background: 'rgba(37,99,235,.1)',
      color: '#2563eb',
      borderColor: 'rgba(37,99,235,.2)',
    };
  }

  return {
    ...base,
    background: 'rgba(13,158,138,.1)',
    color: '#0d9e8a',
    borderColor: 'rgba(13,158,138,.2)',
  };
}