import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState as UIEmptyState } from '../components/ui/EmptyState';
import { PageLoadingState } from '../components/ui/LoadingStates';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { dashboardService } from '../services/dashboardService';
import { profileService } from '../services/profileService';
import { skillService } from '../services/skillService';
import type { DashboardStats } from '../types/dashboard';
import type { UserProfile } from '../types/profile';
import type { StudentSkill } from '../types/skill';
import { formatDate } from '../utils/formatDate';

type Role = 'student' | 'mentor' | 'admin';
type IconName = 'profile' | 'email' | 'role' | 'calendar' | 'complete' | 'help' | 'skill' | 'stress' | 'mood' | 'lostFound' | 'activity' | 'settings' | 'guidance' | 'shield' | 'arrow';
type ProfileField = { label: string; value: string | null | undefined; icon: IconName };
type Action = { label: string; description: string; to: string; icon: IconName; color: string };
type IdentityCard = { label: string; value: string; helper: string; icon: IconName; color: string };

const colors = {
  navy: '#0b1d35',
  teal: '#0d9e8a',
  cyan: '#67e3d6',
  blue: '#2563eb',
  amber: '#c88719',
  green: '#059669',
  violet: '#7650b5',
  muted: '#64748b'
};

const iconPaths: Record<IconName, ReactNode> = {
  profile: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21c.5-4.5 2.8-7 7-7s6.5 2.5 7 7" /></>,
  email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  role: <><path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  complete: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  help: <><path d="M4 5.5h16v11H9l-5 4v-15Z" /><path d="M8 10h8M8 13h5" /></>,
  skill: <><circle cx="6" cy="12" r="2.3" /><circle cx="18" cy="6" r="2.3" /><circle cx="18" cy="18" r="2.3" /><path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8" /></>,
  stress: <><path d="M3 13h4l2-6 3.2 11 2.5-8 1.8 3H21" /><path d="M4 21h16" /></>,
  mood: <><path d="M4 8c2.5-3.5 5.2-4.5 8-3 2.8-1.5 5.5-.5 8 3" /><path d="M4 16c2.5 3.5 5.2 4.5 8 3 2.8 1.5 5.5.5 8-3M7 12h10" /></>,
  lostFound: <><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" /><circle cx="12" cy="10" r="2.4" /></>,
  activity: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="4" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  guidance: <><path d="M9 18h6M10 22h4" /><path d="M8.3 15.2A7 7 0 1 1 15.7 15c-.8.6-1.2 1.3-1.2 2h-5c0-.8-.4-1.3-1.2-1.8Z" /></>,
  shield: <><path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z" /><path d="M9 12h6" /></>,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />
};

function Icon({ name, size = 40, color = colors.teal, background = 'rgba(13,158,138,.1)' }: { name: IconName; size?: number; color?: string; background?: string }) {
  return <span className="pf-icon" style={{ width: size, height: size, color, background }}><svg aria-hidden="true" width={size * .52} height={size * .52} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg></span>;
}

function initials(name?: string) {
  return name?.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
}

function displayLabel(value?: string | null) {
  return value ? value.replace(/_/g, ' ') : 'Not added yet';
}

function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return <div className="pf-heading">{eyebrow ? <span>{eyebrow}</span> : null}<h2>{title}</h2><p>{description}</p></div>;
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: { label: string; to: string } }) {
  return <UIEmptyState icon="profile" title={title} description={text} actionLabel={action?.label} actionTo={action?.to} variant="soft" />;
}

function roleFields(role: Role, profile: UserProfile | null): ProfileField[] {
  if (role === 'mentor') return [
    { label: 'Expertise areas', value: profile?.expertiseAreas, icon: 'skill' },
    { label: 'Availability', value: profile?.availability, icon: 'calendar' },
    { label: 'Support topics', value: profile?.canHelpWith, icon: 'help' },
    { label: 'Preferred support', value: profile?.preferredSupportType, icon: 'guidance' },
    { label: 'Mentoring reason', value: profile?.mentoringReason, icon: 'profile' }
  ];
  if (role === 'admin') return [
    { label: 'Responsibility area', value: profile?.adminPosition, icon: 'shield' },
    { label: 'Department / unit', value: profile?.adminDepartmentUnit, icon: 'activity' },
    { label: 'Access reason', value: profile?.adminAccessReason, icon: 'role' }
  ];
  return [
    { label: 'Study year', value: profile?.studyYear, icon: 'calendar' },
    { label: 'Department / program', value: profile?.department, icon: 'profile' },
    { label: 'Main support need', value: profile?.supportInterest, icon: 'help' },
    { label: 'Reason for joining', value: profile?.reasonForJoining, icon: 'guidance' }
  ];
}

