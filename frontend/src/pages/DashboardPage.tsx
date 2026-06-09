import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../types/dashboard';
import { formatDate } from '../utils/formatDate';

type IconName =
  | 'help'
  | 'skills'
  | 'stress'
  | 'mood'
  | 'lostFound'
  | 'users'
  | 'activity'
  | 'reply'
  | 'profile'
  | 'arrow';

type Metric = {
  label: string;
  value: string;
  helper: string;
  icon: IconName;
  color: string;
  background: string;
};

const colors = {
  navy: '#0b1d35',
  navySoft: '#0f2647',
  teal: '#0d9e8a',
  cyan: '#67e3d6',
  blue: '#2563eb',
  amber: '#d97706',
  green: '#059669',
  violet: '#7c3aed',
  red: '#dc2626',
  muted: '#64748b',
  border: '#dfeaf3'
};

const iconPaths: Record<IconName, ReactNode> = {
  help: (
    <>
      <path d="M4 5.5h16v11H9l-5 4v-15Z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  skills: (
    <>
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="6" r="2.3" />
      <circle cx="18" cy="18" r="2.3" />
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
    </>
  ),
  lostFound: (
    <>
      <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M3.5 20c.4-4 2.4-6 5.5-6s5.1 2 5.5 6M14 15c3.5-.4 5.6 1.3 6.2 4.5" />
    </>
  ),
  activity: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  reply: (
    <>
      <path d="M9 8 4 12l5 4" />
      <path d="M5 12h8c4 0 6 2 6 6" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.5-4.5 2.8-7 7-7s6.5 2.5 7 7" />
    </>
  ),
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />
};

function Icon({
  name,
  size = 40,
  color = colors.teal,
  background = 'rgba(13,158,138,.09)'
}: {
  name: IconName;
  size?: number;
  color?: string;
  background?: string;
}) {
  return (
    <span
      className="db-icon"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        color,
        background
      }}
    >
      <svg
        aria-hidden="true"
        width={size * 0.52}
        height={size * 0.52}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {iconPaths[name]}
      </svg>
    </span>
  );
}

function formatMetric(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function dominantMood(moodCounts: Record<string, number>) {
  const entries = Object.entries(moodCounts);
  if (!entries.length) return 'No check-in';
  return entries.sort((a, b) => b[1] - a[1])[0][0].replace('_', ' ');
}

function metricCard(metric: Metric, index: number) {
  return (
    <article className="db-card db-lift db-reveal db-metric" key={metric.label} style={{ animationDelay: `${index * 45}ms` }}>
      <div className="db-metric-top">
        <Icon name={metric.icon} color={metric.color} background={metric.background} />
        <span className="db-metric-line" style={{ background: metric.color }} />
      </div>
      <p className="db-label">{metric.label}</p>
      <p className="db-value" style={{ color: metric.color }}>{metric.value}</p>
      <p className="db-helper">{metric.helper}</p>
    </article>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="db-section-heading">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function StressMeter({ average, records }: { average: number; records: number }) {
  const level = Math.min(5, Math.max(0, average));
  const label = level === 0 ? 'No records' : level < 2 ? 'Low' : level < 3 ? 'Mild' : level < 4 ? 'Medium' : level < 5 ? 'High' : 'Very high';

  return (
    <div className="db-card db-chart-card">
      <SectionHeading title="Stress signal" subtitle={`${records} recorded check-in${records === 1 ? '' : 's'} reflected in the current average.`} />
      <div className="db-stress-reading">
        <div>
          <span className="db-label">Average level</span>
          <strong>{level ? level.toFixed(1) : '0.0'} / 5</strong>
        </div>
        <span className="db-status db-status-amber">{label}</span>
      </div>
      <div className="db-level-track">
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className="db-level-step"
            style={{
              background: level >= step ? (step < 3 ? colors.teal : step < 5 ? colors.amber : colors.red) : '#e7eef5'
            }}
          />
        ))}
      </div>
      <div className="db-level-labels">
        <span>Low</span>
        <span>Medium</span>
        <span>Very high</span>
      </div>
    </div>
  );
}

