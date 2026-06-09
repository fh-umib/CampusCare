import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { skillService } from '../services/skillService';
import type { Skill, SkillAvailability, SkillLevel, StudentSkill, StudentSkillCard } from '../types/skill';

type Role = 'student' | 'mentor' | 'admin';
type CheckStatus = 'new' | 'practicing' | 'ready' | 'verified' | 'review';
type IconName = 'code' | 'database' | 'branch' | 'design' | 'network' | 'presentation' | 'clock' | 'check' | 'growth' | 'search' | 'catalog' | 'arrow' | 'close';
type Question = { prompt: string; options: string[]; answer: number };
type CheckResult = { status: 'verified' | 'practicing' | 'review'; score: number; completedAt: string };

const levels: SkillLevel[] = ['beginner', 'intermediate', 'advanced'];
const availabilityValues: SkillAvailability[] = ['available', 'busy', 'open_to_projects'];
const resultStorageKey = 'campuscare-skill-check-results';

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
  code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" /></>,
  database: <><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
  branch: <><circle cx="6" cy="5" r="2" /><circle cx="18" cy="7" r="2" /><circle cx="6" cy="19" r="2" /><path d="M6 7v10M8 7h4a6 6 0 0 1 6 6v-4" /></>,
  design: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  network: <><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="18" r="2.5" /><circle cx="19" cy="18" r="2.5" /><path d="m10.8 7.2-4.6 8.6M13.2 7.2l4.6 8.6M7.5 18h9" /></>,
  presentation: <><path d="M4 4h16v12H4zM8 20l4-4 4 4" /><path d="M8 12V9M12 12V7M16 12v-2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <><path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></>,
  growth: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  catalog: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" /></>,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />
};

const questionBank: Record<string, Question[]> = {
  react: [
    { prompt: 'What is a React component?', options: ['A reusable piece of interface', 'A database table', 'A CSS file only'], answer: 0 },
    { prompt: 'What is state used for?', options: ['Tracking changing component data', 'Installing packages', 'Creating SQL joins'], answer: 0 },
    { prompt: 'Why do components receive props?', options: ['To receive data from a parent', 'To replace HTML', 'To create a server'], answer: 0 },
    { prompt: 'What does useState help with?', options: ['Local component state', 'Git branches', 'Database indexes'], answer: 0 }
  ],
  sql: [
    { prompt: 'What does SELECT do?', options: ['Reads data from a table', 'Deletes a database', 'Creates a password'], answer: 0 },
    { prompt: 'Why do we use WHERE?', options: ['To filter rows', 'To rename a table', 'To style results'], answer: 0 },
    { prompt: 'What is a primary key?', options: ['A unique row identifier', 'A column color', 'A backup file'], answer: 0 },
    { prompt: 'What is a JOIN used for?', options: ['Combining related table data', 'Sorting CSS', 'Sending email'], answer: 0 }
  ],
  github: [
    { prompt: 'What does a commit represent?', options: ['A saved change snapshot', 'A live website', 'A deleted branch'], answer: 0 },
    { prompt: 'What does push do?', options: ['Sends local commits to a remote', 'Creates a password', 'Runs SQL'], answer: 0 },
    { prompt: 'What is a branch?', options: ['A separate line of work', 'A database field', 'A design color'], answer: 0 },
    { prompt: 'Why can merge conflicts happen?', options: ['The same code was changed differently', 'The internet is always slow', 'A repository has one file'], answer: 0 }
  ],
  'ui design': [
    { prompt: 'Why is spacing important?', options: ['It improves clarity and hierarchy', 'It replaces content', 'It makes every element larger'], answer: 0 },
    { prompt: 'What makes a button clear?', options: ['A recognizable action and visible state', 'Many unrelated colors', 'No label or icon'], answer: 0 },
    { prompt: 'Why should colors be consistent?', options: ['To support recognition and meaning', 'To remove contrast', 'To hide navigation'], answer: 0 },
    { prompt: 'What does responsive design mean?', options: ['Adapting to different screen sizes', 'Using only desktop screens', 'Removing forms'], answer: 0 }
  ],
  teamwork: [
    { prompt: 'What is a constructive way to handle conflict?', options: ['Discuss the issue calmly and specifically', 'Ignore every concern', 'Blame one person publicly'], answer: 0 },
    { prompt: 'Why is communication important?', options: ['It keeps expectations and progress clear', 'It removes all deadlines', 'It replaces planning'], answer: 0 },
    { prompt: 'What should happen when a teammate is blocked?', options: ['Clarify the blocker and offer a next step', 'Remove them immediately', 'Wait without checking'], answer: 0 },
    { prompt: 'What supports reliable teamwork?', options: ['Clear ownership and respectful updates', 'Hidden tasks', 'Changing goals silently'], answer: 0 }
  ]
};

const genericQuestions: Question[] = [
  { prompt: 'What best shows real understanding of a skill?', options: ['Using it in a small practical task', 'Only listing its name', 'Avoiding feedback'], answer: 0 },
  { prompt: 'What should you do when a concept is unclear?', options: ['Review it and ask a focused question', 'Pretend it is understood', 'Stop practicing entirely'], answer: 0 },
  { prompt: 'What helps a skill grow over time?', options: ['Regular practice and reflection', 'One rushed attempt', 'Never revisiting mistakes'], answer: 0 },
  { prompt: 'What is useful evidence of progress?', options: ['Explaining and applying the basics', 'Memorizing a title', 'Comparing yourself harshly'], answer: 0 }
];

function displayLabel(value: string) {
  return value.replace(/_/g, ' ');
}