function roleActions(role: Role): Action[] {
  if (role === 'mentor') return [
    { label: 'Review requests', description: 'Support students needing guidance.', to: '/silent-help', icon: 'help', color: colors.teal },
    { label: 'View SkillMap', description: 'Discover student strengths.', to: '/skill-map', icon: 'skill', color: colors.blue },
    { label: 'Check stress trends', description: 'Review academic pressure.', to: '/stress-tracker', icon: 'stress', color: colors.amber },
    { label: 'View mood patterns', description: 'Understand wellbeing signals.', to: '/mood-campus', icon: 'mood', color: colors.violet },
    { label: 'Update profile', description: 'Refresh mentoring details.', to: '/onboarding', icon: 'settings', color: colors.muted }
  ];
  if (role === 'admin') return [
    { label: 'View dashboard', description: 'Open the platform overview.', to: '/dashboard', icon: 'activity', color: colors.navy },
    { label: 'Review help requests', description: 'Monitor support activity.', to: '/silent-help', icon: 'help', color: colors.teal },
    { label: 'Check item reports', description: 'Review Lost & Found cases.', to: '/lost-found', icon: 'lostFound', color: colors.green },
    { label: 'View platform trends', description: 'Review wellbeing signals.', to: '/stress-tracker', icon: 'stress', color: colors.amber },
    { label: 'Update profile', description: 'Maintain admin context.', to: '/onboarding', icon: 'settings', color: colors.muted }
  ];
  return [
    { label: 'Ask anonymously', description: 'Start a safe support request.', to: '/silent-help', icon: 'help', color: colors.teal },
    { label: 'Add a skill', description: 'Grow your academic SkillMap.', to: '/skill-map', icon: 'skill', color: colors.blue },
    { label: 'Track stress', description: 'Record exam pressure.', to: '/stress-tracker', icon: 'stress', color: colors.amber },
    { label: 'Log mood', description: 'Reflect on your week.', to: '/mood-campus', icon: 'mood', color: colors.violet },
    { label: 'Report item', description: 'Create a campus item report.', to: '/lost-found', icon: 'lostFound', color: colors.green },
    { label: 'Update profile', description: 'Complete onboarding details.', to: '/onboarding', icon: 'settings', color: colors.muted }
  ];
}

function Hero({ role, name, email }: { role: Role; name?: string; email?: string }) {
  const content = role === 'student'
    ? { eyebrow: 'Student profile', title: 'Student workspace', description: 'Student identity for academic support, shared skills, wellbeing reflection, and practical campus help.', statement: 'Your profile grows with the support you ask for, the skills you share, and the progress you track.' }
    : role === 'mentor'
      ? { eyebrow: 'Mentor profile', title: 'Mentor workspace', description: 'Guidance identity for supporting students and following academic wellbeing trends.', statement: 'This profile represents how you guide students with clarity, patience, and practical next steps.' }
      : { eyebrow: 'Authorized admin profile', title: 'Admin console identity', description: 'Operational identity for monitoring CampusCare modules, activity, and support trends.', statement: 'Responsible access turns platform signals into safer, more useful student support.' };
  return <section className="pf-hero pf-reveal"><div className="pf-avatar">{initials(name)}</div><div className="pf-hero-copy"><span className="pf-eyebrow">{content.eyebrow}</span><div className="pf-name-row"><h1>{name || 'CampusCare user'}</h1><span className={`pf-role pf-role-${role}`}>{role}</span><span className="pf-active"><i />{role === 'admin' ? 'Authorized' : 'Active'}</span></div><p className="pf-email">{email}</p><h2>{content.title}</h2><p>{content.description}</p><blockquote>{content.statement}</blockquote></div><div className="pf-hero-mark"><Icon name={role === 'student' ? 'profile' : role === 'mentor' ? 'guidance' : 'shield'} size={58} color={colors.cyan} background="rgba(103,227,214,.1)" /><span>CampusCare identity</span></div></section>;
}

function Completeness({ fields, skills, profile, role }: { fields: ProfileField[]; skills: StudentSkill[]; profile: UserProfile | null; role: Role }) {
  const checks = [...fields.map((field) => ({ label: field.label, complete: Boolean(field.value) })), ...(role === 'student' ? [{ label: 'Skills shared', complete: skills.length > 0 }] : [])];
  const complete = checks.filter((item) => item.complete).length;
  const percent = Math.round((complete / Math.max(1, checks.length)) * 100);
  return <section className="pf-card pf-completeness"><div className="pf-complete-top"><SectionHeading eyebrow="Profile readiness" title="Profile completeness" description="Complete role details to make your CampusCare workspace more relevant." /><div className="pf-complete-ring" style={{ background: `conic-gradient(${percent >= 80 ? colors.green : percent >= 50 ? colors.teal : colors.amber} ${percent * 3.6}deg,#e8eff5 0)` }}><span><strong>{percent}%</strong>complete</span></div></div>{complete ? <><div className="pf-progress"><span style={{ width: `${percent}%`, background: percent >= 80 ? colors.green : percent >= 50 ? colors.teal : colors.amber }} /></div><div className="pf-field-pills">{checks.map((item) => <span className={item.complete ? 'is-complete' : ''} key={item.label}><i />{item.label}</span>)}</div><Link className="pf-primary-link" to="/onboarding">{profile?.onboardingCompleted ? 'Update onboarding' : 'Complete onboarding'}<Icon name="arrow" size={22} color="#fff" background="transparent" /></Link></> : <UIEmptyState compact icon="profile" title="Profile details not completed" description="Complete onboarding to personalize your CampusCare workspace." actionLabel="Update onboarding" actionTo="/onboarding" />}</section>;
}

