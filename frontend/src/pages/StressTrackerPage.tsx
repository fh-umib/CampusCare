import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { stressService } from '../services/stressService';
import type { StressLevel, StressRecord, StressSummary } from '../types/stress';
import { formatDate } from '../utils/formatDate';

type Role = 'student' | 'mentor' | 'admin';
type IconName = 'pulse' | 'shield' | 'subject' | 'calendar' | 'records' | 'trend' | 'attention' | 'insight' | 'arrow';

const levelDetails: Record<StressLevel, { label: string; color: string; soft: string; message: string }> = {
  1: { label: 'Low', color: '#0d9e8a', soft: '#e8f8f5', message: 'Pressure feels manageable. Keep your steady rhythm.' },
  2: { label: 'Mild', color: '#1687b8', soft: '#eaf6fb', message: 'A little pressure is present. A short plan may help.' },
  3: { label: 'Medium', color: '#4f6fca', soft: '#eef2ff', message: 'Pause, prioritize, and choose one clear next step.' },
  4: { label: 'High', color: '#d97706', soft: '#fff7e8', message: 'Consider asking a mentor or classmate for support.' },
  5: { label: 'Very High', color: '#dc5f45', soft: '#fff1ee', message: 'Take a breath and reach out. You do not need to carry this alone.' }
};

const iconPaths: Record<IconName, ReactNode> = {
  pulse: <><path d="M3 13h4l2-6 3.2 11 2.5-8 1.8 3H21" /><path d="M4 21h16" /></>,
  shield: <><path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></>,
  subject: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  records: <><path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  trend: <><path d="m4 17 5-5 4 3 7-8" /><path d="M15 7h5v5" /></>,
  attention: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
  insight: <><path d="M9 18h6M10 22h4" /><path d="M8.3 15.2A7 7 0 1 1 15.7 15c-.8.6-1.2 1.3-1.2 2h-5c0-.8-.4-1.3-1.2-1.8Z" /></>,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />
};

function Icon({ name, size = 40, color = '#0d9e8a', background = 'rgba(13,158,138,.1)' }: {
  name: IconName;
  size?: number;
  color?: string;
  background?: string;
}) {
  return (
    <span className="st-icon" style={{ width: size, height: size, color, background }}>
      <svg aria-hidden="true" width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {iconPaths[name]}
      </svg>
    </span>
  );
}

function average(records: StressRecord[]) {
  return records.length ? records.reduce((sum, record) => sum + record.stressLevel, 0) / records.length : 0;
}

function latestRecord(records: StressRecord[]) {
  return [...records].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
}