function categoryIcon(category: string | null, name = ''): IconName {
  const value = `${category ?? ''} ${name}`.toLowerCase();
  if (/sql|database|data/.test(value)) return 'database';
  if (/git|github|branch/.test(value)) return 'branch';
  if (/design|ui|ux/.test(value)) return 'design';
  if (/team|project|management|collaboration/.test(value)) return 'network';
  if (/presentation|communication/.test(value)) return 'presentation';
  return 'code';
}

function daysSince(value?: string) {
  if (!value) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
}

function loadCheckResults(): Record<string, CheckResult> {
  try {
    return JSON.parse(localStorage.getItem(resultStorageKey) ?? '{}') as Record<string, CheckResult>;
  } catch {
    return {};
  }
}

function getQuestions(skillName: string) {
  const normalized = skillName.toLowerCase();
  const key = Object.keys(questionBank).find((candidate) => normalized.includes(candidate));
  return key ? questionBank[key] : genericQuestions;
}

function getStatus(skill: StudentSkill, results: Record<string, CheckResult>): CheckStatus {
  if (results[skill.skillId]) return results[skill.skillId].status;
  const age = daysSince(skill.createdAt);
  if (age === null) return 'practicing';
  if (age >= 7) return 'ready';
  return age < 2 ? 'new' : 'practicing';
}

const statusMeta: Record<CheckStatus, { label: string; color: string; soft: string }> = {
  new: { label: 'New skill', color: colors.blue, soft: '#eff6ff' },
  practicing: { label: 'Practicing', color: colors.teal, soft: '#e8f8f5' },
  ready: { label: 'Ready for check', color: colors.amber, soft: '#fff7e8' },
  verified: { label: 'Verified', color: colors.green, soft: '#ecfdf5' },
  review: { label: 'Needs review', color: colors.amber, soft: '#fff7e8' }
};

function Icon({ name, size = 40, color = colors.teal, background = 'rgba(13,158,138,.1)' }: {
  name: IconName;
  size?: number;
  color?: string;
  background?: string;
}) {
  return (
    <span className="sk-icon" style={{ width: size, height: size, color, background }}>
      <svg aria-hidden="true" width={size * .52} height={size * .52} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {iconPaths[name]}
      </svg>
    </span>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return <div className="sk-heading">{eyebrow ? <span>{eyebrow}</span> : null}<h2>{title}</h2><p>{description}</p></div>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="sk-empty"><Icon name="growth" size={44} color="#94a3b8" background="#eef4f8" /><strong>{title}</strong><span>{text}</span></div>;
}

function Hero({ role, total, shared, ready, commonCategory }: { role: Role; total: number; shared: number; ready: number; commonCategory: string }) {
  const content = role === 'student'
    ? { eyebrow: 'Personal growth workspace', title: 'Build your academic skill map.', description: 'Add what you know, practice it, and confirm your progress with small friendly skill checks.', badges: ['Skill profile', '7-day check', 'Peer discovery', 'Mentor visibility'] }
    : role === 'mentor'
      ? { eyebrow: 'Mentor discovery view', title: 'Discover student strengths and learning needs.', description: 'See shared skills, identify common learning areas, and guide students toward useful practice.', badges: [`${shared} skills shared`, `${ready} ready for check`, `${commonCategory} leads categories`] }
      : { eyebrow: 'Skill module active', title: 'SkillMap overview.', description: 'Understand catalog growth, student skill activity, and the learning areas developing across CampusCare.', badges: [`${total} catalog skills`, `${shared} student connections`, `${commonCategory} active category`] };
  return (
    <section className="sk-hero sk-reveal">
      <div><span className="sk-eyebrow"><i />{content.eyebrow}</span><h1>{content.title}</h1><p>{content.description}</p><div className="sk-hero-badges">{content.badges.map((badge) => <span key={badge}>{badge}</span>)}</div></div>
      <div className="sk-hero-visual"><div><Icon name="growth" size={58} color={colors.cyan} background="rgba(103,227,214,.1)" /></div><span>Skills grow stronger when you use them, not when you only list them.</span></div>
    </section>
  );
}

function MetricCard({ icon, label, value, helper, color, delay = 0 }: { icon: IconName; label: string; value: string; helper: string; color: string; delay?: number }) {
  return <article className="sk-card sk-metric sk-lift sk-reveal" style={{ animationDelay: `${delay}ms` }}><div><Icon name={icon} color={color} background={`${color}14`} /><i style={{ background: color }} /></div><span className="sk-label">{label}</span><strong style={{ color }}>{value}</strong><p>{helper}</p></article>;
}

function AddSkillPanel({ skills, onReload, onMessage }: { skills: Skill[]; onReload: () => Promise<void>; onMessage: (message: string) => void }) {
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });
  const [attachForm, setAttachForm] = useState({ skillId: skills[0]?.id ?? '', level: 'beginner' as SkillLevel, availability: 'available' as SkillAvailability });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState<'catalog' | 'attach' | null>(null);

  useEffect(() => {
    if (!attachForm.skillId && skills[0]) setAttachForm((current) => ({ ...current, skillId: skills[0].id }));
  }, [attachForm.skillId, skills]);

  async function createCatalogSkill(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!newSkill.name.trim()) return setError('Skill name is required.');
    try {
      setSubmitting('catalog');
      const created = await skillService.create({ name: newSkill.name.trim(), category: newSkill.category.trim() || undefined });
      setNewSkill({ name: '', category: '' });
      setAttachForm((current) => ({ ...current, skillId: created.id }));
      onMessage('Skill added to the catalog. You can now add it to your map.');
      await onReload();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(null);
    }
  }

  async function attach(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!attachForm.skillId) return setError('Choose a skill to add.');
    try {
      setSubmitting('attach');
      await skillService.attachMySkill(attachForm);
      onMessage('Skill added to your map. Your friendly check becomes available after 7 days.');
      await onReload();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <section className="sk-card sk-add-panel">
      <SectionHeading eyebrow="Grow your profile" title="Add a skill to your map" description="Choose an existing skill, or add a missing one to the shared catalog." />
      {error ? <div className="sk-alert sk-alert-error">{error}</div> : null}
      <form className="sk-attach-form" onSubmit={attach}>
        <label><span>Skill</span><select value={attachForm.skillId} onChange={(event) => setAttachForm({ ...attachForm, skillId: event.target.value })}><option value="">Choose skill</option>{skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></label>
        <label><span>Level</span><select value={attachForm.level} onChange={(event) => setAttachForm({ ...attachForm, level: event.target.value as SkillLevel })}>{levels.map((level) => <option key={level}>{level}</option>)}</select></label>
        <label><span>Availability</span><select value={attachForm.availability} onChange={(event) => setAttachForm({ ...attachForm, availability: event.target.value as SkillAvailability })}>{availabilityValues.map((value) => <option key={value}>{value}</option>)}</select></label>
        <button disabled={Boolean(submitting) || !attachForm.skillId} type="submit">{submitting === 'attach' ? 'Adding...' : 'Add to my SkillMap'}<Icon name="arrow" size={22} color="#fff" background="transparent" /></button>
      </form>
      <details className="sk-catalog-form">
        <summary>Add a skill missing from the catalog</summary>
        <form onSubmit={createCatalogSkill}>
          <label><span>Skill name</span><input value={newSkill.name} onChange={(event) => setNewSkill({ ...newSkill, name: event.target.value })} /></label>
          <label><span>Category</span><input placeholder="e.g. Development" value={newSkill.category} onChange={(event) => setNewSkill({ ...newSkill, category: event.target.value })} /></label>
          <button disabled={Boolean(submitting)} type="submit">{submitting === 'catalog' ? 'Saving...' : 'Add catalog skill'}</button>
        </form>
      </details>
    </section>
  );
}