function AccountCard({ role, name, email, createdAt, updatedAt }: { role: Role; name?: string; email?: string; createdAt?: string; updatedAt?: string }) {
  const rows = [
    { label: 'Full name', value: name, icon: 'profile' as IconName },
    { label: 'Email', value: email, icon: 'email' as IconName },
    { label: 'Account role', value: role, icon: 'role' as IconName },
    { label: 'Joined CampusCare', value: createdAt ? formatDate(createdAt) : 'Not available', icon: 'calendar' as IconName },
    { label: 'Account updated', value: updatedAt ? formatDate(updatedAt) : 'Not available', icon: 'settings' as IconName }
  ];
  return <section className="pf-card"><SectionHeading eyebrow="Account" title="Account information" description="Core identity details connected to your authenticated CampusCare account." /><div className="pf-account-list">{rows.map((row) => <div key={row.label}><Icon name={row.icon} size={34} color={colors.teal} background="#e8f8f5" /><span><small>{row.label}</small><strong>{row.value || 'Not available'}</strong></span></div>)}</div></section>;
}

function IdentityGrid({ fields, role, skills, stats }: { fields: ProfileField[]; role: Role; skills: StudentSkill[]; stats: DashboardStats | null }) {
  const fallback = 'Not added yet';
  let cards: IdentityCard[];
  if (role === 'student') cards = [
    { label: 'Study year', value: displayLabel(fields[0]?.value), helper: 'Current academic stage', icon: 'calendar', color: colors.blue },
    { label: 'Department', value: displayLabel(fields[1]?.value), helper: 'Program or faculty area', icon: 'profile', color: colors.teal },
    { label: 'Support need', value: displayLabel(fields[2]?.value), helper: 'Main CampusCare interest', icon: 'help', color: colors.violet },
    { label: 'Skills shared', value: String(skills.length), helper: skills.length ? 'Visible on your SkillMap' : fallback, icon: 'skill', color: colors.green }
  ];
  else if (role === 'mentor') cards = [
    { label: 'Expertise area', value: displayLabel(fields[0]?.value), helper: 'Academic guidance strength', icon: 'skill', color: colors.blue },
    { label: 'Availability', value: displayLabel(fields[1]?.value), helper: 'Current mentoring window', icon: 'calendar', color: colors.teal },
    { label: 'Support topics', value: displayLabel(fields[2]?.value), helper: 'Subjects students can ask about', icon: 'help', color: colors.violet },
    { label: 'Open support', value: String(stats?.openHelpRequests ?? 0), helper: 'Requests visible for guidance', icon: 'guidance', color: colors.amber }
  ];
  else cards = [
    { label: 'Responsibility area', value: displayLabel(fields[0]?.value), helper: 'Administrative scope', icon: 'shield', color: colors.navy },
    { label: 'Department / unit', value: displayLabel(fields[1]?.value), helper: 'Operational context', icon: 'activity', color: colors.blue },
    { label: 'Managed modules', value: '6 active modules', helper: 'CampusCare operational scope', icon: 'settings', color: colors.teal },
    { label: 'Reports monitored', value: String((stats?.totalHelpRequests ?? 0) + (stats?.totalLostFoundItems ?? 0)), helper: 'Help and item reports', icon: 'lostFound', color: colors.amber }
  ];
  return <section><SectionHeading eyebrow="Role identity" title={role === 'student' ? 'Your student identity' : role === 'mentor' ? 'Your mentor guidance identity' : 'Your admin responsibility identity'} description="The profile context that shapes your role inside CampusCare." /><div className="pf-identity-grid">{cards.map((card, index) => <article className="pf-card pf-identity-card pf-lift pf-reveal" key={card.label} style={{ animationDelay: `${index * 45}ms` }}><Icon name={card.icon} color={card.color} background={`${card.color}14`} /><span>{card.label}</span><strong>{card.value}</strong><p>{card.helper}</p></article>)}</div></section>;
}