function MoodSummary({ moodCounts, personal }: { moodCounts: Record<string, number>; personal: boolean }) {
  const entries = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const palette: Record<string, string> = {
    calm: colors.teal,
    motivated: colors.blue,
    tired: colors.amber,
    stressed: colors.red,
    overwhelmed: colors.violet
  };

  return (
    <div className="db-card db-chart-card">
      <SectionHeading
        title={personal ? 'My mood summary' : 'Campus mood summary'}
        subtitle={personal ? 'Your recorded MoodCampus check-ins.' : 'Aggregated mood records for support awareness.'}
      />
      {!entries.length ? (
        <div className="db-empty">No mood records yet.</div>
      ) : (
        <div className="db-mood-layout">
          <div
            className="db-donut"
            style={{
              background: `conic-gradient(${entries
                .map(([mood, count], index) => {
                  const before = entries.slice(0, index).reduce((sum, [, value]) => sum + value, 0);
                  const start = (before / total) * 100;
                  const end = ((before + count) / total) * 100;
                  return `${palette[mood] ?? colors.muted} ${start}% ${end}%`;
                })
                .join(',')})`
            }}
          >
            <span><strong>{total}</strong> check-ins</span>
          </div>
          <div className="db-mood-list">
            {entries.map(([mood, count]) => (
              <div key={mood}>
                <div className="db-row-between">
                  <span className="db-mood-name"><i style={{ background: palette[mood] ?? colors.muted }} />{mood.replace('_', ' ')}</span>
                  <strong>{count}</strong>
                </div>
                <div className="db-progress">
                  <span style={{ width: `${Math.max(5, (count / total) * 100)}%`, background: palette[mood] ?? colors.muted }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecentActivity({ stats, personal }: { stats: DashboardStats; personal: boolean }) {
  return (
    <div className="db-card db-chart-card">
      <SectionHeading title="Recent activity" subtitle={personal ? 'Your latest CampusCare updates.' : 'Latest activity across visible CampusCare modules.'} />
      {stats.recentActivity?.length ? (
        <div className="db-activity-list">
          {stats.recentActivity.slice(0, 6).map((activity, index) => {
            const icon: IconName = activity.type.includes('help')
              ? 'help'
              : activity.type.includes('mood')
                ? 'mood'
                : activity.type.includes('stress')
                  ? 'stress'
                  : activity.type.includes('skill')
                    ? 'skills'
                    : 'lostFound';
            return (
              <div className="db-activity-item" key={`${activity.type}-${activity.createdAt}-${index}`}>
                <Icon name={icon} size={34} />
                <div>
                  <strong>{activity.title}</strong>
                  <span>{activity.type.replace(/_/g, ' ')} · {formatDate(activity.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="db-empty">No recent activity yet.</div>
      )}
    </div>
  );
}

function Hero({
  role,
  name,
  stats
}: {
  role: 'student' | 'mentor' | 'admin';
  name?: string;
  stats: DashboardStats;
}) {
  const firstName = name?.split(' ')[0] || 'Student';
  const content = role === 'student'
    ? {
        eyebrow: 'Student workspace',
        title: `Welcome back, ${firstName}`,
        description: `You have ${stats.totalHelpRequests} help request${stats.totalHelpRequests === 1 ? '' : 's'}, ${stats.totalStudentSkills ?? 0} shared skill${(stats.totalStudentSkills ?? 0) === 1 ? '' : 's'}, and a ${dominantMood(stats.moodCounts)} mood snapshot.`,
        primary: { label: 'Ask anonymously', to: '/silent-help' },
        secondary: { label: 'Log mood', to: '/mood-campus' }
      }
    : role === 'mentor'
      ? {
          eyebrow: 'Mentor guidance console',
          title: `${stats.openHelpRequests} request${stats.openHelpRequests === 1 ? '' : 's'} waiting for guidance`,
          description: 'Review support needs with care. Replies and status updates help students find a clear next step.',
          primary: { label: 'Open queue', to: '/silent-help' },
          secondary: { label: 'View wellbeing', to: '/stress-tracker' }
        }
      : {
          eyebrow: 'Admin platform overview',
          title: 'Platform health, at a glance',
          description: `${stats.totalUsers} users and ${stats.totalHelpRequests + stats.totalStressRecords + (stats.totalMoodRecords ?? 0) + (stats.totalLostFoundItems ?? 0)} recorded module activities are visible in the current overview.`,
          primary: { label: 'Review requests', to: '/silent-help' },
          secondary: { label: 'Manage reports', to: '/lost-found' }
        };

  return (
    <section className="db-hero db-reveal">
      <div className="db-hero-content">
        <span className="db-hero-eyebrow"><i />{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <div className="db-hero-actions">
          <Link className="db-btn db-btn-primary" to={content.primary.to}>{content.primary.label}<Icon name="arrow" size={24} color="#ffffff" background="transparent" /></Link>
          <Link className="db-btn db-btn-glass" to={content.secondary.to}>{content.secondary.label}</Link>
        </div>
      </div>
      <div className="db-hero-signal">
        <div className="db-signal-ring"><Icon name={role === 'admin' ? 'activity' : role === 'mentor' ? 'reply' : 'profile'} size={54} color={colors.cyan} background="rgba(103,227,214,.1)" /></div>
        <span className="db-live"><i />{role === 'admin' ? 'Modules operational' : 'Workspace active'}</span>
      </div>
    </section>
  );
}

function StudentDashboard({ stats }: { stats: DashboardStats }) {
  const mood = dominantMood(stats.moodCounts);
  const metrics: Metric[] = [
    { label: 'My Help Requests', value: formatMetric(stats.totalHelpRequests), helper: `${stats.openHelpRequests} currently open`, icon: 'help', color: colors.teal, background: 'rgba(13,158,138,.09)' },
    { label: 'My Skills', value: formatMetric(stats.totalStudentSkills ?? 0), helper: 'Skills on your profile', icon: 'skills', color: colors.blue, background: 'rgba(37,99,235,.08)' },
    { label: 'Current Stress', value: `${formatMetric(stats.averageStressLevel)} / 5`, helper: `${stats.totalStressRecords} recorded check-ins`, icon: 'stress', color: colors.amber, background: 'rgba(217,119,6,.09)' },
    { label: 'This Week Mood', value: mood, helper: `${stats.totalMoodRecords ?? Object.values(stats.moodCounts).reduce((sum, count) => sum + count, 0)} mood records`, icon: 'mood', color: colors.violet, background: 'rgba(124,58,237,.08)' },
    { label: 'Lost / Found', value: formatMetric(stats.totalLostFoundItems ?? 0), helper: `${stats.lostFoundResolved} resolved reports`, icon: 'lostFound', color: colors.green, background: 'rgba(5,150,105,.08)' }
  ];
  const actions = [
    { label: 'Ask anonymously', detail: 'Start a safe support request.', to: '/silent-help', icon: 'help' as IconName },
    { label: "Log this week's mood", detail: 'Add a respectful weekly check-in.', to: '/mood-campus', icon: 'mood' as IconName },
    { label: 'Track stress', detail: 'Record pressure from 1 to 5.', to: '/stress-tracker', icon: 'stress' as IconName },
    { label: 'Report item', detail: 'Create a lost or found report.', to: '/lost-found', icon: 'lostFound' as IconName }
  ];

  return (
    <>
      <div className="db-metric-grid db-student-metrics">{metrics.map(metricCard)}</div>
      <section className="db-space">
        <SectionHeading title="Quick actions" subtitle="Small actions that keep your CampusCare workspace useful." />
        <div className="db-action-grid">
          {actions.map((action, index) => (
            <Link className="db-action-card db-lift db-reveal" key={action.to} style={{ animationDelay: `${index * 55}ms` }} to={action.to}>
              <Icon name={action.icon} />
              <div><strong>{action.label}</strong><span>{action.detail}</span></div>
              <Icon name="arrow" size={28} color={colors.navy} background="transparent" />
            </Link>
          ))}
        </div>
      </section>
      <div className="db-content-grid">
        <StressMeter average={stats.averageStressLevel} records={stats.totalStressRecords} />
        <MoodSummary moodCounts={stats.moodCounts} personal />
      </div>
      <div className="db-content-grid db-space">
        <div className="db-card db-insight-card">
          <div><Icon name="help" size={46} /></div>
          <div>
            <span className="db-label">Wellbeing insight</span>
            <h2>Small check-ins can make a difficult week easier to understand.</h2>
            <p>Silent Help stays available when a question feels difficult to ask publicly. Share only what feels comfortable.</p>
            <Link to="/silent-help">Open Silent Help <span>→</span></Link>
          </div>
        </div>
        <RecentActivity stats={stats} personal />
      </div>
    </>
  );
}

function MentorDashboard({ stats }: { stats: DashboardStats }) {
  const supported = Math.max(0, stats.totalHelpRequests - stats.openHelpRequests);
  const metrics: Metric[] = [
    { label: 'Open Requests', value: formatMetric(stats.openHelpRequests), helper: 'Currently needing attention', icon: 'help', color: colors.red, background: 'rgba(220,38,38,.07)' },
    { label: 'Support Progress', value: formatMetric(supported), helper: 'Requests no longer open', icon: 'reply', color: colors.teal, background: 'rgba(13,158,138,.09)' },
    { label: 'Skills Tracked', value: formatMetric(stats.totalStudentSkills ?? stats.totalSkills), helper: `${stats.totalSkills} skills in the catalog`, icon: 'skills', color: colors.blue, background: 'rgba(37,99,235,.08)' },
    { label: 'Average Stress', value: `${formatMetric(stats.averageStressLevel)} / 5`, helper: `${stats.totalStressRecords} support signals`, icon: 'stress', color: colors.amber, background: 'rgba(217,119,6,.09)' }
  ];
  const urgency = [
    { label: 'High attention', count: Math.min(stats.openHelpRequests, Math.ceil(stats.openHelpRequests * 0.3)), color: colors.red },
    { label: 'Standard queue', count: Math.max(0, stats.openHelpRequests - Math.ceil(stats.openHelpRequests * 0.3)), color: colors.amber },
    { label: 'Progressed', count: supported, color: colors.teal }
  ];

  return (
    <>
      <div className="db-metric-grid db-mentor-metrics">{metrics.map(metricCard)}</div>
      <div className="db-content-grid db-space">
        <div className="db-card db-chart-card">
          <SectionHeading title="Support queue" subtitle="A workload view calculated from current help-request status totals." />
          <div className="db-queue-list">
            {urgency.map((item) => (
              <div className="db-queue-row" key={item.label}>
                <span><i style={{ background: item.color }} />{item.label}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
          <Link className="db-inline-link" to="/silent-help">Review help requests <span>→</span></Link>
        </div>
        <StressMeter average={stats.averageStressLevel} records={stats.totalStressRecords} />
      </div>
      <div className="db-content-grid db-space">
        <MoodSummary moodCounts={stats.moodCounts} personal={false} />
        <div className="db-card db-chart-card">
          <SectionHeading title="SkillMap overview" subtitle="Skills available across the catalog and student profiles." />
          <div className="db-skill-overview">
            <Icon name="skills" size={58} color={colors.blue} background="rgba(37,99,235,.08)" />
            <div><strong>{stats.totalSkills}</strong><span>catalog skills</span></div>
            <div><strong>{stats.totalStudentSkills ?? 0}</strong><span>profile connections</span></div>
          </div>
          <Link className="db-inline-link" to="/skill-map">Open SkillMap <span>→</span></Link>
        </div>
      </div>
      <div className="db-space"><RecentActivity stats={stats} personal={false} /></div>
    </>
  );
}

function AdminDashboard({ stats }: { stats: DashboardStats }) {
  const moodTotal = stats.totalMoodRecords ?? Object.values(stats.moodCounts).reduce((sum, count) => sum + count, 0);
  const metrics: Metric[] = [
    { label: 'Total Users', value: formatMetric(stats.totalUsers), helper: 'Registered platform accounts', icon: 'users', color: colors.navy, background: 'rgba(11,29,53,.07)' },
    { label: 'Help Requests', value: formatMetric(stats.totalHelpRequests), helper: `${stats.openHelpRequests} currently open`, icon: 'help', color: colors.teal, background: 'rgba(13,158,138,.09)' },
    { label: 'Skills Added', value: formatMetric(stats.totalSkills), helper: `${stats.totalStudentSkills ?? 0} profile connections`, icon: 'skills', color: colors.blue, background: 'rgba(37,99,235,.08)' },
    { label: 'Stress Reports', value: formatMetric(stats.totalStressRecords), helper: `${formatMetric(stats.averageStressLevel)} average level`, icon: 'stress', color: colors.amber, background: 'rgba(217,119,6,.09)' },
    { label: 'Mood Reports', value: formatMetric(moodTotal), helper: `${Object.keys(stats.moodCounts).length} mood categories`, icon: 'mood', color: colors.violet, background: 'rgba(124,58,237,.08)' },
    { label: 'Lost / Found', value: formatMetric(stats.totalLostFoundItems ?? 0), helper: `${stats.lostFoundOpen} currently open`, icon: 'lostFound', color: colors.green, background: 'rgba(5,150,105,.08)' }
  ];
  const modules = [
    { label: 'Help requests', value: stats.totalHelpRequests, color: colors.teal },
    { label: 'Skill profiles', value: stats.totalStudentSkills ?? 0, color: colors.blue },
    { label: 'Stress records', value: stats.totalStressRecords, color: colors.amber },
    { label: 'Mood records', value: moodTotal, color: colors.violet },
    { label: 'Lost / found', value: stats.totalLostFoundItems ?? 0, color: colors.green }
  ];
  const maxModule = Math.max(1, ...modules.map((module) => module.value));

  return (
    <>
      <div className="db-metric-grid db-admin-metrics">{metrics.map(metricCard)}</div>
      <div className="db-admin-grid db-space">
        <div className="db-card db-chart-card db-module-chart">
          <SectionHeading title="Module activity" subtitle="Current record totals across CampusCare modules." />
          <div className="db-bars">
            {modules.map((module) => (
              <div key={module.label}>
                <div className="db-row-between"><span>{module.label}</span><strong>{module.value}</strong></div>
                <div className="db-progress"><span style={{ width: `${Math.max(4, (module.value / maxModule) * 100)}%`, background: module.color }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="db-card db-chart-card">
          <SectionHeading title="Operational status" subtitle="Open and resolved work requiring administrative awareness." />
          <div className="db-operation-grid">
            <div><span className="db-status db-status-red">Open support</span><strong>{stats.openHelpRequests}</strong><small>help requests</small></div>
            <div><span className="db-status db-status-amber">Open reports</span><strong>{stats.lostFoundOpen}</strong><small>lost / found</small></div>
            <div><span className="db-status db-status-green">Resolved</span><strong>{stats.lostFoundResolved}</strong><small>campus reports</small></div>
            <div><span className="db-status db-status-blue">System</span><strong>OK</strong><small>modules available</small></div>
          </div>
        </div>
      </div>
      <div className="db-content-grid db-space">
        <MoodSummary moodCounts={stats.moodCounts} personal={false} />
        <StressMeter average={stats.averageStressLevel} records={stats.totalStressRecords} />
      </div>
      <div className="db-space"><RecentActivity stats={stats} personal={false} /></div>
    </>
  );
}

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

  const role = useMemo<'student' | 'mentor' | 'admin'>(() => {
    if (user?.role === 'mentor' || user?.role === 'admin') return user.role;
    return 'student';
  }, [user?.role]);

  return (
    <>
      <style>{`
        @keyframes dbReveal { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dbProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes dbPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(103,227,214,.35); } 50% { box-shadow: 0 0 0 5px rgba(103,227,214,0); } }
        .db-page { margin: -2rem; min-height: 100vh; padding: 2rem; color: #0b1d35; background: radial-gradient(circle at 92% 2%,rgba(13,158,138,.12),transparent 25rem),radial-gradient(circle at 0 45%,rgba(37,99,235,.07),transparent 28rem),linear-gradient(180deg,#f8fbff,#eef4f8); font-family: "DM Sans",sans-serif; }
        .db-page * { box-sizing: border-box; }
        .db-reveal { animation: dbReveal .45s ease both; }
        .db-space { margin-top: 1.25rem; }
        .db-card { border: 1px solid #dfeaf3; border-radius: 18px; background: rgba(255,255,255,.9); box-shadow: 0 12px 32px rgba(15,23,42,.055); backdrop-filter: blur(12px); }
        .db-lift { transition: transform .2s ease,box-shadow .2s ease,border-color .2s ease; }
        .db-lift:hover { transform: translateY(-3px); border-color: rgba(13,158,138,.3); box-shadow: 0 18px 42px rgba(15,23,42,.1); }
        .db-icon { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .db-hero { position: relative; overflow: hidden; display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 2rem; min-height: 230px; padding: 2rem; border: 1px solid rgba(255,255,255,.09); border-radius: 24px; color: white; background: radial-gradient(circle at 86% 5%,rgba(103,227,214,.25),transparent 30%),linear-gradient(135deg,#071527,#0b1d35 55%,#0f3b52); box-shadow: 0 20px 46px rgba(11,29,53,.18); }
        .db-hero::after { content:""; position:absolute; right:-60px; bottom:-90px; width:260px; height:260px; border-radius:50%; border:1px solid rgba(103,227,214,.14); }
        .db-hero-content { position:relative; z-index:1; max-width:760px; }
        .db-hero-eyebrow { display:inline-flex; align-items:center; gap:7px; border:1px solid rgba(103,227,214,.22); border-radius:999px; padding:.35rem .75rem; background:rgba(103,227,214,.08); color:#bdf8ef; font-size:.68rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .db-hero-eyebrow i,.db-live i { width:7px; height:7px; border-radius:50%; background:#67e3d6; animation:dbPulse 2s infinite; }
        .db-hero h1 { margin:.9rem 0 .55rem; font-family:"Sora",sans-serif; font-size:clamp(1.65rem,3vw,2.45rem); line-height:1.15; letter-spacing:-.025em; }
        .db-hero p { max-width:670px; margin:0; color:rgba(255,255,255,.65); font-size:.9rem; line-height:1.7; }
        .db-hero-actions { display:flex; flex-wrap:wrap; gap:.65rem; margin-top:1.2rem; }
        .db-btn { display:inline-flex; min-height:42px; align-items:center; justify-content:center; gap:7px; border-radius:11px; padding:.55rem 1rem; color:white; font-size:.8rem; font-weight:750; text-decoration:none; transition:.18s ease; }
        .db-btn:hover { transform:translateY(-2px); }
        .db-btn-primary { background:#0d9e8a; box-shadow:0 8px 20px rgba(13,158,138,.22); }
        .db-btn-glass { border:1px solid rgba(255,255,255,.18); background:rgba(255,255,255,.08); }
        .db-hero-signal { position:relative; z-index:1; display:grid; justify-items:center; gap:.75rem; min-width:150px; }
        .db-signal-ring { display:flex; align-items:center; justify-content:center; width:110px; height:110px; border:1px solid rgba(103,227,214,.2); border-radius:50%; background:rgba(255,255,255,.05); box-shadow:inset 0 0 0 12px rgba(255,255,255,.025); }
        .db-live { display:inline-flex; align-items:center; gap:7px; border-radius:999px; padding:.35rem .7rem; background:rgba(255,255,255,.07); color:rgba(255,255,255,.72); font-size:.68rem; font-weight:700; }
        .db-metric-grid { display:grid; gap:1rem; margin-top:1.25rem; }
        .db-student-metrics { grid-template-columns:repeat(5,minmax(0,1fr)); }
        .db-mentor-metrics { grid-template-columns:repeat(4,minmax(0,1fr)); }
        .db-admin-metrics { grid-template-columns:repeat(6,minmax(0,1fr)); }
        .db-metric { min-width:0; padding:1rem; }
        .db-metric-top { display:flex; align-items:center; justify-content:space-between; gap:.75rem; }
        .db-metric-line { width:34px; height:3px; border-radius:999px; opacity:.75; }
        .db-label { display:block; margin-top:.8rem; color:#64748b; font-size:.65rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }
        .db-value { margin:.35rem 0 .25rem; overflow:hidden; font-family:"Sora",sans-serif; font-size:1.55rem; font-weight:750; line-height:1.1; text-overflow:ellipsis; text-transform:capitalize; white-space:nowrap; }
        .db-helper { margin:0; color:#94a3b8; font-size:.7rem; line-height:1.45; }
        .db-section-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
        .db-section-heading h2 { margin:0; font-family:"Sora",sans-serif; font-size:1rem; font-weight:700; color:#0b1d35; }
        .db-section-heading p { margin:.25rem 0 0; color:#64748b; font-size:.76rem; line-height:1.5; }
        .db-action-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:1rem; }
        .db-action-card { display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:.8rem; min-width:0; padding:1rem; color:#0b1d35; text-decoration:none; }
        .db-action-card strong,.db-action-card span { display:block; }
        .db-action-card strong { font-size:.82rem; }
        .db-action-card span { margin-top:.2rem; color:#64748b; font-size:.69rem; line-height:1.4; }
        .db-content-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; }
        .db-admin-grid { display:grid; grid-template-columns:1.2fr .8fr; gap:1rem; }
        .db-chart-card { min-width:0; padding:1.25rem; }
        .db-stress-reading { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1rem; border:1px solid #e8eff5; border-radius:13px; background:#f8fbfd; }
        .db-stress-reading .db-label { margin:0 0 .2rem; }
        .db-stress-reading strong { font-family:"Sora",sans-serif; font-size:1.6rem; }
        .db-status { display:inline-flex; align-items:center; border-radius:999px; padding:.3rem .65rem; font-size:.65rem; font-weight:800; }
        .db-status-amber { background:#fff7ed; color:#b45309; }
        .db-status-red { background:#fef2f2; color:#b91c1c; }
        .db-status-green { background:#ecfdf5; color:#047857; }
        .db-status-blue { background:#eff6ff; color:#1d4ed8; }
        .db-level-track { display:grid; grid-template-columns:repeat(5,1fr); gap:.35rem; margin-top:1rem; }
        .db-level-step { height:10px; border-radius:999px; transition:background .3s ease; }
        .db-level-labels { display:flex; justify-content:space-between; margin-top:.45rem; color:#94a3b8; font-size:.62rem; }
        .db-mood-layout { display:grid; grid-template-columns:150px minmax(0,1fr); align-items:center; gap:1.5rem; }
        .db-donut { position:relative; display:grid; place-items:center; width:140px; height:140px; border-radius:50%; }
        .db-donut::after { content:""; position:absolute; inset:18px; border-radius:50%; background:white; }
        .db-donut span { position:relative; z-index:1; display:grid; color:#64748b; font-size:.64rem; text-align:center; }
        .db-donut strong { color:#0b1d35; font-family:"Sora",sans-serif; font-size:1.5rem; }
        .db-mood-list { display:grid; gap:.65rem; }
        .db-row-between { display:flex; align-items:center; justify-content:space-between; gap:1rem; color:#64748b; font-size:.72rem; }
        .db-row-between strong { color:#0b1d35; }
        .db-mood-name { display:flex; align-items:center; gap:7px; text-transform:capitalize; }
        .db-mood-name i { width:7px; height:7px; border-radius:50%; }
        .db-progress { height:6px; margin-top:.3rem; overflow:hidden; border-radius:999px; background:#e8eff5; }
        .db-progress span { display:block; height:100%; border-radius:999px; transform-origin:left; animation:dbProgress .7s ease both; }
        .db-empty { display:grid; place-items:center; min-height:150px; border:1px dashed #d7e3ed; border-radius:13px; color:#94a3b8; font-size:.78rem; background:#f8fbfd; }
        .db-insight-card { display:grid; grid-template-columns:auto minmax(0,1fr); align-items:start; gap:1rem; padding:1.25rem; }
        .db-insight-card .db-label { margin:0; }
        .db-insight-card h2 { margin:.35rem 0; font-family:"Sora",sans-serif; font-size:1rem; line-height:1.45; }
        .db-insight-card p { margin:0; color:#64748b; font-size:.76rem; line-height:1.6; }
        .db-insight-card a,.db-inline-link { display:inline-flex; gap:6px; margin-top:.8rem; color:#0d9e8a; font-size:.75rem; font-weight:800; text-decoration:none; }
        .db-activity-list { display:grid; }
        .db-activity-item { display:flex; align-items:flex-start; gap:.75rem; padding:.7rem 0; border-bottom:1px solid #edf2f7; }
        .db-activity-item:last-child { border-bottom:0; }
        .db-activity-item strong,.db-activity-item span { display:block; }
        .db-activity-item strong { color:#0b1d35; font-size:.78rem; }
        .db-activity-item span { margin-top:.2rem; color:#94a3b8; font-size:.67rem; text-transform:capitalize; }
        .db-queue-list { display:grid; gap:.5rem; }
        .db-queue-row { display:flex; align-items:center; justify-content:space-between; border:1px solid #e8eff5; border-radius:11px; padding:.7rem .8rem; background:#f8fbfd; font-size:.76rem; }
        .db-queue-row span { display:flex; align-items:center; gap:8px; color:#64748b; }
        .db-queue-row i { width:8px; height:8px; border-radius:50%; }
        .db-queue-row strong { font-family:"Sora",sans-serif; }
        .db-skill-overview { display:grid; grid-template-columns:auto 1fr 1fr; align-items:center; gap:1rem; padding:1rem; border:1px solid #e8eff5; border-radius:13px; background:#f8fbfd; }
        .db-skill-overview div { display:grid; }
        .db-skill-overview strong { font-family:"Sora",sans-serif; font-size:1.4rem; }
        .db-skill-overview span { color:#64748b; font-size:.66rem; }
        .db-bars { display:grid; gap:.9rem; }
        .db-operation-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.7rem; }
        .db-operation-grid > div { display:grid; align-content:start; min-height:115px; border:1px solid #e8eff5; border-radius:13px; padding:.8rem; background:#f8fbfd; }
        .db-operation-grid strong { margin-top:.7rem; font-family:"Sora",sans-serif; font-size:1.45rem; }
        .db-operation-grid small { margin-top:.15rem; color:#94a3b8; font-size:.65rem; }
        @media(max-width:1180px) { .db-student-metrics,.db-admin-metrics { grid-template-columns:repeat(3,minmax(0,1fr)); } }
        @media(max-width:920px) { .db-mentor-metrics { grid-template-columns:repeat(2,minmax(0,1fr)); } .db-action-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .db-admin-grid { grid-template-columns:1fr; } }
        @media(max-width:720px) { .db-page { margin:-1rem; padding:1rem; } .db-hero { grid-template-columns:1fr; padding:1.35rem; } .db-hero-signal { display:none; } .db-student-metrics,.db-admin-metrics { grid-template-columns:repeat(2,minmax(0,1fr)); } .db-content-grid { grid-template-columns:1fr; } .db-mood-layout { grid-template-columns:1fr; justify-items:center; width:100%; } .db-mood-list { width:100%; } }
        @media(max-width:460px) { .db-student-metrics,.db-mentor-metrics,.db-admin-metrics,.db-action-grid { grid-template-columns:1fr; } .db-operation-grid { grid-template-columns:1fr; } .db-skill-overview { grid-template-columns:auto 1fr; } .db-skill-overview div:last-child { grid-column:2; } }
      `}</style>

      <div className="db-page">
        {isLoading ? <div className="db-card db-empty">Loading your CampusCare dashboard...</div> : null}
        {error ? <div className="alert-error">{error}</div> : null}
        {stats ? (
          <>
            <Hero role={role} name={user?.fullName} stats={stats} />
            {role === 'student' ? <StudentDashboard stats={stats} /> : null}
            {role === 'mentor' ? <MentorDashboard stats={stats} /> : null}
            {role === 'admin' ? <AdminDashboard stats={stats} /> : null}
          </>
        ) : null}
      </div>
    </>
  );
}