function SkillCard({ skill, result, onCheck, onRemove }: { skill: StudentSkill; result?: CheckResult; onCheck: (skill: StudentSkill) => void; onRemove: (skillId: string) => void }) {
  const status = getStatus(skill, result ? { [skill.skillId]: result } : {});
  const meta = statusMeta[status];
  const age = daysSince(skill.createdAt);
  const remaining = age === null ? null : Math.max(0, 7 - age);
  const progress = result ? 100 : age === null ? 40 : Math.min(100, Math.max(12, (age / 7) * 100));
  const canCheck = status === 'ready' || status === 'review' || status === 'practicing' && Boolean(result);

  return (
    <article className="sk-card sk-skill-card sk-lift" style={{ '--status-color': meta.color } as CSSProperties}>
      <div className="sk-skill-top"><Icon name={categoryIcon(skill.category, skill.name)} color={meta.color} background={meta.soft} /><span className={`sk-status ${status === 'ready' ? 'is-ready' : ''}`} style={{ color: meta.color, background: meta.soft }}>{meta.label}</span></div>
      <h3>{skill.name}</h3><p>{skill.category || 'General skill'} · {displayLabel(skill.level)}</p>
      <div className="sk-tags"><span>{displayLabel(skill.availability)}</span><span>{age === null ? 'Practice mode' : `${age} day${age === 1 ? '' : 's'} in map`}</span></div>
      <div className="sk-progress-head"><span>Growth checkpoint</span><strong>{Math.round(progress)}%</strong></div><div className="sk-progress"><span style={{ width: `${progress}%`, background: meta.color }} /></div>
      <p className="sk-check-note">{result ? `Last check: ${result.score}% · ${statusMeta[result.status].label}` : remaining ? `Practice for ${remaining} more day${remaining === 1 ? '' : 's'}. Your friendly check unlocks after 7 days.` : 'Your friendly skill check is ready.'}</p>
      <div className="sk-card-actions">
        <button className="sk-secondary-button" type="button" onClick={() => onRemove(skill.skillId)}>Remove</button>
        <button className="sk-check-button" disabled={!canCheck} type="button" onClick={() => onCheck(skill)}>{status === 'ready' || result ? 'Start skill check' : 'Keep practicing'}</button>
      </div>
    </article>
  );
}

function SkillCheck({ skill, onClose, onComplete }: { skill: StudentSkill; onClose: () => void; onComplete: (result: CheckResult) => void }) {
  const questions = getQuestions(skill.name);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<CheckResult | null>(null);
  const question = questions[index];

  function finish() {
    const correct = questions.reduce((sum, item, questionIndex) => sum + (answers[questionIndex] === item.answer ? 1 : 0), 0);
    const score = Math.round((correct / questions.length) * 100);
    const status: CheckResult['status'] = score >= 75 ? 'verified' : score >= 50 ? 'practicing' : 'review';
    const next = { status, score, completedAt: new Date().toISOString() };
    setResult(next);
    onComplete(next);
  }

  return (
    <div className="sk-modal-backdrop" role="presentation">
      <section aria-modal="true" className="sk-modal sk-reveal" role="dialog">
        <button aria-label="Close skill check" className="sk-modal-close" onClick={onClose} type="button"><Icon name="close" size={30} color={colors.muted} background="#eef4f8" /></button>
        {!result ? (
          <>
            <div className="sk-modal-header"><Icon name={categoryIcon(skill.category, skill.name)} size={50} color={colors.teal} background="#e8f8f5" /><div><span>Friendly skill check</span><h2>{skill.name}</h2><p>This is not a grade. It helps your SkillMap become more accurate.</p></div></div>
            <div className="sk-question-progress"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
            <div className="sk-question-count">Question {index + 1} of {questions.length}</div>
            <h3 className="sk-question">{question.prompt}</h3>
            <div className="sk-options">{question.options.map((option, optionIndex) => <button className={answers[index] === optionIndex ? 'is-selected' : ''} key={option} onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))} type="button"><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div>
            <div className="sk-modal-actions"><button disabled={index === 0} onClick={() => setIndex((current) => current - 1)} type="button">Previous</button>{index < questions.length - 1 ? <button disabled={answers[index] === undefined} onClick={() => setIndex((current) => current + 1)} type="button">Next</button> : <button disabled={answers[index] === undefined} onClick={finish} type="button">Finish check</button>}</div>
          </>
        ) : (
          <div className="sk-result"><Icon name={result.status === 'verified' ? 'check' : 'growth'} size={64} color={statusMeta[result.status].color} background={statusMeta[result.status].soft} /><span>{statusMeta[result.status].label}</span><h2>{result.score >= 75 ? `Great work — your ${skill.name} basics look strong.` : result.score >= 50 ? 'Nice progress — you understand several important ideas.' : 'Keep practicing — you are building the right foundation.'}</h2><p>{result.score}% of the friendly check matched the suggested answers. {result.score >= 75 ? 'Keep using the skill in small practical projects.' : 'Review the concepts that felt uncertain, then try again later.'}</p><button onClick={onClose} type="button">Return to SkillMap</button></div>
        )}
      </section>
    </div>
  );
}