function ActivitySnapshot({ role, stats, skills }: { role: Role; stats: DashboardStats | null; skills: StudentSkill[] }) {
  const moodTotal = stats?.totalMoodRecords ?? Object.values(stats?.moodCounts ?? {}).reduce((sum, count) => sum + count, 0);
  const metrics = role === 'student'
    ? [
        { label: 'Help requests', value: stats?.totalHelpRequests ?? 0, helper: `${stats?.openHelpRequests ?? 0} open`, icon: 'help' as IconName, color: colors.teal },
        { label: 'Skills', value: skills.length, helper: 'Shared profile skills', icon: 'skill' as IconName, color: colors.blue },
        { label: 'Stress records', value: stats?.totalStressRecords ?? 0, helper: `${stats?.averageStressLevel?.toFixed(1) ?? '0.0'} average`, icon: 'stress' as IconName, color: colors.amber },
        { label: 'Mood records', value: moodTotal, helper: 'Weekly reflections', icon: 'mood' as IconName, color: colors.violet },
        { label: 'Lost / Found', value: stats?.totalLostFoundItems ?? 0, helper: `${stats?.lostFoundResolved ?? 0} resolved`, icon: 'lostFound' as IconName, color: colors.green }
      ]
    : role === 'mentor'
      ? [
          { label: 'Open requests', value: stats?.openHelpRequests ?? 0, helper: 'Awaiting support', icon: 'help' as IconName, color: colors.teal },
          { label: 'Skills tracked', value: stats?.totalStudentSkills ?? stats?.totalSkills ?? 0, helper: 'Student profile connections', icon: 'skill' as IconName, color: colors.blue },
          { label: 'Stress signals', value: stats?.totalStressRecords ?? 0, helper: `${stats?.averageStressLevel?.toFixed(1) ?? '0.0'} average`, icon: 'stress' as IconName, color: colors.amber },
          { label: 'Mood signals', value: moodTotal, helper: 'Visible check-ins', icon: 'mood' as IconName, color: colors.violet },
          { label: 'Support activity', value: stats?.recentActivity?.length ?? 0, helper: 'Recent module updates', icon: 'activity' as IconName, color: colors.green }
        ]
      : [
          { label: 'Total users', value: stats?.totalUsers ?? 0, helper: 'Registered accounts', icon: 'profile' as IconName, color: colors.navy },
          { label: 'Help requests', value: stats?.totalHelpRequests ?? 0, helper: `${stats?.openHelpRequests ?? 0} open`, icon: 'help' as IconName, color: colors.teal },
          { label: 'Skills added', value: stats?.totalStudentSkills ?? stats?.totalSkills ?? 0, helper: 'Profile connections', icon: 'skill' as IconName, color: colors.blue },
          { label: 'Stress records', value: stats?.totalStressRecords ?? 0, helper: 'Academic pressure signals', icon: 'stress' as IconName, color: colors.amber },
          { label: 'Mood records', value: moodTotal, helper: 'Wellbeing signals', icon: 'mood' as IconName, color: colors.violet },
          { label: 'Lost / Found', value: stats?.totalLostFoundItems ?? 0, helper: `${stats?.lostFoundOpen ?? 0} open`, icon: 'lostFound' as IconName, color: colors.green }
        ];
  const hasActivity = metrics.some((metric) => metric.value > 0);
  return <section><SectionHeading eyebrow="Activity snapshot" title={role === 'student' ? 'Your CampusCare activity' : role === 'mentor' ? 'Your support context' : 'Platform responsibility snapshot'} description={role === 'student' ? 'A compact view of the modules shaping your CampusCare journey.' : 'Role-relevant activity visible through your current account.'} />{hasActivity ? <div className={`pf-activity-grid ${role}`}>{metrics.map((metric, index) => <article className="pf-card pf-activity-card pf-lift pf-reveal" key={metric.label} style={{ '--metric-color': metric.color, animationDelay: `${index * 40}ms` } as React.CSSProperties}><Icon name={metric.icon} color={metric.color} background={`${metric.color}14`} /><span>{metric.label}</span><strong>{metric.value}</strong><p>{metric.helper}</p><div><i style={{ width: `${Math.min(100, Math.max(8, Number(metric.value) * 10))}%` }} /></div></article>)}</div> : <UIEmptyState icon="activity" title="No activity yet" description="Your CampusCare activity will appear as you use help, skills, stress, mood, and campus reports." />}</section>;
}

function ProgressJourney({ role, userCreatedAt, stats, skills, profileComplete }: { role: Role; userCreatedAt?: string; stats: DashboardStats | null; skills: StudentSkill[]; profileComplete: boolean }) {
  const steps = role === 'student'
    ? [
        { label: 'Joined', complete: Boolean(userCreatedAt), helper: userCreatedAt ? formatDate(userCreatedAt) : 'Account created' },
        { label: 'Added skill', complete: skills.length > 0, helper: skills.length ? `${skills.length} shared` : 'Not yet' },
        { label: 'Logged stress', complete: Boolean(stats?.totalStressRecords), helper: `${stats?.totalStressRecords ?? 0} records` },
        { label: 'Asked for help', complete: Boolean(stats?.totalHelpRequests), helper: `${stats?.totalHelpRequests ?? 0} requests` },
        { label: 'Updated profile', complete: profileComplete, helper: profileComplete ? 'Onboarding complete' : 'Needs details' }
      ]
    : [
        { label: 'Joined', complete: Boolean(userCreatedAt), helper: userCreatedAt ? formatDate(userCreatedAt) : 'Account created' },
        { label: role === 'mentor' ? 'Guidance profile' : 'Admin context', complete: true, helper: 'Role active' },
        { label: 'Viewed activity', complete: Boolean(stats?.recentActivity?.length), helper: `${stats?.recentActivity?.length ?? 0} recent items` },
        { label: 'Support modules', complete: true, helper: 'Modules available' },
        { label: 'Profile maintained', complete: profileComplete, helper: profileComplete ? 'Onboarding complete' : 'Needs details' }
      ];
  return <section className="pf-card pf-journey"><SectionHeading eyebrow="Progress path" title={role === 'student' ? 'Your support journey' : role === 'mentor' ? 'Your guidance path' : 'Your responsibility path'} description="Real milestones drawn from your available CampusCare activity." /><div className="pf-journey-line">{steps.map((step, index) => <div className={step.complete ? 'is-complete' : ''} key={step.label}><span><Icon name={step.complete ? 'complete' : 'activity'} size={34} color={step.complete ? colors.green : '#94a3b8'} background={step.complete ? '#ecfdf5' : '#eef4f8'} /></span><strong>{step.label}</strong><small>{step.helper}</small>{index < steps.length - 1 ? <i /> : null}</div>)}</div></section>;
}