function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return (
    <div className="st-section-heading">
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="st-empty">
      <Icon name="pulse" size={44} color="#94a3b8" background="#eef4f8" />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function Hero({ role, total, averageLevel, highCount, topSubject }: {
  role: Role;
  total: number;
  averageLevel: number;
  highCount: number;
  topSubject: string;
}) {
  const content = role === 'student'
    ? {
        eyebrow: 'Private academic check-in',
        title: 'Track exam pressure before it becomes too much.',
        description: 'Record how each subject feels this week and notice patterns early. Small check-ins can prevent big overwhelm.',
        badges: ['Private check-in', 'Subject-based tracking', 'Weekly stress pattern']
      }
    : role === 'mentor'
      ? {
          eyebrow: 'Mentor wellbeing view',
          title: 'Notice academic pressure early.',
          description: 'Review stress patterns by subject and identify where students may benefit from calm, practical guidance.',
          badges: [`${highCount} high-pressure records`, `${topSubject} leads current pressure`, `${averageLevel.toFixed(1)} average level`]
        }
      : {
          eyebrow: 'Stress module active',
          title: 'ExamStress overview.',
          description: 'Monitor academic pressure trends across subjects and use real check-in data to support faculty planning.',
          badges: [`${total} total records`, `${highCount} high-pressure signals`, `${topSubject} highest subject`]
        };

  return (
    <section className="st-hero st-reveal">
      <div>
        <span className="st-eyebrow"><i />{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <div className="st-hero-badges">
          {content.badges.map((badge) => <span key={badge}>{badge}</span>)}
        </div>
        {role === 'student' ? (
          <div className="st-hero-actions">
            <a className="st-hero-primary" href="#stress-form">Log stress <Icon name="arrow" size={22} color="#fff" background="transparent" /></a>
            <a className="st-hero-secondary" href="#stress-records">View records</a>
          </div>
        ) : null}
      </div>
      <div className="st-hero-visual">
        <div className="st-pulse-ring"><Icon name="pulse" size={58} color="#67e3d6" background="rgba(103,227,214,.1)" /></div>
        <span>Pressure becomes easier to manage when you can see it clearly.</span>
      </div>
    </section>
  );
}

function MetricCard({ icon, label, value, helper, color, delay = 0 }: {
  icon: IconName;
  label: string;
  value: string;
  helper: string;
  color: string;
  delay?: number;
}) {
  return (
    <article className="st-card st-metric st-lift st-reveal" style={{ animationDelay: `${delay}ms` }}>
      <div className="st-metric-top">
        <Icon name={icon} color={color} background={`${color}14`} />
        <i style={{ background: color }} />
      </div>
      <span className="st-label">{label}</span>
      <strong style={{ color }}>{value}</strong>
      <p>{helper}</p>
    </article>
  );
}

function StressForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({ subject: '', stress_level: 3 as StressLevel, note: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selected = levelDetails[form.stress_level];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      setIsSubmitting(true);
      await stressService.create({
        subject: form.subject.trim() || undefined,
        stress_level: form.stress_level,
        note: form.note.trim() || undefined
      });
      setForm({ subject: '', stress_level: 3, note: '' });
      setMessage('Stress check-in saved. Thank you for taking a moment to notice how you feel.');
      await onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="st-card st-form" id="stress-form" onSubmit={handleSubmit}>
      <SectionHeading eyebrow="Personal check-in" title="Log exam pressure" description="Share only what feels useful. This is a reflection tool, not a grade." />
      {message ? <div className="st-alert st-alert-success">{message}</div> : null}
      {error ? <div className="st-alert st-alert-error">{error}</div> : null}
      <label>
        <span className="st-field-label">Subject</span>
        <input className="st-input" placeholder="e.g. Databases" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
      </label>
      <div>
        <div className="st-slider-heading">
          <span className="st-field-label">Stress level</span>
          <strong style={{ color: selected.color }}>{form.stress_level} · {selected.label}</strong>
        </div>
        <input
          aria-label="Stress level from 1 to 5"
          className="st-range"
          min={1}
          max={5}
          step={1}
          type="range"
          value={form.stress_level}
          onChange={(event) => setForm((current) => ({ ...current, stress_level: Number(event.currentTarget.value) as StressLevel }))}
          style={{ accentColor: selected.color }}
        />
        <div className="st-level-options">
          {([1, 2, 3, 4, 5] as StressLevel[]).map((level) => (
            <button
              aria-label={`Select ${levelDetails[level].label} stress`}
              className={form.stress_level === level ? 'is-active' : ''}
              key={level}
              onClick={() => setForm((current) => ({ ...current, stress_level: level }))}
              style={{ '--level-color': levelDetails[level].color, '--level-soft': levelDetails[level].soft } as React.CSSProperties}
              type="button"
            >
              <b>{level}</b><span>{levelDetails[level].label}</span>
            </button>
          ))}
        </div>
        <p className="st-level-message" style={{ borderColor: selected.color, background: selected.soft }}>{selected.message}</p>
      </div>
      <label>
        <span className="st-field-label">Optional note</span>
        <textarea className="st-input st-textarea" placeholder="What is making this subject feel difficult right now?" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
      </label>
      <button className="st-primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving check-in...' : 'Save stress record'}
        <Icon name="arrow" size={24} color="#fff" background="transparent" />
      </button>
    </form>
  );
}

function SubjectChart({ summary }: { summary: StressSummary[] }) {
  const rows = summary
    .filter((item) => item.subject)
    .sort((a, b) => Number(b.averageStressLevel) - Number(a.averageStressLevel))
    .slice(0, 7);

  return (
    <section className="st-card st-chart-card">
      <SectionHeading eyebrow="Subject pattern" title="Stress by subject" description="Average recorded pressure for each visible subject." />
      {!rows.length ? <EmptyState title="No subject patterns yet" text="Subject averages will appear after check-ins are recorded." /> : (
        <div className="st-subject-bars">
          {rows.map((item, index) => {
            const level = Math.max(0, Math.min(5, Number(item.averageStressLevel)));
            const roundedLevel = Math.max(1, Math.round(level)) as StressLevel;
            return (
              <div className="st-bar-row" key={item.subject ?? index}>
                <div><span>{item.subject}</span><small>{item.count} record{item.count === 1 ? '' : 's'}</small></div>
                <div className="st-bar-track"><span style={{ width: `${Math.max(4, level * 20)}%`, background: levelDetails[roundedLevel].color, animationDelay: `${index * 70}ms` }} /></div>
                <strong>{level.toFixed(1)}</strong>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TrendChart({ records }: { records: StressRecord[] }) {
  const ordered = [...records]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .slice(-10);
  const points = ordered.map((record, index) => ({
    x: ordered.length === 1 ? 50 : 6 + (index / (ordered.length - 1)) * 88,
    y: 90 - ((record.stressLevel - 1) / 4) * 72,
    record
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <section className="st-card st-chart-card">
      <SectionHeading eyebrow="Recent pattern" title="Stress over time" description="Your latest visible check-ins, ordered by date." />
      {!ordered.length ? <EmptyState title="No trend to show" text="A line will form as more check-ins are added." /> : (
        <>
          <div className="st-trend-wrap">
            <svg aria-label="Stress level trend" role="img" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[18, 36, 54, 72, 90].map((y) => <line key={y} x1="5" x2="95" y1={y} y2={y} stroke="#e5edf4" strokeWidth=".7" />)}
              {points.length > 1 ? <polyline points={line} fill="none" stroke="#0d9e8a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /> : null}
              {points.map((point) => <circle key={point.record.id} cx={point.x} cy={point.y} r="2.2" fill={levelDetails[point.record.stressLevel].color} stroke="#fff" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />)}
            </svg>
            <div className="st-trend-scale"><span>5</span><span>3</span><span>1</span></div>
          </div>
          <div className="st-trend-dates">
            <span>{formatDate(ordered[0].recordedAt)}</span>
            <span>{formatDate(ordered[ordered.length - 1].recordedAt)}</span>
          </div>
        </>
      )}
    </section>
  );
}

function Distribution({ records }: { records: StressRecord[] }) {
  const counts = ([1, 2, 3, 4, 5] as StressLevel[]).map((level) => ({
    level,
    count: records.filter((record) => record.stressLevel === level).length
  }));
  const total = records.length;

  return (
    <section className="st-card st-chart-card">
      <SectionHeading eyebrow="Level balance" title="Stress distribution" description="How visible records are distributed across the five levels." />
      {!total ? <EmptyState title="No level distribution yet" text="Your stress levels will be summarized here." /> : (
        <>
          <div className="st-segments">
            {counts.map(({ level, count }) => count ? (
              <span key={level} style={{ width: `${(count / total) * 100}%`, background: levelDetails[level].color }} title={`${levelDetails[level].label}: ${count}`} />
            ) : null)}
          </div>
          <div className="st-distribution-list">
            {counts.map(({ level, count }) => (
              <div key={level}>
                <i style={{ background: levelDetails[level].color }} />
                <span>{level} · {levelDetails[level].label}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function PressureRanking({ summary }: { summary: StressSummary[] }) {
  const ranked = summary.filter((item) => item.subject).sort((a, b) => Number(b.averageStressLevel) - Number(a.averageStressLevel)).slice(0, 5);

  return (
    <section className="st-card st-chart-card">
      <SectionHeading eyebrow="Attention order" title="Highest pressure subjects" description="Subjects ranked by their current average stress level." />
      {!ranked.length ? <EmptyState title="No high-pressure subjects yet" text="Subject rankings will appear when data is available." /> : (
        <div className="st-ranking">
          {ranked.map((item, index) => {
            const level = Math.max(1, Math.round(Number(item.averageStressLevel))) as StressLevel;
            return (
              <div key={item.subject ?? index}>
                <span>{index + 1}</span>
                <div><strong>{item.subject}</strong><small>{item.count} check-in{item.count === 1 ? '' : 's'}</small></div>
                <b style={{ color: levelDetails[level].color }}>{Number(item.averageStressLevel).toFixed(1)}</b>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InsightCard({ records, summary, role }: { records: StressRecord[]; summary: StressSummary[]; role: Role }) {
  const avg = average(records);
  const top = [...summary].filter((item) => item.subject).sort((a, b) => Number(b.averageStressLevel) - Number(a.averageStressLevel))[0];
  const high = records.filter((record) => record.stressLevel >= 4).length;
  const text = !records.length
    ? 'No stress records are visible yet. Start with one subject today to create a useful baseline.'
    : role === 'student'
      ? top
        ? `${top.subject} currently has your highest recorded average. Your overall level is ${avg.toFixed(1)}, so regular check-ins can help you notice change early.`
        : `Your current average is ${avg.toFixed(1)}. Keep checking in before exam pressure builds.`
      : high
        ? `${high} visible record${high === 1 ? '' : 's'} reached level 4 or 5${top ? `, with ${top.subject} leading the subject averages` : ''}. Calm, concrete support may be useful.`
        : 'No level 4 or 5 records are currently visible. Continue watching subject patterns as exam periods approach.';

  return (
    <section className="st-card st-insight">
      <Icon name="insight" size={48} color="#0d9e8a" background="rgba(13,158,138,.1)" />
      <div>
        <span className="st-label">Current insight</span>
        <h2>{role === 'student' ? 'Your pattern, in context' : 'Support planning signal'}</h2>
        <p>{text}</p>
      </div>
    </section>
  );
}

function Records({ records, role }: { records: StressRecord[]; role: Role }) {
  const ordered = [...records].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  return (
    <section className="st-card st-records" id="stress-records">
      <SectionHeading
        eyebrow={role === 'student' ? 'Personal history' : 'Operational view'}
        title={role === 'student' ? 'Recent check-ins' : 'Recent stress records'}
        description={role === 'student' ? 'A calm record of your latest subject check-ins.' : 'Latest visible records, with high-pressure entries shown clearly.'}
      />
      {!ordered.length ? <EmptyState title="No stress records yet" text="Start with one subject today." /> : (
        <div className="st-record-list">
          {ordered.slice(0, role === 'student' ? 8 : 12).map((record) => {
            const detail = levelDetails[record.stressLevel];
            return (
              <article key={record.id} style={{ '--record-color': detail.color } as React.CSSProperties}>
                <div className="st-record-level" style={{ color: detail.color, background: detail.soft }}>
                  <strong>{record.stressLevel}</strong><span>{detail.label}</span>
                </div>
                <div className="st-record-content">
                  <div>
                    <h3>{record.subject || 'General academic pressure'}</h3>
                    <span>{role === 'student' ? 'Private check-in' : record.studentName || 'Student record'} · {formatDate(record.recordedAt)}</span>
                  </div>
                  {record.note ? <p>{record.note}</p> : <p className="st-muted-note">No note added for this check-in.</p>}
                </div>
                {record.stressLevel >= 4 ? <span className="st-attention-badge"><i />Attention</span> : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AttentionBoard({ records }: { records: StressRecord[] }) {
  const ordered = [...records].sort((a, b) => b.stressLevel - a.stressLevel || new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()).slice(0, 7);

  return (
    <section className="st-card st-chart-card">
      <SectionHeading eyebrow="Priority view" title="Stress attention board" description="Higher pressure records appear first for a focused review." />
      {!ordered.length ? <EmptyState title="No records need review" text="Stress check-ins will appear here by priority." /> : (
        <div className="st-attention-list">
          {ordered.map((record) => {
            const detail = levelDetails[record.stressLevel];
            return (
              <div key={record.id}>
                <span className="st-level-dot" style={{ color: detail.color, background: detail.soft }}>{record.stressLevel}</span>
                <div><strong>{record.subject || 'General pressure'}</strong><small>{record.studentName || 'Student check-in'} · {formatDate(record.recordedAt)}</small></div>
                <span style={{ color: detail.color }}>{detail.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Guidance({ role }: { role: Role }) {
  const items = role === 'student'
    ? ['Name the subject causing pressure.', 'Break the next task into one small step.', 'Ask for help before the deadline feels urgent.', 'Use Silent Help when a question feels difficult to raise publicly.']
    : role === 'mentor'
      ? ['Ask one clarifying question.', 'Suggest one concrete next step.', 'Encourage the student calmly.', 'Avoid judgment or assumptions.']
      : ['Use trends for support planning, not diagnosis.', 'Watch repeated level 4-5 subject patterns.', 'Coordinate review sessions where pressure repeats.', 'Keep individual check-ins appropriately private.'];

  return (
    <section className="st-card st-guidance">
      <Icon name={role === 'student' ? 'shield' : 'insight'} size={44} color="#2563eb" background="rgba(37,99,235,.08)" />
      <div>
        <span className="st-label">{role === 'student' ? 'A steadier next step' : role === 'mentor' ? 'Mentor response tone' : 'Responsible interpretation'}</span>
        <h2>{role === 'student' ? 'When pressure rises' : role === 'mentor' ? 'Support with clarity and care' : 'Turn patterns into practical support'}</h2>
        <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </section>
  );
}

export default function StressTrackerPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<StressRecord[]>([]);
  const [summary, setSummary] = useState<StressSummary[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const role: Role = user?.role === 'mentor' || user?.role === 'admin' ? user.role : 'student';

  async function loadData() {
    setError('');
    try {
      setIsLoading(true);
      const [recordsData, summaryData] = await Promise.all([stressService.list(), stressService.summary()]);
      setRecords(recordsData);
      setSummary(summaryData);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const analytics = useMemo(() => {
    const avg = average(records);
    const highCount = records.filter((record) => record.stressLevel >= 4).length;
    const latest = latestRecord(records);
    const subjectRows = summary.filter((item) => item.subject);
    const top = [...subjectRows].sort((a, b) => Number(b.averageStressLevel) - Number(a.averageStressLevel))[0];
    const prior = [...records].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    const recentAverage = average(prior.slice(0, Math.ceil(prior.length / 2)));
    const earlierAverage = average(prior.slice(Math.ceil(prior.length / 2)));
    const direction = prior.length < 2 ? 'More check-ins will reveal change' : recentAverage < earlierAverage ? 'Recent pressure is trending lower' : recentAverage > earlierAverage ? 'Recent pressure is trending higher' : 'Pressure is currently steady';

    return {
      average: avg,
      highCount,
      latest,
      topSubject: top?.subject || 'No subject yet',
      activeSubjects: new Set(records.map((record) => record.subject).filter(Boolean)).size,
      direction
    };
  }, [records, summary]);

  const sharedCharts = (
    <>
      <SubjectChart summary={summary} />
      <TrendChart records={records} />
      <Distribution records={records} />
      <PressureRanking summary={summary} />
    </>
  );

  return (
    <>
      <style>{`
        @keyframes stReveal { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes stGrow { from { transform:scaleX(0); } to { transform:scaleX(1); } }
        @keyframes stPulse { 0%,100% { box-shadow:0 0 0 0 rgba(217,119,6,.18); } 50% { box-shadow:0 0 0 6px rgba(217,119,6,0); } }
        .st-page { margin:-2rem; min-height:100vh; padding:2rem; overflow:hidden; color:#0b1d35; background:radial-gradient(circle at 92% 4%,rgba(13,158,138,.11),transparent 25rem),radial-gradient(circle at 0 48%,rgba(37,99,235,.07),transparent 28rem),linear-gradient(180deg,#f8fbff,#eef4f8); font-family:"DM Sans",sans-serif; }
        .st-page * { box-sizing:border-box; }
        .st-reveal { animation:stReveal .45s ease both; }
        .st-card { min-width:0; border:1px solid #dfeaf3; border-radius:18px; background:rgba(255,255,255,.92); box-shadow:0 12px 32px rgba(15,23,42,.055); backdrop-filter:blur(12px); }
        .st-lift { transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease; }
        .st-lift:hover { transform:translateY(-3px); border-color:rgba(13,158,138,.28); box-shadow:0 18px 42px rgba(15,23,42,.1); }
        .st-icon { display:inline-flex; flex:none; align-items:center; justify-content:center; border-radius:30%; }
        .st-hero { position:relative; display:grid; grid-template-columns:minmax(0,1fr) 260px; align-items:center; gap:2rem; min-height:250px; overflow:hidden; padding:2rem; border:1px solid rgba(255,255,255,.09); border-radius:24px; color:#fff; background:radial-gradient(circle at 88% 5%,rgba(103,227,214,.24),transparent 31%),linear-gradient(135deg,#071527,#0b1d35 56%,#0f3b52); box-shadow:0 20px 46px rgba(11,29,53,.18); }
        .st-hero::after { content:""; position:absolute; right:-75px; bottom:-130px; width:330px; height:330px; border:1px solid rgba(103,227,214,.12); border-radius:50%; }
        .st-hero > * { position:relative; z-index:1; }
        .st-eyebrow { display:inline-flex; align-items:center; gap:7px; border:1px solid rgba(103,227,214,.22); border-radius:999px; padding:.36rem .76rem; background:rgba(103,227,214,.08); color:#bdf8ef; font-size:.68rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .st-eyebrow i { width:7px; height:7px; border-radius:50%; background:#67e3d6; }
        .st-hero h1 { max-width:760px; margin:.9rem 0 .55rem; font-family:"Sora",sans-serif; font-size:clamp(1.75rem,3.2vw,2.65rem); line-height:1.14; letter-spacing:-.02em; }
        .st-hero p { max-width:720px; margin:0; color:rgba(255,255,255,.68); font-size:.9rem; line-height:1.7; }
        .st-hero-badges { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:1.15rem; }
        .st-hero-badges span { border:1px solid rgba(255,255,255,.1); border-radius:999px; padding:.38rem .7rem; background:rgba(255,255,255,.06); color:rgba(255,255,255,.78); font-size:.68rem; font-weight:700; }
        .st-hero-actions { display:flex; flex-wrap:wrap; gap:.55rem; margin-top:1rem; }
        .st-hero-actions a { display:inline-flex; min-height:39px; align-items:center; justify-content:center; gap:.35rem; border-radius:10px; padding:.5rem .85rem; color:#fff; font-size:.72rem; font-weight:800; text-decoration:none; transition:transform .18s ease,background .18s ease; }
        .st-hero-actions a:hover { transform:translateY(-2px); }
        .st-hero-primary { background:#0d9e8a; box-shadow:0 8px 20px rgba(13,158,138,.22); }
        .st-hero-secondary { border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.07); }
        .st-hero-visual { display:grid; justify-items:center; gap:.85rem; text-align:center; }
        .st-pulse-ring { display:grid; place-items:center; width:126px; height:126px; border:1px solid rgba(103,227,214,.2); border-radius:50%; background:rgba(255,255,255,.045); box-shadow:inset 0 0 0 14px rgba(255,255,255,.022); }
        .st-hero-visual > span { max-width:210px; color:rgba(255,255,255,.58); font-size:.7rem; line-height:1.55; }
        .st-section-heading > span,.st-label { display:block; color:#0d9e8a; font-size:.64rem; font-weight:850; letter-spacing:.08em; text-transform:uppercase; }
        .st-section-heading h2 { margin:.25rem 0 0; font-family:"Sora",sans-serif; font-size:1.05rem; line-height:1.35; }
        .st-section-heading p { margin:.3rem 0 0; color:#64748b; font-size:.74rem; line-height:1.55; }
        .st-metrics { display:grid; gap:1rem; margin-top:1.2rem; }
        .st-metrics-student { grid-template-columns:repeat(5,minmax(0,1fr)); }
        .st-metrics-mentor { grid-template-columns:repeat(4,minmax(0,1fr)); }
        .st-metrics-admin { grid-template-columns:repeat(6,minmax(0,1fr)); }
        .st-metric { padding:1rem; }
        .st-metric-top { display:flex; align-items:center; justify-content:space-between; }
        .st-metric-top i { width:32px; height:3px; border-radius:999px; opacity:.72; }
        .st-metric .st-label { margin-top:.8rem; color:#64748b; }
        .st-metric > strong { display:block; margin:.3rem 0 .2rem; overflow:hidden; font-family:"Sora",sans-serif; font-size:1.45rem; line-height:1.2; text-overflow:ellipsis; text-transform:capitalize; white-space:nowrap; }
        .st-metric p { margin:0; color:#94a3b8; font-size:.68rem; line-height:1.45; }
        .st-student-top { display:grid; grid-template-columns:minmax(340px,.88fr) minmax(0,1.12fr); gap:1rem; margin-top:1rem; }
        .st-form { padding:1.35rem; }
        .st-form label,.st-form > div:not(.st-section-heading):not(.st-alert) { display:block; margin-top:1rem; }
        .st-field-label { display:block; margin-bottom:.42rem; color:#334155; font-size:.72rem; font-weight:800; }
        .st-input { width:100%; min-height:43px; border:1px solid #d8e4ed; border-radius:10px; outline:none; padding:.7rem .8rem; color:#0b1d35; background:#f9fcfe; font:inherit; font-size:.78rem; transition:.18s ease; }
        .st-input:focus { border-color:#0d9e8a; box-shadow:0 0 0 3px rgba(13,158,138,.1); background:#fff; }
        .st-textarea { min-height:82px; resize:vertical; }
        .st-slider-heading { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
        .st-slider-heading .st-field-label { margin:0; }
        .st-slider-heading strong { font-size:.78rem; }
        .st-range { display:block; width:100%; margin:.7rem 0 .5rem; cursor:pointer; }
        .st-level-options { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:.35rem; }
        .st-level-options button { display:grid; justify-items:center; gap:.12rem; min-width:0; border:1px solid #e1eaf1; border-radius:9px; padding:.42rem .2rem; color:#64748b; background:#f8fbfd; cursor:pointer; transition:.18s ease; }
        .st-level-options button:hover,.st-level-options button.is-active { border-color:var(--level-color); color:var(--level-color); background:var(--level-soft); transform:translateY(-1px); }
        .st-level-options b { font-family:"Sora",sans-serif; font-size:.8rem; }
        .st-level-options span { overflow:hidden; max-width:100%; font-size:.57rem; text-overflow:ellipsis; white-space:nowrap; }
        .st-level-message { margin:.65rem 0 0; border-left:3px solid; border-radius:7px; padding:.55rem .65rem; color:#475569; font-size:.68rem; line-height:1.5; }
        .st-primary-button { display:flex; width:100%; min-height:43px; align-items:center; justify-content:center; gap:.45rem; margin-top:1rem; border:0; border-radius:10px; padding:.65rem 1rem; color:#fff; background:#0d9e8a; box-shadow:0 8px 20px rgba(13,158,138,.2); font:inherit; font-size:.76rem; font-weight:800; cursor:pointer; }
        .st-primary-button:disabled { cursor:not-allowed; opacity:.65; }
        .st-alert { margin-top:1rem; border-radius:9px; padding:.65rem .75rem; font-size:.72rem; line-height:1.45; }
        .st-alert-success { border:1px solid #bbebdc; color:#047857; background:#ecfdf5; }
        .st-alert-error { border:1px solid #fecaca; color:#b91c1c; background:#fef2f2; }
        .st-chart-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; margin-top:1rem; }
        .st-chart-card { padding:1.25rem; }
        .st-subject-bars { display:grid; gap:.85rem; margin-top:1.1rem; }
        .st-bar-row { display:grid; grid-template-columns:minmax(110px,.75fr) minmax(120px,2fr) 34px; align-items:center; gap:.7rem; }
        .st-bar-row > div:first-child { display:grid; }
        .st-bar-row span { overflow:hidden; color:#334155; font-size:.72rem; font-weight:750; text-overflow:ellipsis; white-space:nowrap; }
        .st-bar-row small { margin-top:.12rem; color:#94a3b8; font-size:.59rem; }
        .st-bar-row strong { color:#0b1d35; font-family:"Sora",sans-serif; font-size:.72rem; text-align:right; }
        .st-bar-track { height:9px; overflow:hidden; border-radius:999px; background:#e8eff5; }
        .st-bar-track span { display:block; height:100%; border-radius:999px; transform-origin:left; animation:stGrow .7s ease both; }
        .st-trend-wrap { position:relative; height:190px; margin-top:1rem; padding-left:22px; }
        .st-trend-wrap svg { width:100%; height:100%; overflow:visible; }
        .st-trend-scale { position:absolute; inset:4px auto 5px 0; display:flex; flex-direction:column; justify-content:space-between; color:#94a3b8; font-size:.58rem; }
        .st-trend-dates { display:flex; justify-content:space-between; margin:.3rem 0 0 22px; color:#94a3b8; font-size:.6rem; }
        .st-segments { display:flex; height:14px; overflow:hidden; margin-top:1.1rem; border-radius:999px; background:#e8eff5; }
        .st-segments span { height:100%; transform-origin:left; animation:stGrow .7s ease both; }
        .st-distribution-list { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:.45rem; margin-top:1rem; }
        .st-distribution-list > div { display:grid; justify-items:center; gap:.22rem; border:1px solid #e8eff5; border-radius:9px; padding:.55rem .25rem; background:#f8fbfd; }
        .st-distribution-list i { width:7px; height:7px; border-radius:50%; }
        .st-distribution-list span { color:#64748b; font-size:.58rem; text-align:center; }
        .st-distribution-list strong { font-family:"Sora",sans-serif; font-size:.82rem; }
        .st-ranking { display:grid; gap:.45rem; margin-top:1rem; }
        .st-ranking > div { display:grid; grid-template-columns:28px minmax(0,1fr) auto; align-items:center; gap:.65rem; border-bottom:1px solid #edf2f7; padding:.55rem 0; }
        .st-ranking > div:last-child { border-bottom:0; }
        .st-ranking > div > span { display:grid; place-items:center; width:27px; height:27px; border-radius:8px; color:#0d9e8a; background:#e8f8f5; font-size:.65rem; font-weight:850; }
        .st-ranking div div { display:grid; }
        .st-ranking div div strong { font-size:.73rem; }
        .st-ranking small { margin-top:.12rem; color:#94a3b8; font-size:.6rem; }
        .st-ranking b { font-family:"Sora",sans-serif; font-size:.82rem; }
        .st-insight,.st-guidance { display:grid; grid-template-columns:auto minmax(0,1fr); align-items:start; gap:1rem; padding:1.25rem; }
        .st-insight h2,.st-guidance h2 { margin:.3rem 0; font-family:"Sora",sans-serif; font-size:1rem; line-height:1.4; }
        .st-insight p { margin:0; color:#64748b; font-size:.75rem; line-height:1.65; }
        .st-guidance ul { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.45rem 1rem; margin:.7rem 0 0; padding:0; list-style:none; }
        .st-guidance li { position:relative; padding-left:14px; color:#64748b; font-size:.7rem; line-height:1.45; }
        .st-guidance li::before { content:""; position:absolute; top:.45rem; left:0; width:5px; height:5px; border-radius:50%; background:#0d9e8a; }
        .st-records { margin-top:1rem; padding:1.25rem; }
        .st-record-list { display:grid; gap:.55rem; margin-top:1rem; }
        .st-record-list article { display:grid; grid-template-columns:72px minmax(0,1fr) auto; align-items:center; gap:.9rem; border:1px solid #e5edf4; border-left:3px solid var(--record-color); border-radius:12px; padding:.75rem; background:#fbfdff; }
        .st-record-level { display:grid; justify-items:center; border-radius:9px; padding:.45rem; }
        .st-record-level strong { font-family:"Sora",sans-serif; font-size:1rem; }
        .st-record-level span { margin-top:.1rem; font-size:.56rem; font-weight:800; text-align:center; }
        .st-record-content { min-width:0; }
        .st-record-content h3 { margin:0; overflow:hidden; font-size:.77rem; text-overflow:ellipsis; white-space:nowrap; }
        .st-record-content div > span { display:block; margin-top:.16rem; color:#94a3b8; font-size:.6rem; }
        .st-record-content p { margin:.35rem 0 0; overflow:hidden; color:#64748b; font-size:.69rem; line-height:1.45; text-overflow:ellipsis; white-space:nowrap; }
        .st-record-content .st-muted-note { color:#a8b5c4; font-style:italic; }
        .st-attention-badge { display:inline-flex; align-items:center; gap:5px; border-radius:999px; padding:.3rem .55rem; color:#b45309; background:#fff7ed; font-size:.58rem; font-weight:850; text-transform:uppercase; }
        .st-attention-badge i { width:6px; height:6px; border-radius:50%; background:#d97706; animation:stPulse 2s infinite; }
        .st-attention-list { display:grid; gap:.45rem; margin-top:1rem; }
        .st-attention-list > div { display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:.65rem; border-bottom:1px solid #edf2f7; padding:.55rem 0; }
        .st-attention-list > div:last-child { border-bottom:0; }
        .st-level-dot { display:grid; place-items:center; width:30px; height:30px; border-radius:9px; font-family:"Sora",sans-serif; font-size:.72rem; font-weight:800; }
        .st-attention-list div div { display:grid; }
        .st-attention-list strong { overflow:hidden; font-size:.72rem; text-overflow:ellipsis; white-space:nowrap; }
        .st-attention-list small { margin-top:.12rem; color:#94a3b8; font-size:.59rem; }
        .st-attention-list > div > span:last-child { font-size:.62rem; font-weight:800; }
        .st-empty { display:grid; min-height:160px; place-items:center; align-content:center; gap:.45rem; margin-top:1rem; border:1px dashed #d5e2ec; border-radius:12px; padding:1rem; background:#f8fbfd; text-align:center; }
        .st-empty strong { font-size:.76rem; }
        .st-empty > span:last-child { max-width:290px; color:#94a3b8; font-size:.67rem; line-height:1.5; }
        .st-role-grid { display:grid; grid-template-columns:minmax(280px,.72fr) minmax(0,1.28fr); gap:1rem; margin-top:1rem; }
        .st-footer-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem; }
        .st-page-error { margin:1rem 0; border:1px solid #fecaca; border-radius:10px; padding:.75rem; color:#b91c1c; background:#fef2f2; font-size:.75rem; }
        .st-loading { display:grid; min-height:260px; place-items:center; margin-top:1rem; color:#64748b; }
        @media(max-width:1180px) { .st-metrics-student,.st-metrics-admin { grid-template-columns:repeat(3,minmax(0,1fr)); } }
        @media(max-width:960px) { .st-hero { grid-template-columns:1fr 180px; } .st-student-top,.st-role-grid { grid-template-columns:1fr; } .st-metrics-mentor { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media(max-width:760px) { .st-page { margin:-1rem; padding:1rem; } .st-hero { grid-template-columns:1fr; min-height:0; padding:1.35rem; } .st-hero-visual { display:none; } .st-metrics-student,.st-metrics-admin { grid-template-columns:repeat(2,minmax(0,1fr)); } .st-chart-grid,.st-footer-grid { grid-template-columns:1fr; } .st-guidance ul { grid-template-columns:1fr; } }
        @media(max-width:520px) { .st-metrics-student,.st-metrics-mentor,.st-metrics-admin { grid-template-columns:1fr; } .st-level-options { gap:.22rem; } .st-level-options button { padding:.4rem .08rem; } .st-level-options span { font-size:.5rem; } .st-distribution-list { grid-template-columns:repeat(5,minmax(42px,1fr)); overflow-x:auto; padding-bottom:.25rem; } .st-bar-row { grid-template-columns:95px minmax(90px,1fr) 28px; gap:.45rem; } .st-record-list article { grid-template-columns:58px minmax(0,1fr); } .st-attention-badge { grid-column:2; justify-self:start; } }
      `}</style>

      <div className="st-page">
        <Hero role={role} total={records.length} averageLevel={analytics.average} highCount={analytics.highCount} topSubject={analytics.topSubject} />
        {error ? <div className="st-page-error">{error}</div> : null}
        {isLoading ? <div className="st-card st-loading">Loading ExamStress insights...</div> : null}

        {!isLoading && role === 'student' ? (
          <>
            <div className="st-student-top">
              <StressForm onSaved={loadData} />
              <div>
                <div className="st-metrics st-metrics-student" style={{ marginTop: 0 }}>
                  <MetricCard icon="pulse" label="Average stress" value={`${analytics.average.toFixed(1)} / 5`} helper={analytics.direction} color="#0d9e8a" />
                  <MetricCard icon="subject" label="Highest pressure" value={analytics.topSubject} helper="Based on subject averages" color="#d97706" delay={45} />
                  <MetricCard icon="records" label="My records" value={String(records.length)} helper="Visible personal check-ins" color="#2563eb" delay={90} />
                  <MetricCard icon="calendar" label="Last check-in" value={analytics.latest ? formatDate(analytics.latest.recordedAt) : 'Not yet'} helper={analytics.latest?.subject || 'Start with one subject'} color="#7c3aed" delay={135} />
                  <MetricCard icon="trend" label="Recent direction" value={analytics.direction.includes('lower') ? 'Improving' : analytics.direction.includes('higher') ? 'Rising' : 'Steady'} helper={analytics.direction} color="#059669" delay={180} />
                </div>
                <div style={{ marginTop: '1rem' }}><InsightCard records={records} summary={summary} role={role} /></div>
              </div>
            </div>
            <div className="st-chart-grid">{sharedCharts}</div>
            <Records records={records} role={role} />
            <div style={{ marginTop: '1rem' }}><Guidance role={role} /></div>
          </>
        ) : null}

        {!isLoading && role === 'mentor' ? (
          <>
            <div className="st-metrics st-metrics-mentor">
              <MetricCard icon="pulse" label="Average stress" value={`${analytics.average.toFixed(1)} / 5`} helper="Across visible check-ins" color="#0d9e8a" />
              <MetricCard icon="attention" label="High stress records" value={String(analytics.highCount)} helper="Levels 4 and 5" color="#d97706" delay={45} />
              <MetricCard icon="subject" label="Most stressful subject" value={analytics.topSubject} helper="Highest current average" color="#2563eb" delay={90} />
              <MetricCard icon="records" label="Visible records" value={String(records.length)} helper={`${analytics.activeSubjects} active subjects`} color="#7c3aed" delay={135} />
            </div>
            <div className="st-role-grid">
              <AttentionBoard records={records} />
              <InsightCard records={records} summary={summary} role={role} />
            </div>
            <div className="st-chart-grid">{sharedCharts}</div>
            <div className="st-footer-grid">
              <Records records={records} role={role} />
              <Guidance role={role} />
            </div>
          </>
        ) : null}

        {!isLoading && role === 'admin' ? (
          <>
            <div className="st-metrics st-metrics-admin">
              <MetricCard icon="records" label="Total records" value={String(records.length)} helper="Visible module activity" color="#0b1d35" />
              <MetricCard icon="pulse" label="Average level" value={`${analytics.average.toFixed(1)} / 5`} helper="Across stress records" color="#0d9e8a" delay={40} />
              <MetricCard icon="attention" label="High stress" value={String(analytics.highCount)} helper="Levels 4 and 5" color="#d97706" delay={80} />
              <MetricCard icon="subject" label="Top subject" value={analytics.topSubject} helper="Highest average pressure" color="#2563eb" delay={120} />
              <MetricCard icon="trend" label="Active subjects" value={String(analytics.activeSubjects)} helper="Subjects with check-ins" color="#7c3aed" delay={160} />
              <MetricCard icon="calendar" label="Latest check-in" value={analytics.latest ? formatDate(analytics.latest.recordedAt) : 'None'} helper={analytics.latest?.subject || 'No subject recorded'} color="#059669" delay={200} />
            </div>
            <div className="st-chart-grid">{sharedCharts}</div>
            <div className="st-role-grid">
              <AttentionBoard records={records} />
              <InsightCard records={records} summary={summary} role={role} />
            </div>
            <Records records={records} role={role} />
            <div style={{ marginTop: '1rem' }}><Guidance role={role} /></div>
          </>
        ) : null}
      </div>
    </>
  );
}