function CategoryChart({ studentSkills }: { studentSkills: StudentSkillCard[] }) {
  const counts = new Map<string, number>();
  studentSkills.flatMap((student) => student.skills).forEach((skill) => counts.set(skill.category || 'General', (counts.get(skill.category || 'General') ?? 0) + 1));
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  const max = Math.max(1, ...rows.map(([, count]) => count));
  return <section className="sk-card sk-chart"><SectionHeading eyebrow="Learning areas" title="Skills by category" description="Shared student skills grouped by their catalog category." />{rows.length ? <div className="sk-bars">{rows.map(([category, count], index) => <div key={category}><div><span>{category}</span><strong>{count}</strong></div><div><span style={{ width: `${(count / max) * 100}%`, animationDelay: `${index * 60}ms` }} /></div></div>)}</div> : <EmptyState title="No category data yet" text="Categories will appear as skills are shared." />}</section>;
}

function LevelChart({ students }: { students: StudentSkillCard[] }) {
  const all = students.flatMap((student) => student.skills);
  const counts = levels.map((level) => ({ level, count: all.filter((skill) => skill.level === level).length }));
  const total = all.length;
  return <section className="sk-card sk-chart"><SectionHeading eyebrow="Experience mix" title="Skill level distribution" description="How shared skills are described across current profiles." />{total ? <><div className="sk-level-segments">{counts.map(({ level, count }) => count ? <span key={level} style={{ width: `${(count / total) * 100}%` }} /> : null)}</div><div className="sk-level-list">{counts.map(({ level, count }, index) => <div key={level}><i /><span>{displayLabel(level)}</span><strong>{count}</strong><small>{Math.round((count / total) * 100)}%</small><b style={{ width: `${(count / total) * 100}%`, animationDelay: `${index * 70}ms` }} /></div>)}</div></> : <EmptyState title="No level data yet" text="Skill levels will appear after profiles are built." />}</section>;
}

function StatusChart({ mySkills, results }: { mySkills: StudentSkill[]; results: Record<string, CheckResult> }) {
  const statuses = (['new', 'practicing', 'ready', 'verified', 'review'] as CheckStatus[]).map((status) => ({ status, count: mySkills.filter((skill) => getStatus(skill, results) === status).length }));
  const total = mySkills.length;
  return <section className="sk-card sk-chart"><SectionHeading eyebrow="Growth checkpoints" title="Verification status" description="A friendly view of skills moving from practice toward confirmation." />{total ? <><div className="sk-status-segments">{statuses.map(({ status, count }) => count ? <span key={status} style={{ width: `${(count / total) * 100}%`, background: statusMeta[status].color }} /> : null)}</div><div className="sk-status-list">{statuses.map(({ status, count }) => <div key={status}><i style={{ background: statusMeta[status].color }} /><span>{statusMeta[status].label}</span><strong>{count}</strong></div>)}</div></> : <EmptyState title="No growth status yet" text="Add a skill to start your personal map." />}</section>;
}