function GuidanceCard({ role }: { role: Role }) {
  const content = role === 'student'
    ? { eyebrow: 'Personal identity', title: 'Your profile connects support, skills, and reflection.', items: ['Keep onboarding details current.', 'Share skills you actively practice.', 'Use check-ins to notice patterns.', 'Ask for support when it helps.'] }
    : role === 'mentor'
      ? { eyebrow: 'Mentor guidance style', title: 'Support students with calm, practical direction.', items: ['Listen first.', 'Reply clearly.', 'Suggest one next step.', 'Keep the tone supportive.'] }
      : { eyebrow: 'Responsible platform use', title: 'Use CampusCare data to improve support, not judge individuals.', items: ['Protect student privacy.', 'Monitor trends responsibly.', 'Keep module information accurate.', 'Use insights for support planning.'] };
  return <section className="pf-card pf-guidance"><Icon name={role === 'admin' ? 'shield' : 'guidance'} size={48} color={role === 'admin' ? colors.navy : colors.teal} background={role === 'admin' ? '#eef2f6' : '#e8f8f5'} /><div><span>{content.eyebrow}</span><h2>{content.title}</h2><ul>{content.items.map((item) => <li key={item}>{item}</li>)}</ul></div></section>;
}

function QuickActions({ actions }: { actions: Action[] }) {
  return <section><SectionHeading eyebrow="Quick actions" title="Move through your workspace" description="Open the CampusCare modules most relevant to your role." /><div className="pf-actions">{actions.map((action) => <Link className="pf-card pf-action pf-lift" key={action.to} to={action.to}><Icon name={action.icon} color={action.color} background={`${action.color}14`} /><div><strong>{action.label}</strong><span>{action.description}</span></div><Icon name="arrow" size={26} color={colors.navy} background="transparent" /></Link>)}</div></section>;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const role: Role = user?.role === 'mentor' || user?.role === 'admin' ? user.role : 'student';

  useEffect(() => {
    Promise.all([profileService.getCurrentProfile(), skillService.getMySkills(), dashboardService.stats()])
      .then(([profileData, skillData, statsData]) => {
        setProfile(profileData);
        setSkills(skillData);
        setStats(statsData);
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const fields = useMemo(() => roleFields(role, profile), [profile, role]);
  const actions = useMemo(() => roleActions(role), [role]);

  return (
    <>
      <style>{`
        @keyframes pfReveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes pfGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}} @keyframes pfPulse{0%,100%{box-shadow:0 0 0 0 rgba(103,227,214,.25)}50%{box-shadow:0 0 0 6px rgba(103,227,214,0)}}
        .pf-page{margin:-2rem;min-height:100vh;padding:2rem;overflow:hidden;color:#0b1d35;background:radial-gradient(circle at 92% 4%,rgba(13,158,138,.11),transparent 25rem),radial-gradient(circle at 0 48%,rgba(37,99,235,.07),transparent 28rem),linear-gradient(180deg,#f8fbff,#eef4f8);font-family:"DM Sans",sans-serif}.pf-page *{box-sizing:border-box}.pf-reveal{animation:pfReveal .45s ease both}.pf-card{min-width:0;border:1px solid #dfeaf3;border-radius:18px;background:rgba(255,255,255,.92);box-shadow:0 12px 32px rgba(15,23,42,.055);backdrop-filter:blur(12px)}.pf-lift{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}.pf-lift:hover{transform:translateY(-3px);border-color:rgba(13,158,138,.28);box-shadow:0 18px 42px rgba(15,23,42,.1)}.pf-icon{display:inline-flex;flex:none;align-items:center;justify-content:center;border-radius:30%}
        .pf-hero{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) 180px;align-items:center;gap:1.4rem;min-height:250px;overflow:hidden;padding:2rem;border:1px solid rgba(255,255,255,.09);border-radius:24px;color:#fff;background:radial-gradient(circle at 88% 5%,rgba(103,227,214,.24),transparent 31%),linear-gradient(135deg,#071527,#0b1d35 56%,#0f3b52);box-shadow:0 20px 46px rgba(11,29,53,.18)}.pf-hero::after{content:"";position:absolute;right:-75px;bottom:-130px;width:330px;height:330px;border:1px solid rgba(103,227,214,.12);border-radius:50%}.pf-hero>*{position:relative;z-index:1}.pf-avatar{display:grid;width:86px;height:86px;place-items:center;border:2px solid rgba(103,227,214,.28);border-radius:26px;color:#67e3d6;background:linear-gradient(145deg,rgba(13,158,138,.25),rgba(103,227,214,.08));box-shadow:inset 0 0 0 8px rgba(255,255,255,.025);font-family:"Sora",sans-serif;font-size:1.45rem;font-weight:800}.pf-eyebrow{color:#bdf8ef;font-size:.65rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.pf-name-row{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;margin:.35rem 0}.pf-name-row h1{margin:0;font-family:"Sora",sans-serif;font-size:clamp(1.5rem,3vw,2.1rem)}.pf-role,.pf-active{display:inline-flex;align-items:center;border-radius:999px;padding:.3rem .58rem;font-size:.58rem;font-weight:850;text-transform:uppercase}.pf-role-student{color:#bdf8ef;background:rgba(13,158,138,.14)}.pf-role-mentor{color:#cfe1ff;background:rgba(37,99,235,.16)}.pf-role-admin{color:#fff;background:rgba(255,255,255,.1)}.pf-active{gap:5px;color:#bdf8ef;background:rgba(13,158,138,.1)}.pf-active i{width:6px;height:6px;border-radius:50%;background:#67e3d6;animation:pfPulse 2s infinite}.pf-email{margin:0;color:rgba(255,255,255,.55)!important;font-size:.72rem!important}.pf-hero-copy h2{margin:.65rem 0 .2rem;color:#67e3d6;font-family:"Sora",sans-serif;font-size:.9rem}.pf-hero-copy>p{max-width:650px;margin:0;color:rgba(255,255,255,.65);font-size:.77rem;line-height:1.6}.pf-hero blockquote{margin:.7rem 0 0;border-left:2px solid rgba(103,227,214,.45);padding-left:.7rem;color:rgba(255,255,255,.55);font-size:.68rem;font-style:normal;line-height:1.5}.pf-hero-mark{display:grid;justify-items:center;gap:.55rem;color:rgba(255,255,255,.55);font-size:.62rem;text-align:center}
        .pf-heading>span,.pf-identity-card>span,.pf-activity-card>span,.pf-guidance>div>span{display:block;color:#0d9e8a;font-size:.62rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.pf-heading h2,.pf-guidance h2{margin:.25rem 0 0;font-family:"Sora",sans-serif;font-size:1.03rem}.pf-heading p{margin:.3rem 0 0;color:#64748b;font-size:.72rem;line-height:1.55}.pf-top-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:1rem;margin-top:1rem}.pf-completeness{padding:1.2rem}.pf-complete-top{display:grid;grid-template-columns:1fr auto;align-items:center;gap:1rem}.pf-complete-ring{position:relative;display:grid;width:90px;height:90px;place-items:center;border-radius:50%}.pf-complete-ring::after{content:"";position:absolute;inset:10px;border-radius:50%;background:#fff}.pf-complete-ring span{position:relative;z-index:1;display:grid;color:#94a3b8;font-size:.54rem;text-align:center}.pf-complete-ring strong{color:#0b1d35;font-family:"Sora",sans-serif;font-size:1.15rem}.pf-progress{height:8px;overflow:hidden;margin-top:.8rem;border-radius:999px;background:#e8eff5}.pf-progress span,.pf-activity-card>div:last-child i{display:block;height:100%;border-radius:999px;transform-origin:left;animation:pfGrow .75s ease both}.pf-field-pills{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.75rem}.pf-field-pills span{display:inline-flex;align-items:center;gap:5px;border:1px solid #e3ebf1;border-radius:999px;padding:.28rem .48rem;color:#7b8ba0;background:#f8fbfd;font-size:.57rem}.pf-field-pills i{width:6px;height:6px;border-radius:50%;background:#c88719}.pf-field-pills span.is-complete{color:#047857;background:#ecfdf5}.pf-field-pills span.is-complete i{background:#059669}.pf-primary-link{display:inline-flex;align-items:center;gap:.35rem;margin-top:.8rem;border-radius:9px;padding:.55rem .8rem;color:#fff;background:#0d9e8a;font-size:.67rem;font-weight:800;text-decoration:none}.pf-top-grid>.pf-card:last-child{padding:1.2rem}.pf-account-list{display:grid;gap:.45rem;margin-top:.9rem}.pf-account-list>div{display:flex;align-items:center;gap:.6rem;border-bottom:1px solid #edf2f7;padding:.45rem 0}.pf-account-list>div:last-child{border:0}.pf-account-list span{display:grid;min-width:0}.pf-account-list small{color:#94a3b8;font-size:.56rem;text-transform:uppercase}.pf-account-list strong{overflow:hidden;margin-top:.12rem;color:#334155;font-size:.68rem;text-overflow:ellipsis;text-transform:capitalize;white-space:nowrap}
        .pf-section{margin-top:1.2rem}.pf-identity-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem;margin-top:.75rem}.pf-identity-card{padding:1rem}.pf-identity-card>span{margin-top:.7rem;color:#64748b}.pf-identity-card>strong{display:block;margin:.3rem 0 .18rem;overflow:hidden;font-family:"Sora",sans-serif;font-size:.9rem;text-overflow:ellipsis;text-transform:capitalize;white-space:nowrap}.pf-identity-card p{margin:0;color:#94a3b8;font-size:.62rem}.pf-activity-grid{display:grid;gap:.75rem;margin-top:.75rem}.pf-activity-grid.student,.pf-activity-grid.mentor{grid-template-columns:repeat(5,minmax(0,1fr))}.pf-activity-grid.admin{grid-template-columns:repeat(6,minmax(0,1fr))}.pf-activity-card{padding:.9rem;border-top:3px solid var(--metric-color)}.pf-activity-card>span{margin-top:.65rem;color:#64748b}.pf-activity-card>strong{display:block;margin:.25rem 0;font-family:"Sora",sans-serif;font-size:1.35rem}.pf-activity-card p{margin:0;color:#94a3b8;font-size:.59rem}.pf-activity-card>div:last-child{height:4px;margin-top:.65rem;border-radius:999px;background:#e8eff5}.pf-activity-card>div:last-child i{background:var(--metric-color)}
        .pf-middle-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:1rem;margin-top:1rem}.pf-journey{padding:1.2rem}.pf-journey-line{position:relative;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.35rem;margin-top:1rem}.pf-journey-line>div{position:relative;display:grid;justify-items:center;text-align:center}.pf-journey-line>div>span{position:relative;z-index:1;display:grid;place-items:center;border:4px solid #fff;border-radius:50%}.pf-journey-line strong{margin-top:.35rem;font-size:.62rem}.pf-journey-line small{margin-top:.12rem;color:#94a3b8;font-size:.54rem}.pf-journey-line>div>i{position:absolute;z-index:0;top:17px;left:60%;width:80%;height:2px;background:#dfe8ef}.pf-journey-line>div.is-complete>i{background:linear-gradient(90deg,#059669,#67e3d6)}.pf-guidance{display:grid;grid-template-columns:auto 1fr;align-items:start;gap:.8rem;padding:1.2rem}.pf-guidance ul{display:grid;gap:.38rem;margin:.7rem 0 0;padding:0;list-style:none}.pf-guidance li{position:relative;padding-left:14px;color:#64748b;font-size:.66rem}.pf-guidance li::before{content:"";position:absolute;top:.4rem;left:0;width:5px;height:5px;border-radius:50%;background:#0d9e8a}
        .pf-onboarding{margin-top:1rem;padding:1.2rem}.pf-onboarding-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}.pf-onboarding-head a{flex:none;border:1px solid #dce6ed;border-radius:9px;padding:.5rem .7rem;color:#0b1d35;background:#fff;font-size:.64rem;font-weight:800;text-decoration:none}.pf-details-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.65rem;margin-top:.9rem}.pf-detail-card{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start;gap:.55rem;border:1px solid #e5edf4;border-radius:11px;padding:.7rem;background:#f9fcfe}.pf-detail-card span{display:grid;min-width:0}.pf-detail-card small{color:#94a3b8;font-size:.56rem;font-weight:800;text-transform:uppercase}.pf-detail-card strong{display:-webkit-box;overflow:hidden;margin-top:.2rem;color:#334155;font-size:.68rem;line-height:1.45;-webkit-box-orient:vertical;-webkit-line-clamp:3}.pf-detail-card.is-missing strong{color:#a3afbd;font-style:italic;font-weight:500}.pf-skills{margin-top:1rem;padding:1.2rem}.pf-skills-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}.pf-skills-head a{color:#0d9e8a;font-size:.65rem;font-weight:800;text-decoration:none}.pf-skill-list{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.8rem}.pf-skill-list span{display:inline-flex;align-items:center;gap:.35rem;border:1px solid #dfeaf3;border-radius:9px;padding:.4rem .55rem;color:#334155;background:#f8fbfd;font-size:.65rem}.pf-skill-list small{color:#0d9e8a;text-transform:capitalize}
        .pf-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem;margin-top:.75rem}.pf-action{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:.65rem;padding:.75rem;color:#0b1d35;text-decoration:none}.pf-action div{display:grid}.pf-action strong{font-size:.68rem}.pf-action span{margin-top:.15rem;color:#94a3b8;font-size:.57rem}.pf-empty{display:grid;min-height:145px;place-items:center;align-content:center;gap:.4rem;margin-top:.8rem;border:1px dashed #d5e2ec;border-radius:12px;padding:1rem;background:#f8fbfd;text-align:center}.pf-empty strong{font-size:.73rem}.pf-empty>span:last-of-type{max-width:300px;color:#94a3b8;font-size:.63rem}.pf-empty a{margin-top:.3rem;color:#0d9e8a;font-size:.63rem;font-weight:800;text-decoration:none}.pf-error{margin-bottom:1rem;border:1px solid #fecaca;border-radius:10px;padding:.75rem;color:#b91c1c;background:#fef2f2;font-size:.74rem}.pf-loading{display:grid;min-height:260px;place-items:center;color:#64748b}
        @media(max-width:1180px){.pf-activity-grid.student,.pf-activity-grid.admin{grid-template-columns:repeat(3,minmax(0,1fr))}.pf-identity-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:900px){.pf-hero{grid-template-columns:auto 1fr}.pf-hero-mark{display:none}.pf-top-grid,.pf-middle-grid{grid-template-columns:1fr}.pf-activity-grid.mentor{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:720px){.pf-page{margin:-1rem;padding:1rem}.pf-hero{grid-template-columns:1fr;padding:1.35rem}.pf-avatar{width:70px;height:70px;border-radius:20px}.pf-activity-grid.student,.pf-activity-grid.mentor,.pf-activity-grid.admin{grid-template-columns:repeat(2,minmax(0,1fr))}.pf-actions{grid-template-columns:1fr}.pf-onboarding-head,.pf-skills-head{display:block}.pf-onboarding-head a,.pf-skills-head a{display:inline-flex;margin-top:.6rem}.pf-journey-line{grid-template-columns:1fr;padding-left:2.7rem}.pf-journey-line>div{justify-items:start;text-align:left}.pf-journey-line>div>span{position:absolute;top:0;left:-2.7rem}.pf-journey-line>div{min-height:58px}.pf-journey-line>div>i{top:32px;bottom:-12px;left:-2.05rem;width:2px;height:auto}}@media(max-width:480px){.pf-identity-grid,.pf-activity-grid.student,.pf-activity-grid.mentor,.pf-activity-grid.admin{grid-template-columns:1fr}.pf-complete-top{grid-template-columns:1fr}.pf-complete-ring{width:82px;height:82px}.pf-name-row{align-items:flex-start}.pf-email{overflow-wrap:anywhere}}
      `}</style>
      <div className="pf-page">
        {error ? <div className="pf-error">{error}</div> : null}
        {isLoading ? <PageLoadingState variant="profile" label="Loading your CampusCare profile" /> : error ? null : (
          <>
            <Hero role={role} name={user?.fullName} email={user?.email} />
            <div className="pf-top-grid"><Completeness fields={fields} skills={skills} profile={profile} role={role} /><AccountCard role={role} name={user?.fullName} email={user?.email} createdAt={user?.createdAt} updatedAt={user?.updatedAt || profile?.updatedAt} /></div>
            <div className="pf-section"><IdentityGrid fields={fields} role={role} skills={skills} stats={stats} /></div>
            <div className="pf-section"><ActivitySnapshot role={role} stats={stats} skills={skills} /></div>
            <div className="pf-middle-grid"><ProgressJourney role={role} userCreatedAt={user?.createdAt} stats={stats} skills={skills} profileComplete={Boolean(profile?.onboardingCompleted)} /><GuidanceCard role={role} /></div>
            <section className="pf-card pf-onboarding"><div className="pf-onboarding-head"><SectionHeading eyebrow="Onboarding details" title="Role preferences and context" description={profile?.onboardingCompleted ? 'These details shape the prompts and context shown across your workspace.' : 'Complete onboarding to personalize your CampusCare experience.'} /><Link to="/onboarding">Update onboarding</Link></div>{fields.some((field) => field.value) ? <div className="pf-details-grid">{fields.map((field) => <article className={`pf-detail-card ${field.value ? '' : 'is-missing'}`} key={field.label}><Icon name={field.icon} size={34} color={field.value ? colors.teal : '#94a3b8'} background={field.value ? '#e8f8f5' : '#eef4f8'} /><span><small>{field.label}</small><strong>{displayLabel(field.value)}</strong></span></article>)}</div> : <EmptyState title={role === 'student' ? 'Complete your student context' : role === 'mentor' ? 'Complete your mentor support profile' : 'Complete your admin responsibility details'} text="Complete onboarding to personalize your CampusCare workspace." action={{ label: 'Update onboarding', to: '/onboarding' }} />}</section>
            <section className="pf-card pf-skills"><div className="pf-skills-head"><SectionHeading eyebrow="SkillMap identity" title={role === 'student' ? 'My shared skills' : 'Skills on this account'} description="Skills currently attached to your CampusCare profile." /><Link to="/skill-map">Manage skills</Link></div>{skills.length ? <div className="pf-skill-list">{skills.map((skill) => <span key={skill.skillId}><Icon name="skill" size={25} color={colors.teal} background="#e8f8f5" />{skill.name}<small>{displayLabel(skill.level)}</small></span>)}</div> : <EmptyState title="No skills added yet" text="Add your first skill to make your CampusCare identity more useful." action={{ label: 'Open SkillMap', to: '/skill-map' }} />}</section>
            <div className="pf-section"><QuickActions actions={actions} /></div>
          </>
        )}
      </div>
    </>
  );
}