function Discovery({ students, search, setSearch, onSearch }: { students: StudentSkillCard[]; search: string; setSearch: (value: string) => void; onSearch: (event: FormEvent) => void }) {
  return (
    <section className="sk-card sk-discovery">
      <div className="sk-discovery-head"><SectionHeading eyebrow="Peer discovery" title="Student skill profiles" description="Find classmates and mentors by shared skills and collaboration availability." /><form onSubmit={onSearch}><Icon name="search" size={30} color={colors.muted} background="transparent" /><input placeholder="Search a skill" value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit">Search</button></form></div>
      {!students.length ? <EmptyState title="No matching profiles" text="Try another skill or clear the current search." /> : <div className="sk-students">{students.map((student) => <article key={student.userId}><div className="sk-avatar">{student.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><div><h3>{student.fullName}</h3><span>{displayLabel(student.role)} profile · {student.skills.length} skill{student.skills.length === 1 ? '' : 's'}</span></div><div className="sk-student-skills">{student.skills.map((skill) => <span key={skill.id}><Icon name={categoryIcon(skill.category, skill.name)} size={25} color={colors.teal} background="#e8f8f5" />{skill.name}<small>{displayLabel(skill.level)} · {displayLabel(skill.availability)}</small></span>)}</div></article>)}</div>}
    </section>
  );
}

export default function SkillMapPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<StudentSkill[]>([]);
  const [students, setStudents] = useState<StudentSkillCard[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCheck, setActiveCheck] = useState<StudentSkill | null>(null);
  const [checkResults, setCheckResults] = useState<Record<string, CheckResult>>(loadCheckResults);
  const role: Role = user?.role === 'mentor' || user?.role === 'admin' ? user.role : 'student';

  async function loadData(skillFilter = search) {
    setError('');
    try {
      setIsLoading(true);
      const [skillsData, mySkillsData, studentsData] = await Promise.all([skillService.list(), skillService.getMySkills(), skillService.students(skillFilter)]);
      setSkills(skillsData);
      setMySkills(mySkillsData);
      setStudents(studentsData);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadData(''); }, []);

  async function handleRemove(skillId: string) {
    try {
      setError('');
      await skillService.removeMySkill(skillId);
      setMessage('Skill removed from your profile.');
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    await loadData(search);
  }

  function saveResult(skillId: string, result: CheckResult) {
    setCheckResults((current) => {
      const next = { ...current, [skillId]: result };
      // Skill-check persistence is intentionally local until the backend has a verification model.
      try {
        localStorage.setItem(resultStorageKey, JSON.stringify(next));
      } catch {
        // The completed result still remains available for the current session.
      }
      return next;
    });
  }

  const analytics = useMemo(() => {
    const sharedSkills = students.flatMap((student) => student.skills);
    const categoryCounts = new Map<string, number>();
    const skillCounts = new Map<string, number>();
    sharedSkills.forEach((skill) => {
      categoryCounts.set(skill.category || 'General', (categoryCounts.get(skill.category || 'General') ?? 0) + 1);
      skillCounts.set(skill.name, (skillCounts.get(skill.name) ?? 0) + 1);
    });
    const commonCategory = [...categoryCounts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No category';
    const popularSkill = [...skillCounts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No skill yet';
    const ready = mySkills.filter((skill) => getStatus(skill, checkResults) === 'ready').length;
    const verified = mySkills.filter((skill) => getStatus(skill, checkResults) === 'verified').length;
    return { shared: sharedSkills.length, commonCategory, popularSkill, ready, verified };
  }, [checkResults, mySkills, students]);

  return (
    <>
      <style>{`
        @keyframes skReveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes skGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}} @keyframes skPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,135,25,.2)}50%{box-shadow:0 0 0 6px rgba(200,135,25,0)}}
        .sk-page{margin:-2rem;min-height:100vh;padding:2rem;overflow:hidden;color:#0b1d35;background:radial-gradient(circle at 92% 4%,rgba(13,158,138,.11),transparent 25rem),radial-gradient(circle at 0 48%,rgba(37,99,235,.07),transparent 28rem),linear-gradient(180deg,#f8fbff,#eef4f8);font-family:"DM Sans",sans-serif}.sk-page *{box-sizing:border-box}.sk-reveal{animation:skReveal .45s ease both}.sk-card{min-width:0;border:1px solid #dfeaf3;border-radius:18px;background:rgba(255,255,255,.92);box-shadow:0 12px 32px rgba(15,23,42,.055);backdrop-filter:blur(12px)}.sk-lift{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}.sk-lift:hover{transform:translateY(-3px);border-color:rgba(13,158,138,.28);box-shadow:0 18px 42px rgba(15,23,42,.1)}.sk-icon{display:inline-flex;flex:none;align-items:center;justify-content:center;border-radius:30%}
        .sk-hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 260px;align-items:center;gap:2rem;min-height:250px;overflow:hidden;padding:2rem;border:1px solid rgba(255,255,255,.09);border-radius:24px;color:#fff;background:radial-gradient(circle at 88% 5%,rgba(103,227,214,.24),transparent 31%),linear-gradient(135deg,#071527,#0b1d35 56%,#0f3b52);box-shadow:0 20px 46px rgba(11,29,53,.18)}.sk-hero::after{content:"";position:absolute;right:-75px;bottom:-130px;width:330px;height:330px;border:1px solid rgba(103,227,214,.12);border-radius:50%}.sk-hero>*{position:relative;z-index:1}.sk-eyebrow{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(103,227,214,.22);border-radius:999px;padding:.36rem .76rem;background:rgba(103,227,214,.08);color:#bdf8ef;font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.sk-eyebrow i{width:7px;height:7px;border-radius:50%;background:#67e3d6}.sk-hero h1{max-width:760px;margin:.9rem 0 .55rem;font-family:"Sora",sans-serif;font-size:clamp(1.75rem,3.2vw,2.65rem);line-height:1.14}.sk-hero p{max-width:720px;margin:0;color:rgba(255,255,255,.68);font-size:.9rem;line-height:1.7}.sk-hero-badges{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.1rem}.sk-hero-badges span{border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:.38rem .7rem;background:rgba(255,255,255,.06);color:rgba(255,255,255,.78);font-size:.68rem;font-weight:700}.sk-hero-visual{display:grid;justify-items:center;gap:.85rem;text-align:center}.sk-hero-visual>div{display:grid;width:126px;height:126px;place-items:center;border:1px solid rgba(103,227,214,.2);border-radius:50%;background:rgba(255,255,255,.045);box-shadow:inset 0 0 0 14px rgba(255,255,255,.022)}.sk-hero-visual>span{max-width:210px;color:rgba(255,255,255,.58);font-size:.7rem;line-height:1.55}
        .sk-heading>span,.sk-label{display:block;color:#0d9e8a;font-size:.64rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.sk-heading h2{margin:.25rem 0 0;font-family:"Sora",sans-serif;font-size:1.05rem}.sk-heading p{margin:.3rem 0 0;color:#64748b;font-size:.74rem;line-height:1.55}.sk-alert{margin-top:1rem;border-radius:9px;padding:.65rem .75rem;font-size:.72rem}.sk-alert-success{border:1px solid #bbebdc;color:#047857;background:#ecfdf5}.sk-alert-error{border:1px solid #fecaca;color:#b91c1c;background:#fef2f2}
        .sk-metrics{display:grid;gap:1rem;margin-top:1.2rem}.sk-metrics.student{grid-template-columns:repeat(5,minmax(0,1fr))}.sk-metrics.mentor{grid-template-columns:repeat(4,minmax(0,1fr))}.sk-metrics.admin{grid-template-columns:repeat(6,minmax(0,1fr))}.sk-metric{padding:1rem}.sk-metric>div{display:flex;align-items:center;justify-content:space-between}.sk-metric>div i{width:32px;height:3px;border-radius:999px}.sk-metric .sk-label{margin-top:.8rem;color:#64748b}.sk-metric>strong{display:block;margin:.3rem 0 .2rem;overflow:hidden;font-family:"Sora",sans-serif;font-size:1.4rem;text-overflow:ellipsis;text-transform:capitalize;white-space:nowrap}.sk-metric p{margin:0;color:#94a3b8;font-size:.68rem}
        .sk-add-panel{margin-top:1rem;padding:1.25rem}.sk-attach-form{display:grid;grid-template-columns:minmax(180px,1.4fr) repeat(2,minmax(130px,.7fr)) auto;align-items:end;gap:.7rem;margin-top:1rem}.sk-add-panel label{display:grid;gap:.35rem;color:#334155;font-size:.68rem;font-weight:800}.sk-add-panel input,.sk-add-panel select{width:100%;min-height:42px;border:1px solid #d8e4ed;border-radius:10px;outline:none;padding:.65rem .75rem;color:#0b1d35;background:#f9fcfe;font:inherit;font-size:.74rem}.sk-add-panel input:focus,.sk-add-panel select:focus{border-color:#0d9e8a;box-shadow:0 0 0 3px rgba(13,158,138,.1)}.sk-add-panel button{display:inline-flex;min-height:42px;align-items:center;justify-content:center;gap:.35rem;border:0;border-radius:10px;padding:.65rem .85rem;color:#fff;background:#0d9e8a;font:inherit;font-size:.7rem;font-weight:800;cursor:pointer}.sk-add-panel button:disabled{opacity:.6}.sk-catalog-form{margin-top:.8rem;border-top:1px solid #edf2f7;padding-top:.75rem}.sk-catalog-form summary{color:#64748b;font-size:.68rem;font-weight:800;cursor:pointer}.sk-catalog-form form{display:grid;grid-template-columns:1fr 1fr auto;align-items:end;gap:.7rem;margin-top:.7rem}.sk-catalog-form button{background:#0b1d35}
        .sk-skills-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:1rem}.sk-skill-card{position:relative;overflow:hidden;padding:1rem;border-top:3px solid var(--status-color)}.sk-skill-top{display:flex;align-items:center;justify-content:space-between;gap:.7rem}.sk-status{border-radius:999px;padding:.3rem .55rem;font-size:.58rem;font-weight:850}.sk-status.is-ready{animation:skPulse 2s infinite}.sk-skill-card h3{margin:.8rem 0 .2rem;font-family:"Sora",sans-serif;font-size:.95rem}.sk-skill-card>p{margin:0;color:#64748b;font-size:.68rem;text-transform:capitalize}.sk-tags{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.65rem}.sk-tags span{border:1px solid #e4ecf2;border-radius:999px;padding:.26rem .48rem;color:#64748b;background:#f8fbfd;font-size:.56rem;text-transform:capitalize}.sk-progress-head{display:flex;justify-content:space-between;margin-top:.8rem;color:#64748b;font-size:.6rem}.sk-progress-head strong{color:#0b1d35}.sk-progress{height:7px;margin-top:.35rem;overflow:hidden;border-radius:999px;background:#e8eff5}.sk-progress span,.sk-bars>div>div:last-child span,.sk-level-list b{display:block;height:100%;border-radius:999px;transform-origin:left;animation:skGrow .7s ease both}.sk-check-note{min-height:42px!important;margin-top:.65rem!important;color:#7b8ba0!important;font-size:.62rem!important;line-height:1.5}.sk-card-actions{display:flex;gap:.45rem;margin-top:.7rem}.sk-card-actions button{min-height:36px;border-radius:9px;padding:.45rem .65rem;font:inherit;font-size:.62rem;font-weight:800;cursor:pointer}.sk-secondary-button{border:1px solid #dbe5ed;color:#64748b;background:#fff}.sk-check-button{flex:1;border:0;color:#fff;background:#0d9e8a}.sk-check-button:disabled{cursor:not-allowed;opacity:.45}
        .sk-chart-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:1rem}.sk-chart{padding:1.2rem}.sk-bars{display:grid;gap:.7rem;margin-top:1rem}.sk-bars>div>div:first-child{display:flex;justify-content:space-between;color:#64748b;font-size:.68rem}.sk-bars>div>div:last-child{height:7px;margin-top:.28rem;border-radius:999px;background:#e8eff5}.sk-bars>div>div:last-child span{background:linear-gradient(90deg,#0d9e8a,#1687b8)}.sk-level-segments,.sk-status-segments{display:flex;height:13px;overflow:hidden;margin-top:1rem;border-radius:999px;background:#e8eff5}.sk-level-segments span:nth-child(1){background:#67e3d6}.sk-level-segments span:nth-child(2){background:#2563eb}.sk-level-segments span:nth-child(3){background:#7650b5}.sk-level-list,.sk-status-list{display:grid;gap:.45rem;margin-top:.8rem}.sk-level-list>div{position:relative;display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:.45rem;overflow:hidden;padding:.48rem .55rem;border:1px solid #e8eff5;border-radius:9px;color:#64748b;background:#f8fbfd;font-size:.61rem;text-transform:capitalize}.sk-level-list i,.sk-status-list i{width:7px;height:7px;border-radius:50%}.sk-level-list strong,.sk-status-list strong{color:#0b1d35}.sk-level-list small{color:#94a3b8}.sk-level-list b{position:absolute;right:0;bottom:0;left:0;height:2px;background:#2563eb}.sk-status-list>div{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.45rem;color:#64748b;font-size:.63rem}.sk-status-segments span{height:100%}
        .sk-discovery{margin-top:1rem;padding:1.25rem}.sk-discovery-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem}.sk-discovery-head form{display:flex;align-items:center;min-width:270px;border:1px solid #d8e4ed;border-radius:10px;padding-left:.35rem;background:#f9fcfe}.sk-discovery-head input{min-width:0;flex:1;border:0;outline:0;padding:.65rem .2rem;background:transparent;font:inherit;font-size:.7rem}.sk-discovery-head button{min-height:38px;border:0;border-radius:8px;margin:2px;padding:.5rem .7rem;color:#fff;background:#0b1d35;font:inherit;font-size:.65rem;font-weight:800}.sk-students{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem;margin-top:1rem}.sk-students>article{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:.7rem;border:1px solid #e5edf4;border-radius:12px;padding:.8rem;background:#fbfdff}.sk-avatar{display:grid;width:38px;height:38px;place-items:center;border-radius:11px;color:#0d7e70;background:#e8f8f5;font-size:.68rem;font-weight:850}.sk-students h3{margin:0;font-size:.76rem}.sk-students article>div:nth-child(2)>span{display:block;margin-top:.1rem;color:#94a3b8;font-size:.58rem;text-transform:capitalize}.sk-student-skills{display:flex;grid-column:1/-1;flex-wrap:wrap;gap:.4rem}.sk-student-skills>span{display:flex;align-items:center;gap:.3rem;border:1px solid #e5edf4;border-radius:9px;padding:.35rem .45rem;color:#334155;background:#fff;font-size:.62rem}.sk-student-skills small{color:#94a3b8;text-transform:capitalize}
        .sk-empty{display:grid;min-height:150px;place-items:center;align-content:center;gap:.4rem;margin-top:1rem;border:1px dashed #d5e2ec;border-radius:12px;padding:1rem;background:#f8fbfd;text-align:center}.sk-empty strong{font-size:.75rem}.sk-empty>span:last-child{color:#94a3b8;font-size:.65rem}.sk-modal-backdrop{position:fixed;z-index:1000;inset:0;display:grid;place-items:center;padding:1rem;background:rgba(7,21,39,.64);backdrop-filter:blur(8px)}.sk-modal{position:relative;width:min(620px,100%);max-height:calc(100vh - 2rem);overflow-y:auto;padding:1.4rem;border:1px solid rgba(255,255,255,.15);border-radius:20px;background:#fff;box-shadow:0 28px 80px rgba(7,21,39,.3)}.sk-modal-close{position:absolute;top:.8rem;right:.8rem;border:0;background:transparent;cursor:pointer}.sk-modal-header{display:flex;align-items:flex-start;gap:.8rem;padding-right:2rem}.sk-modal-header span,.sk-result>span{color:#0d9e8a;font-size:.62rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.sk-modal-header h2,.sk-result h2{margin:.2rem 0;font-family:"Sora",sans-serif;font-size:1.2rem}.sk-modal-header p,.sk-result p{margin:0;color:#64748b;font-size:.72rem;line-height:1.55}.sk-question-progress{height:7px;margin-top:1.2rem;overflow:hidden;border-radius:999px;background:#e8eff5}.sk-question-progress span{display:block;height:100%;background:linear-gradient(90deg,#0d9e8a,#67e3d6);transition:width .25s ease}.sk-question-count{margin-top:.7rem;color:#94a3b8;font-size:.62rem;font-weight:800}.sk-question{margin:.5rem 0 .8rem;font-family:"Sora",sans-serif;font-size:1rem}.sk-options{display:grid;gap:.5rem}.sk-options button{display:flex;align-items:center;gap:.65rem;border:1px solid #dfe8ef;border-radius:11px;padding:.7rem;color:#475569;background:#f9fcfe;font:inherit;font-size:.7rem;text-align:left;cursor:pointer}.sk-options button span{display:grid;width:28px;height:28px;place-items:center;border-radius:8px;color:#0d7e70;background:#e8f8f5;font-weight:850}.sk-options button.is-selected{border-color:#0d9e8a;color:#0b1d35;background:#f0fbf9;box-shadow:0 0 0 3px rgba(13,158,138,.08)}.sk-modal-actions{display:flex;justify-content:space-between;gap:.5rem;margin-top:1rem}.sk-modal-actions button,.sk-result button{min-height:40px;border:1px solid #dce6ed;border-radius:9px;padding:.55rem .8rem;color:#475569;background:#fff;font:inherit;font-size:.68rem;font-weight:800;cursor:pointer}.sk-modal-actions button:last-child,.sk-result button{border-color:#0d9e8a;color:#fff;background:#0d9e8a}.sk-modal-actions button:disabled{opacity:.45}.sk-result{display:grid;justify-items:center;padding:1.2rem;text-align:center}.sk-result h2{max-width:480px;margin-top:.7rem}.sk-result p{max-width:470px}.sk-result button{margin-top:1rem}.sk-page-error{margin:1rem 0;border:1px solid #fecaca;border-radius:10px;padding:.75rem;color:#b91c1c;background:#fef2f2;font-size:.75rem}.sk-loading{display:grid;min-height:240px;place-items:center;margin-top:1rem;color:#64748b}
        @media(max-width:1180px){.sk-metrics.student,.sk-metrics.admin{grid-template-columns:repeat(3,minmax(0,1fr))}.sk-skills-grid,.sk-chart-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sk-chart-grid>section:last-child{grid-column:1/-1}}@media(max-width:900px){.sk-hero{grid-template-columns:1fr 180px}.sk-attach-form{grid-template-columns:1fr 1fr}.sk-attach-form button{grid-column:1/-1}.sk-metrics.mentor{grid-template-columns:repeat(2,minmax(0,1fr))}.sk-discovery-head{align-items:stretch;flex-direction:column}.sk-discovery-head form{min-width:0;width:100%}}@media(max-width:720px){.sk-page{margin:-1rem;padding:1rem}.sk-hero{grid-template-columns:1fr;min-height:0;padding:1.35rem}.sk-hero-visual{display:none}.sk-metrics.student,.sk-metrics.admin{grid-template-columns:repeat(2,minmax(0,1fr))}.sk-skills-grid,.sk-chart-grid,.sk-students{grid-template-columns:1fr}.sk-chart-grid>section:last-child{grid-column:auto}.sk-catalog-form form{grid-template-columns:1fr}.sk-catalog-form button{width:100%}.sk-student-skills>span{align-items:flex-start;flex-wrap:wrap}}@media(max-width:500px){.sk-metrics.student,.sk-metrics.mentor,.sk-metrics.admin,.sk-attach-form{grid-template-columns:1fr}.sk-card-actions{flex-direction:column}.sk-modal{padding:1rem}.sk-modal-header{display:grid}.sk-student-skills small{display:block;width:100%;padding-left:30px}}
      `}</style>
      <div className="sk-page">
        <Hero role={role} total={skills.length} shared={analytics.shared} ready={analytics.ready} commonCategory={analytics.commonCategory} />
        {message ? <div className="sk-alert sk-alert-success">{message}</div> : null}
        {error ? <div className="sk-page-error">{error}</div> : null}
        {isLoading ? <div className="sk-card sk-loading">Loading SkillMap...</div> : null}
        {!isLoading ? (
          <>
            <div className={`sk-metrics ${role}`}>
              {role === 'student' ? <>
                <MetricCard icon="catalog" label="My skills" value={String(mySkills.length)} helper="Skills in your profile" color={colors.teal} />
                <MetricCard icon="clock" label="Ready for check" value={String(analytics.ready)} helper="Friendly checks available" color={colors.amber} delay={45} />
                <MetricCard icon="check" label="Verified" value={String(analytics.verified)} helper="Completed local checks" color={colors.green} delay={90} />
                <MetricCard icon="network" label="Peer profiles" value={String(students.length)} helper="Visible collaborators" color={colors.blue} delay={135} />
                <MetricCard icon="growth" label="Popular area" value={analytics.commonCategory} helper="Across shared skills" color={colors.violet} delay={180} />
              </> : role === 'mentor' ? <>
                <MetricCard icon="network" label="Skills shared" value={String(analytics.shared)} helper="Across visible profiles" color={colors.teal} />
                <MetricCard icon="check" label="Verified skills" value={String(analytics.verified)} helper="Current user's local checks" color={colors.green} delay={45} />
                <MetricCard icon="clock" label="Ready for check" value={String(analytics.ready)} helper="Current profile checkpoints" color={colors.amber} delay={90} />
                <MetricCard icon="growth" label="Common category" value={analytics.commonCategory} helper="Leading learning area" color={colors.blue} delay={135} />
              </> : <>
                <MetricCard icon="catalog" label="Catalog skills" value={String(skills.length)} helper="Available skill definitions" color={colors.navy} />
                <MetricCard icon="network" label="Student skills" value={String(analytics.shared)} helper="Profile connections" color={colors.teal} delay={40} />
                <MetricCard icon="check" label="Verified" value={String(analytics.verified)} helper="Local check results" color={colors.green} delay={80} />
                <MetricCard icon="clock" label="Ready for check" value={String(analytics.ready)} helper="Current profile checkpoints" color={colors.amber} delay={120} />
                <MetricCard icon="growth" label="Popular skill" value={analytics.popularSkill} helper="Most shared skill" color={colors.blue} delay={160} />
                <MetricCard icon="design" label="Active category" value={analytics.commonCategory} helper="Most represented area" color={colors.violet} delay={200} />
              </>}
            </div>
            <AddSkillPanel skills={skills} onReload={() => loadData()} onMessage={setMessage} />
            <section style={{ marginTop: '1rem' }}><SectionHeading eyebrow={role === 'student' ? 'Personal SkillMap' : 'Current profile'} title={role === 'student' ? 'My skill growth' : 'My attached skills'} description="Practice status and friendly checks use each skill's real attachment date." />{mySkills.length ? <div className="sk-skills-grid">{mySkills.map((skill) => <SkillCard key={skill.skillId} skill={skill} result={checkResults[skill.skillId]} onCheck={setActiveCheck} onRemove={(skillId) => void handleRemove(skillId)} />)}</div> : <EmptyState title="No skills attached yet" text="Choose one skill above to begin building your map." />}</section>
            <div className="sk-chart-grid"><CategoryChart studentSkills={students} /><LevelChart students={students} /><StatusChart mySkills={mySkills} results={checkResults} /></div>
            <Discovery students={students} search={search} setSearch={setSearch} onSearch={handleSearch} />
          </>
        ) : null}
      </div>
      {activeCheck ? <SkillCheck skill={activeCheck} onClose={() => setActiveCheck(null)} onComplete={(result) => saveResult(activeCheck.skillId, result)} /> : null}
    </>
  );
}
