import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { moodService } from '../services/moodService';
import type { MoodRecord, MoodState, MoodSummary } from '../types/mood';
import { formatDate } from '../utils/formatDate';

type Role = 'student' | 'mentor' | 'admin';
type IconName = 'reflection' | 'spark' | 'calm' | 'tired' | 'pressure' | 'overwhelmed' | 'history' | 'people' | 'insight' | 'arrow';

const moodOrder: MoodState[] = ['motivated', 'calm', 'tired', 'stressed', 'overwhelmed'];

const moodMeta: Record<MoodState, {
  label: string;
  helper: string;
  color: string;
  soft: string;
  score: number;
  icon: IconName;
}> = {
  motivated: { label: 'Motivated', helper: 'Ready to keep moving.', color: '#1687b8', soft: '#eaf6fb', score: 5, icon: 'spark' },
  calm: { label: 'Calm', helper: 'Balanced and steady.', color: '#0d9e8a', soft: '#e8f8f5', score: 4, icon: 'calm' },
  tired: { label: 'Tired', helper: 'Low energy this week.', color: '#c4871b', soft: '#fff7e8', score: 3, icon: 'tired' },
  stressed: { label: 'Stressed', helper: 'Pressure feels present.', color: '#d46645', soft: '#fff1ec', score: 2, icon: 'pressure' },
  overwhelmed: { label: 'Overwhelmed', helper: 'Everything feels heavy.', color: '#7650b5', soft: '#f3effb', score: 1, icon: 'overwhelmed' }
};

const iconPaths: Record<IconName, ReactNode> = {
  reflection: <><path d="M4 8c2.5-3.5 5.2-4.5 8-3 2.8-1.5 5.5-.5 8 3" /><path d="M4 16c2.5 3.5 5.2 4.5 8 3 2.8 1.5 5.5.5 8-3" /><path d="M7 12h10" /></>,
  spark: <><path d="m12 3 1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8L12 3Z" /><path d="m19 15 .7 2.1L22 18l-2.3.9L19 21l-.7-2.1L16 18l2.3-.9L19 15Z" /></>,
  calm: <><path d="M4 9c2-2 4-2 6 0s4 2 6 0 4-2 4-2" /><path d="M4 14c2-2 4-2 6 0s4 2 6 0 4-2 4-2" /><path d="M7 19h10" /></>,
  tired: <><path d="M6 10h4M14 10h4" /><path d="M8 17c2.5-1.2 5.5-1.2 8 0" /><circle cx="12" cy="12" r="9" /></>,
  pressure: <><path d="M4 13h4l2-6 3 11 2.5-8 2 3H21" /><path d="M5 21h14" /></>,
  overwhelmed: <><path d="M5 8c2.5-3 5-3 7 0s4.5 3 7 0" /><path d="M5 13c2.5-3 5-3 7 0s4.5 3 7 0" /><path d="M5 18c2.5-3 5-3 7 0s4.5 3 7 0" /></>,
  history: <><path d="M4 12a8 8 0 1 0 2-5.3L4 9" /><path d="M4 4v5h5M12 8v5l3 2" /></>,
  people: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2" /><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M14 15c3.5-.3 5.6 1.3 6 4.5" /></>,
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
    <span className="mc-icon" style={{ width: size, height: size, color, background }}>
      <svg aria-hidden="true" width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {iconPaths[name]}
      </svg>
    </span>
  );
}

function dominantMood(summary: MoodSummary[]) {
  return [...summary].sort((a, b) => b.count - a.count)[0]?.mood;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return (
    <div className="mc-section-heading">
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="mc-empty">
      <Icon name="reflection" size={44} color="#94a3b8" background="#eef4f8" />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function Hero({ role, total, commonMood, attentionCount, positiveCount }: {
  role: Role;
  total: number;
  commonMood?: MoodState;
  attentionCount: number;
  positiveCount: number;
}) {
  const content = role === 'student'
    ? {
        eyebrow: 'Private weekly reflection',
        title: 'How are you feeling this week?',
        description: 'MoodCampus helps you reflect on your week and notice emotional patterns during the semester. Your mood is information, not a weakness.',
        badges: ['Private reflection', 'Weekly mood check-in', 'Understand your pattern']
      }
    : role === 'mentor'
      ? {
          eyebrow: 'Mentor awareness view',
          title: 'Understand student mood patterns.',
          description: 'Review general mood signals and notice where calm, supportive guidance may be useful.',
          badges: [`${moodMeta[commonMood ?? 'calm'].label} is most common`, `${attentionCount} pressure signals`, `${positiveCount} steady signals`]
        }
      : {
          eyebrow: 'Mood module active',
          title: 'MoodCampus overview.',
          description: 'Monitor general mood trends and understand campus wellbeing signals responsibly.',
          badges: [`${total} total records`, `${attentionCount} pressure signals`, `${positiveCount} calm or motivated`]
        };

  return (
    <section className="mc-hero mc-reveal">
      <div>
        <span className="mc-eyebrow"><i />{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <div className="mc-hero-badges">{content.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
        {role === 'student' ? (
          <div className="mc-hero-actions">
            <a className="mc-hero-primary" href="#mood-form">Record mood <Icon name="arrow" size={22} color="#fff" background="transparent" /></a>
            <a className="mc-hero-secondary" href="#mood-history">View history</a>
          </div>
        ) : null}
      </div>
      <div className="mc-hero-visual">
        <div className="mc-reflection-ring"><Icon name="reflection" size={58} color="#67e3d6" background="rgba(103,227,214,.1)" /></div>
        <span>Small reflections can make a heavy week easier to understand.</span>
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
    <article className="mc-card mc-metric mc-lift mc-reveal" style={{ animationDelay: `${delay}ms` }}>
      <div className="mc-metric-top"><Icon name={icon} color={color} background={`${color}14`} /><i style={{ background: color }} /></div>
      <span className="mc-label">{label}</span>
      <strong style={{ color }}>{value}</strong>
      <p>{helper}</p>
    </article>
  );
}

function MoodForm({ onSaved, compact = false }: { onSaved: () => Promise<void>; compact?: boolean }) {
  const [form, setForm] = useState({ mood: 'motivated' as MoodState, note: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      setIsSubmitting(true);
      await moodService.create({ mood: form.mood, note: form.note.trim() || undefined });
      setForm({ mood: 'motivated', note: '' });
      setMessage('Mood check-in saved. Thank you for taking a moment to reflect.');
      await onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={`mc-card mc-form ${compact ? 'mc-form-compact' : ''}`} id="mood-form" onSubmit={handleSubmit}>
      <SectionHeading eyebrow="Weekly check-in" title="Choose the mood that fits" description="There is no right answer. Select the word that feels closest to your week." />
      {message ? <div className="mc-alert mc-alert-success">{message}</div> : null}
      {error ? <div className="mc-alert mc-alert-error">{error}</div> : null}
      <div className="mc-mood-options">
        {moodOrder.map((mood) => {
          const meta = moodMeta[mood];
          return (
            <button
              aria-pressed={form.mood === mood}
              className={form.mood === mood ? 'is-active' : ''}
              key={mood}
              onClick={() => setForm((current) => ({ ...current, mood }))}
              style={{ '--mood-color': meta.color, '--mood-soft': meta.soft } as CSSProperties}
              type="button"
            >
              <Icon name={meta.icon} size={compact ? 34 : 40} color={meta.color} background={meta.soft} />
              <strong>{meta.label}</strong>
              <span>{meta.helper}</span>
            </button>
          );
        })}
      </div>
      <label>
        <span className="mc-field-label">Optional reflection</span>
        <textarea className="mc-input mc-textarea" placeholder="What shaped your week? Share only what feels comfortable." value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
      </label>
      <button className="mc-primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving reflection...' : 'Save mood check-in'}
        <Icon name="arrow" size={24} color="#fff" background="transparent" />
      </button>
    </form>
  );
}

function DistributionChart({ summary }: { summary: MoodSummary[] }) {
  const countMap = new Map(summary.map((item) => [item.mood, item.count]));
  const rows = moodOrder.map((mood) => ({ mood, count: countMap.get(mood) ?? 0 }));
  const total = rows.reduce((sum, item) => sum + item.count, 0);
  const max = Math.max(1, ...rows.map((item) => item.count));

  return (
    <section className="mc-card mc-chart-card">
      <SectionHeading eyebrow="Mood mix" title="Mood distribution" description="A clear count of every visible weekly mood signal." />
      {!total ? <EmptyState title="No mood distribution yet" text="Mood counts will appear after the first check-in." /> : (
        <div className="mc-distribution">
          <div className="mc-donut" style={{
            background: `conic-gradient(${rows.map((item, index) => {
              const before = rows.slice(0, index).reduce((sum, value) => sum + value.count, 0);
              return `${moodMeta[item.mood].color} ${(before / total) * 100}% ${((before + item.count) / total) * 100}%`;
            }).join(',')})`
          }}>
            <span><strong>{total}</strong>check-ins</span>
          </div>
          <div className="mc-bars">
            {rows.map(({ mood, count }, index) => (
              <div key={mood}>
                <div><span><i style={{ background: moodMeta[mood].color }} />{moodMeta[mood].label}</span><strong>{count}</strong></div>
                <div className="mc-bar-track"><span style={{ width: `${count ? Math.max(7, (count / max) * 100) : 0}%`, background: moodMeta[mood].color, animationDelay: `${index * 65}ms` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function BalanceChart({ records }: { records: MoodRecord[] }) {
  const positive = records.filter((record) => record.mood === 'motivated' || record.mood === 'calm').length;
  const neutral = records.filter((record) => record.mood === 'tired').length;
  const pressure = records.filter((record) => record.mood === 'stressed' || record.mood === 'overwhelmed').length;
  const total = records.length;

  return (
    <section className="mc-card mc-chart-card">
      <SectionHeading eyebrow="Wellbeing balance" title="Steady vs pressured signals" description="A broad reflection view, not a diagnosis or individual score." />
      {!total ? <EmptyState title="No balance to show" text="Start with one weekly check-in." /> : (
        <>
          <div className="mc-balance-summary">
            <div><span>Steady</span><strong>{positive}</strong><small>calm or motivated</small></div>
            <div><span>Low energy</span><strong>{neutral}</strong><small>tired check-ins</small></div>
            <div><span>Pressure</span><strong>{pressure}</strong><small>stressed or overwhelmed</small></div>
          </div>
          <div className="mc-segments">
            {positive ? <span style={{ width: `${(positive / total) * 100}%`, background: '#0d9e8a' }} /> : null}
            {neutral ? <span style={{ width: `${(neutral / total) * 100}%`, background: '#c4871b' }} /> : null}
            {pressure ? <span style={{ width: `${(pressure / total) * 100}%`, background: '#7650b5' }} /> : null}
          </div>
          <div className="mc-segment-labels"><span><i style={{ background: '#0d9e8a' }} />Steady</span><span><i style={{ background: '#c4871b' }} />Tired</span><span><i style={{ background: '#7650b5' }} />Pressure</span></div>
        </>
      )}
    </section>
  );
}

function Timeline({ records }: { records: MoodRecord[] }) {
  const ordered = [...records]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .slice(-6);

  return (
    <section className="mc-card mc-chart-card mc-journey-card">
      <div className="mc-journey-heading">
        <SectionHeading eyebrow="Recent pattern" title="Weekly mood journey" description="Recent check-ins shown as a calm reflection path through the semester." />
        {ordered.length ? <span>{ordered.length} recent reflection{ordered.length === 1 ? '' : 's'}</span> : null}
      </div>
      {!ordered.length ? <EmptyState title="No timeline yet" text="A pattern will form as weekly reflections are added." /> : (
        <div className="mc-journey" style={{ '--journey-count': ordered.length } as CSSProperties}>
          {ordered.map((record, index) => {
            const meta = moodMeta[record.mood];
            return (
              <article className="mc-journey-item" key={record.id} style={{ '--mood-color': meta.color, '--mood-soft': meta.soft, animationDelay: `${index * 70}ms` } as CSSProperties}>
                <time dateTime={record.recordedAt}>{formatDate(record.recordedAt)}</time>
                <div className="mc-journey-marker">
                  <span><Icon name={meta.icon} size={34} color={meta.color} background={meta.soft} /></span>
                </div>
                <div className="mc-journey-content">
                  <strong>{meta.label}</strong>
                  <p className={record.note ? '' : 'mc-muted-note'}>{record.note || meta.helper}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AttentionBoard({ records }: { records: MoodRecord[] }) {
  const priority: Record<MoodState, number> = { overwhelmed: 5, stressed: 4, tired: 3, calm: 2, motivated: 1 };
  const ordered = [...records].sort((a, b) => priority[b.mood] - priority[a.mood] || new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()).slice(0, 7);

  return (
    <section className="mc-card mc-chart-card">
      <SectionHeading eyebrow="Awareness board" title="Mood signals to notice" description="Pressure-related records appear first without assigning judgment." />
      {!ordered.length ? <EmptyState title="No mood signals yet" text="Recent reflections will appear here." /> : (
        <div className="mc-attention-list">
          {ordered.map((record) => {
            const meta = moodMeta[record.mood];
            return (
              <div key={record.id}>
                <Icon name={meta.icon} size={34} color={meta.color} background={meta.soft} />
                <div><strong>{meta.label}</strong><small>{record.studentName || 'Student reflection'} · {formatDate(record.recordedAt)}</small></div>
                <span style={{ color: meta.color }}>{record.note ? 'Reflection added' : 'Check-in'}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InsightCard({ records, summary, role }: { records: MoodRecord[]; summary: MoodSummary[]; role: Role }) {
  const common = dominantMood(summary);
  const pressured = records.filter((record) => record.mood === 'stressed' || record.mood === 'overwhelmed').length;
  const text = !records.length
    ? 'No mood records are visible yet. Start with one small reflection today.'
    : role === 'student'
      ? pressured > 1
        ? `You recorded stress or overwhelm ${pressured} times. Consider using Silent Help or ExamStress when a practical next step would help.`
        : `${moodMeta[common ?? records[0].mood].label} appears most often in your recent check-ins. Keep reflecting without judging the result.`
      : pressured
        ? `${pressured} visible record${pressured === 1 ? '' : 's'} show stress or overwhelm. Use this as a prompt for supportive planning, not individual judgment.`
        : 'Current visible records lean toward calm, motivated, or tired signals. Continue watching patterns during assessment periods.';

  return (
    <section className="mc-card mc-insight">
      <Icon name="insight" size={48} color="#0d9e8a" background="rgba(13,158,138,.1)" />
      <div><span className="mc-label">Current reflection</span><h2>{role === 'student' ? 'Your mood pattern, gently framed' : 'A signal for supportive planning'}</h2><p>{text}</p></div>
    </section>
  );
}

function MoodHistory({ records, role }: { records: MoodRecord[]; role: Role }) {
  const ordered = [...records].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  return (
    <section className="mc-card mc-history" id="mood-history">
      <SectionHeading eyebrow={role === 'student' ? 'Personal history' : 'Recent activity'} title={role === 'student' ? 'Mood history' : 'Recent mood activity'} description={role === 'student' ? 'A respectful timeline of your latest weekly reflections.' : 'Latest visible mood records for responsible awareness.'} />
      {!ordered.length ? <EmptyState title="No mood records yet" text="Start with one weekly check-in." /> : (
        <div className="mc-history-list">
          {ordered.slice(0, role === 'student' ? 8 : 12).map((record) => {
            const meta = moodMeta[record.mood];
            const needsAttention = record.mood === 'stressed' || record.mood === 'overwhelmed';
            return (
              <article key={record.id} style={{ '--record-color': meta.color } as CSSProperties}>
                <Icon name={meta.icon} size={42} color={meta.color} background={meta.soft} />
                <div>
                  <h3>{meta.label}</h3>
                  <span>{role === 'student' ? 'Private reflection' : record.studentName || 'Student reflection'} · {formatDate(record.recordedAt)}</span>
                  <p className={record.note ? '' : 'mc-muted-note'}>{record.note || 'No note added for this reflection.'}</p>
                </div>
                {needsAttention ? <span className="mc-attention-badge"><i />Notice</span> : <span className="mc-soft-badge" style={{ color: meta.color, background: meta.soft }}>{meta.helper}</span>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Guidance({ role }: { role: Role }) {
  const items = role === 'student'
    ? ['Name the feeling without judging it.', 'Notice what shaped the week.', 'Choose one gentle next step.', 'Ask for support when pressure persists.']
    : role === 'mentor'
      ? ['Listen first.', 'Ask one gentle question.', 'Suggest one practical step.', 'Encourage help when needed.']
      : ['Use trends for support planning.', 'Avoid judging individual records.', 'Watch exam-period patterns.', 'Protect appropriate student privacy.'];

  return (
    <section className="mc-card mc-guidance">
      <Icon name={role === 'student' ? 'reflection' : 'people'} size={44} color="#2563eb" background="rgba(37,99,235,.08)" />
      <div>
        <span className="mc-label">{role === 'student' ? 'Reflection guidance' : role === 'mentor' ? 'Supportive mentor response' : 'Responsible use'}</span>
        <h2>{role === 'student' ? 'A small way to understand your week' : role === 'mentor' ? 'Respond with care and clarity' : 'Read wellbeing signals responsibly'}</h2>
        <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </section>
  );
}

export default function MoodCampusPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [summary, setSummary] = useState<MoodSummary[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const role: Role = user?.role === 'mentor' || user?.role === 'admin' ? user.role : 'student';

  async function loadData() {
    setError('');
    try {
      setIsLoading(true);
      const [recordsData, summaryData] = await Promise.all([moodService.list(), moodService.summary()]);
      setRecords(recordsData);
      setSummary(summaryData);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  const analytics = useMemo(() => {
    const ordered = [...records].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    const common = dominantMood(summary);
    const attention = records.filter((record) => record.mood === 'stressed' || record.mood === 'overwhelmed').length;
    const positive = records.filter((record) => record.mood === 'motivated' || record.mood === 'calm').length;
    const balance = records.length ? Math.round((positive / records.length) * 100) : 0;
    return { latest: ordered[0], common, attention, positive, balance };
  }, [records, summary]);

  const charts = <><DistributionChart summary={summary} /><BalanceChart records={records} /><Timeline records={records} /></>;

  return (
    <>
      <style>{`
        @keyframes mcReveal { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes mcGrow { from { transform:scaleX(0); } to { transform:scaleX(1); } }
        @keyframes mcPulse { 0%,100% { box-shadow:0 0 0 0 rgba(212,102,69,.18); } 50% { box-shadow:0 0 0 6px rgba(212,102,69,0); } }
        .mc-page { margin:-2rem; min-height:100vh; padding:2rem; overflow:hidden; color:#0b1d35; background:radial-gradient(circle at 92% 4%,rgba(13,158,138,.11),transparent 25rem),radial-gradient(circle at 0 48%,rgba(118,80,181,.065),transparent 28rem),linear-gradient(180deg,#f8fbff,#eef4f8); font-family:"DM Sans",sans-serif; }
        .mc-page * { box-sizing:border-box; }
        .mc-reveal { animation:mcReveal .45s ease both; }
        .mc-card { min-width:0; border:1px solid #dfeaf3; border-radius:18px; background:rgba(255,255,255,.92); box-shadow:0 12px 32px rgba(15,23,42,.055); backdrop-filter:blur(12px); }
        .mc-lift { transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease; }
        .mc-lift:hover { transform:translateY(-3px); border-color:rgba(13,158,138,.28); box-shadow:0 18px 42px rgba(15,23,42,.1); }
        .mc-icon { display:inline-flex; flex:none; align-items:center; justify-content:center; border-radius:30%; }
        .mc-hero { position:relative; display:grid; grid-template-columns:minmax(0,1fr) 260px; align-items:center; gap:2rem; min-height:250px; overflow:hidden; padding:2rem; border:1px solid rgba(255,255,255,.09); border-radius:24px; color:#fff; background:radial-gradient(circle at 88% 5%,rgba(103,227,214,.24),transparent 31%),linear-gradient(135deg,#071527,#0b1d35 56%,#163c53); box-shadow:0 20px 46px rgba(11,29,53,.18); }
        .mc-hero::after { content:""; position:absolute; right:-75px; bottom:-130px; width:330px; height:330px; border:1px solid rgba(103,227,214,.12); border-radius:50%; }
        .mc-hero > * { position:relative; z-index:1; }
        .mc-eyebrow { display:inline-flex; align-items:center; gap:7px; border:1px solid rgba(103,227,214,.22); border-radius:999px; padding:.36rem .76rem; background:rgba(103,227,214,.08); color:#bdf8ef; font-size:.68rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .mc-eyebrow i { width:7px; height:7px; border-radius:50%; background:#67e3d6; }
        .mc-hero h1 { max-width:760px; margin:.9rem 0 .55rem; font-family:"Sora",sans-serif; font-size:clamp(1.75rem,3.2vw,2.65rem); line-height:1.14; letter-spacing:-.02em; }
        .mc-hero p { max-width:720px; margin:0; color:rgba(255,255,255,.68); font-size:.9rem; line-height:1.7; }
        .mc-hero-badges,.mc-hero-actions { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:1.1rem; }
        .mc-hero-badges span { border:1px solid rgba(255,255,255,.1); border-radius:999px; padding:.38rem .7rem; background:rgba(255,255,255,.06); color:rgba(255,255,255,.78); font-size:.68rem; font-weight:700; }
        .mc-hero-actions a { display:inline-flex; min-height:39px; align-items:center; justify-content:center; gap:.35rem; border-radius:10px; padding:.5rem .85rem; color:#fff; font-size:.72rem; font-weight:800; text-decoration:none; transition:transform .18s ease; }
        .mc-hero-actions a:hover { transform:translateY(-2px); }
        .mc-hero-primary { background:#0d9e8a; box-shadow:0 8px 20px rgba(13,158,138,.22); }
        .mc-hero-secondary { border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.07); }
        .mc-hero-visual { display:grid; justify-items:center; gap:.85rem; text-align:center; }
        .mc-reflection-ring { display:grid; place-items:center; width:126px; height:126px; border:1px solid rgba(103,227,214,.2); border-radius:50%; background:rgba(255,255,255,.045); box-shadow:inset 0 0 0 14px rgba(255,255,255,.022); }
        .mc-hero-visual > span { max-width:210px; color:rgba(255,255,255,.58); font-size:.7rem; line-height:1.55; }
        .mc-section-heading > span,.mc-label { display:block; color:#0d9e8a; font-size:.64rem; font-weight:850; letter-spacing:.08em; text-transform:uppercase; }
        .mc-section-heading h2 { margin:.25rem 0 0; font-family:"Sora",sans-serif; font-size:1.05rem; line-height:1.35; }
        .mc-section-heading p { margin:.3rem 0 0; color:#64748b; font-size:.74rem; line-height:1.55; }
        .mc-metrics { display:grid; gap:1rem; margin-top:1.2rem; }
        .mc-metrics-student { grid-template-columns:repeat(5,minmax(0,1fr)); }
        .mc-metrics-mentor { grid-template-columns:repeat(4,minmax(0,1fr)); }
        .mc-metrics-admin { grid-template-columns:repeat(6,minmax(0,1fr)); }
        .mc-metric { padding:1rem; }
        .mc-metric-top { display:flex; align-items:center; justify-content:space-between; }
        .mc-metric-top i { width:32px; height:3px; border-radius:999px; opacity:.72; }
        .mc-metric .mc-label { margin-top:.8rem; color:#64748b; }
        .mc-metric > strong { display:block; margin:.3rem 0 .2rem; overflow:hidden; font-family:"Sora",sans-serif; font-size:1.4rem; line-height:1.2; text-overflow:ellipsis; text-transform:capitalize; white-space:nowrap; }
        .mc-metric p { margin:0; color:#94a3b8; font-size:.68rem; line-height:1.45; }
        .mc-student-top { display:grid; grid-template-columns:minmax(430px,1.1fr) minmax(320px,.9fr); gap:1rem; margin-top:1rem; }
        .mc-form { padding:1.35rem; }
        .mc-mood-options { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:.45rem; margin-top:1rem; }
        .mc-mood-options button { display:grid; justify-items:start; min-width:0; min-height:128px; border:1px solid #e1eaf1; border-radius:12px; padding:.7rem; color:#475569; background:#f9fcfe; cursor:pointer; text-align:left; transition:.18s ease; }
        .mc-mood-options button:hover,.mc-mood-options button.is-active { border-color:var(--mood-color); color:var(--mood-color); background:linear-gradient(160deg,#fff,var(--mood-soft)); transform:translateY(-3px); box-shadow:0 10px 24px rgba(15,23,42,.07); }
        .mc-mood-options strong { margin-top:.55rem; font-size:.72rem; }
        .mc-mood-options button > span:last-child { margin-top:.16rem; color:#7b8ba0; font-size:.59rem; line-height:1.4; }
        .mc-form label { display:block; margin-top:1rem; }
        .mc-field-label { display:block; margin-bottom:.42rem; color:#334155; font-size:.72rem; font-weight:800; }
        .mc-input { width:100%; border:1px solid #d8e4ed; border-radius:10px; outline:none; padding:.7rem .8rem; color:#0b1d35; background:#f9fcfe; font:inherit; font-size:.78rem; transition:.18s ease; }
        .mc-input:focus { border-color:#0d9e8a; box-shadow:0 0 0 3px rgba(13,158,138,.1); background:#fff; }
        .mc-textarea { min-height:82px; resize:vertical; }
        .mc-primary-button { display:flex; width:100%; min-height:43px; align-items:center; justify-content:center; gap:.45rem; margin-top:1rem; border:0; border-radius:10px; padding:.65rem 1rem; color:#fff; background:#0d9e8a; box-shadow:0 8px 20px rgba(13,158,138,.2); font:inherit; font-size:.76rem; font-weight:800; cursor:pointer; }
        .mc-primary-button:disabled { cursor:not-allowed; opacity:.65; }
        .mc-alert { margin-top:1rem; border-radius:9px; padding:.65rem .75rem; font-size:.72rem; line-height:1.45; }
        .mc-alert-success { border:1px solid #bbebdc; color:#047857; background:#ecfdf5; }
        .mc-alert-error { border:1px solid #fecaca; color:#b91c1c; background:#fef2f2; }
        .mc-chart-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; margin-top:1rem; }
        .mc-chart-grid > section:nth-child(3) { grid-column:1 / -1; }
        .mc-chart-card { padding:1.25rem; }
        .mc-distribution { display:grid; grid-template-columns:150px minmax(0,1fr); align-items:center; gap:1.4rem; margin-top:1rem; }
        .mc-donut { position:relative; display:grid; place-items:center; width:140px; height:140px; border-radius:50%; }
        .mc-donut::after { content:""; position:absolute; inset:19px; border-radius:50%; background:#fff; }
        .mc-donut span { position:relative; z-index:1; display:grid; color:#64748b; font-size:.6rem; text-align:center; }
        .mc-donut strong { color:#0b1d35; font-family:"Sora",sans-serif; font-size:1.45rem; }
        .mc-bars { display:grid; gap:.55rem; }
        .mc-bars > div > div:first-child { display:flex; align-items:center; justify-content:space-between; gap:1rem; color:#64748b; font-size:.68rem; }
        .mc-bars > div > div:first-child span { display:flex; align-items:center; gap:6px; }
        .mc-bars i,.mc-segment-labels i { width:7px; height:7px; border-radius:50%; }
        .mc-bars strong { color:#0b1d35; }
        .mc-bar-track { height:6px; margin-top:.25rem; overflow:hidden; border-radius:999px; background:#e8eff5; }
        .mc-bar-track span { display:block; height:100%; border-radius:999px; transform-origin:left; animation:mcGrow .7s ease both; }
        .mc-balance-summary { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.55rem; margin-top:1rem; }
        .mc-balance-summary > div { display:grid; border:1px solid #e8eff5; border-radius:11px; padding:.75rem; background:#f8fbfd; }
        .mc-balance-summary span { color:#64748b; font-size:.62rem; font-weight:750; }
        .mc-balance-summary strong { margin:.25rem 0; font-family:"Sora",sans-serif; font-size:1.35rem; }
        .mc-balance-summary small { color:#94a3b8; font-size:.58rem; }
        .mc-segments { display:flex; height:14px; overflow:hidden; margin-top:1rem; border-radius:999px; background:#e8eff5; }
        .mc-segments span { height:100%; transform-origin:left; animation:mcGrow .7s ease both; }
        .mc-segment-labels { display:flex; flex-wrap:wrap; gap:.8rem; margin-top:.7rem; color:#64748b; font-size:.62rem; }
        .mc-segment-labels span { display:flex; align-items:center; gap:5px; }
        .mc-journey-card { overflow:hidden; background:radial-gradient(circle at 88% 5%,rgba(103,227,214,.1),transparent 15rem),rgba(255,255,255,.94); }
        .mc-journey-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; }
        .mc-journey-heading > span { flex:none; border:1px solid rgba(13,158,138,.16); border-radius:999px; padding:.35rem .65rem; color:#0d7e70; background:rgba(13,158,138,.07); font-size:.6rem; font-weight:800; }
        .mc-journey { --journey-count:6; position:relative; display:grid; grid-template-columns:repeat(var(--journey-count),minmax(0,1fr)); gap:.65rem; margin-top:1.15rem; padding:.15rem 0 .1rem; }
        .mc-journey::before { content:""; position:absolute; z-index:0; top:59px; right:calc(100% / var(--journey-count) / 2); left:calc(100% / var(--journey-count) / 2); height:2px; background:linear-gradient(90deg,rgba(13,158,138,.16),rgba(22,135,184,.3),rgba(118,80,181,.18)); }
        .mc-journey-item { position:relative; z-index:1; display:grid; grid-template-rows:24px 54px minmax(86px,auto); min-width:0; animation:mcReveal .45s ease both; }
        .mc-journey-item time { display:block; overflow:hidden; color:#8493a6; font-size:.57rem; font-weight:750; text-align:center; text-overflow:ellipsis; white-space:nowrap; }
        .mc-journey-marker { display:grid; place-items:center; }
        .mc-journey-marker > span { display:grid; width:46px; height:46px; place-items:center; border:4px solid #fff; border-radius:50%; background:var(--mood-soft); box-shadow:0 0 0 1px color-mix(in srgb,var(--mood-color) 24%,transparent),0 7px 18px rgba(15,23,42,.09); transition:transform .2s ease,box-shadow .2s ease; }
        .mc-journey-content { min-width:0; border:1px solid #e5edf4; border-top:3px solid var(--mood-color); border-radius:11px; padding:.65rem; background:linear-gradient(180deg,#fff,var(--mood-soft)); box-shadow:0 8px 20px rgba(15,23,42,.04); text-align:center; transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease; }
        .mc-journey-content strong { display:block; color:var(--mood-color); font-family:"Sora",sans-serif; font-size:.69rem; }
        .mc-journey-content p { display:-webkit-box; overflow:hidden; margin:.28rem 0 0; color:#64748b; font-size:.6rem; line-height:1.45; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
        .mc-journey-item:hover .mc-journey-marker > span { transform:translateY(-3px) scale(1.04); box-shadow:0 0 0 1px color-mix(in srgb,var(--mood-color) 35%,transparent),0 10px 22px rgba(15,23,42,.12); }
        .mc-journey-item:hover .mc-journey-content { transform:translateY(-2px); border-color:color-mix(in srgb,var(--mood-color) 34%,#e5edf4); box-shadow:0 12px 26px rgba(15,23,42,.07); }
        .mc-attention-list { display:grid; gap:.45rem; margin-top:1rem; }
        .mc-attention-list > div { display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:.65rem; border-bottom:1px solid #edf2f7; padding:.55rem 0; }
        .mc-attention-list > div:last-child { border-bottom:0; }
        .mc-attention-list div div { display:grid; }
        .mc-attention-list strong { font-size:.72rem; }
        .mc-attention-list small { margin-top:.12rem; color:#94a3b8; font-size:.59rem; }
        .mc-attention-list > div > span:last-child { font-size:.6rem; font-weight:800; }
        .mc-insight,.mc-guidance { display:grid; grid-template-columns:auto minmax(0,1fr); align-items:start; gap:1rem; padding:1.25rem; }
        .mc-insight h2,.mc-guidance h2 { margin:.3rem 0; font-family:"Sora",sans-serif; font-size:1rem; line-height:1.4; }
        .mc-insight p { margin:0; color:#64748b; font-size:.75rem; line-height:1.65; }
        .mc-guidance ul { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.45rem 1rem; margin:.7rem 0 0; padding:0; list-style:none; }
        .mc-guidance li { position:relative; padding-left:14px; color:#64748b; font-size:.7rem; line-height:1.45; }
        .mc-guidance li::before { content:""; position:absolute; top:.45rem; left:0; width:5px; height:5px; border-radius:50%; background:#0d9e8a; }
        .mc-history { margin-top:1rem; padding:1.25rem; }
        .mc-history-list { display:grid; gap:.55rem; margin-top:1rem; }
        .mc-history-list article { display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:.85rem; border:1px solid #e5edf4; border-left:3px solid var(--record-color); border-radius:12px; padding:.75rem; background:#fbfdff; }
        .mc-history-list h3 { margin:0; font-size:.77rem; }
        .mc-history-list div > span { display:block; margin-top:.13rem; color:#94a3b8; font-size:.6rem; }
        .mc-history-list p { margin:.3rem 0 0; overflow:hidden; color:#64748b; font-size:.69rem; line-height:1.45; text-overflow:ellipsis; white-space:nowrap; }
        .mc-muted-note { color:#a8b5c4!important; font-style:italic; }
        .mc-attention-badge,.mc-soft-badge { display:inline-flex; align-items:center; gap:5px; border-radius:999px; padding:.3rem .55rem; font-size:.57rem; font-weight:800; }
        .mc-attention-badge { color:#b45309; background:#fff7ed; text-transform:uppercase; }
        .mc-attention-badge i { width:6px; height:6px; border-radius:50%; background:#d46645; animation:mcPulse 2s infinite; }
        .mc-role-grid { display:grid; grid-template-columns:minmax(280px,.72fr) minmax(0,1.28fr); gap:1rem; margin-top:1rem; }
        .mc-footer-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem; }
        .mc-form-compact .mc-mood-options { grid-template-columns:repeat(5,minmax(58px,1fr)); }
        .mc-form-compact .mc-mood-options button { min-height:105px; padding:.55rem; }
        .mc-empty { display:grid; min-height:160px; place-items:center; align-content:center; gap:.45rem; margin-top:1rem; border:1px dashed #d5e2ec; border-radius:12px; padding:1rem; background:#f8fbfd; text-align:center; }
        .mc-empty strong { font-size:.76rem; }
        .mc-empty > span:last-child { max-width:290px; color:#94a3b8; font-size:.67rem; line-height:1.5; }
        .mc-page-error { margin:1rem 0; border:1px solid #fecaca; border-radius:10px; padding:.75rem; color:#b91c1c; background:#fef2f2; font-size:.75rem; }
        .mc-loading { display:grid; min-height:260px; place-items:center; margin-top:1rem; color:#64748b; }
        @media(max-width:1180px) { .mc-metrics-student,.mc-metrics-admin { grid-template-columns:repeat(3,minmax(0,1fr)); } .mc-mood-options { grid-template-columns:repeat(3,minmax(0,1fr)); } }
        @media(max-width:960px) { .mc-hero { grid-template-columns:1fr 180px; } .mc-student-top,.mc-role-grid { grid-template-columns:1fr; } .mc-metrics-mentor { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media(max-width:760px) { .mc-page { margin:-1rem; padding:1rem; } .mc-hero { grid-template-columns:1fr; min-height:0; padding:1.35rem; } .mc-hero-visual { display:none; } .mc-metrics-student,.mc-metrics-admin { grid-template-columns:repeat(2,minmax(0,1fr)); } .mc-chart-grid,.mc-footer-grid { grid-template-columns:1fr; } .mc-chart-grid > section:nth-child(3) { grid-column:auto; } .mc-guidance ul { grid-template-columns:1fr; } .mc-distribution { grid-template-columns:1fr; justify-items:center; } .mc-bars { width:100%; } .mc-journey-heading { display:block; } .mc-journey-heading > span { display:inline-flex; margin-top:.65rem; } .mc-journey { display:grid; grid-template-columns:1fr; gap:.55rem; padding-left:2.9rem; } .mc-journey::before { top:22px; bottom:22px; left:19px; width:2px; height:auto; background:linear-gradient(180deg,rgba(13,158,138,.18),rgba(22,135,184,.3),rgba(118,80,181,.18)); } .mc-journey-item { grid-template-rows:auto; grid-template-columns:1fr; } .mc-journey-item time { margin-bottom:.3rem; text-align:left; } .mc-journey-marker { position:absolute; top:10px; left:-2.9rem; width:39px; } .mc-journey-marker > span { width:40px; height:40px; border-width:3px; } .mc-journey-content { min-height:0; text-align:left; } }
        @media(max-width:520px) { .mc-metrics-student,.mc-metrics-mentor,.mc-metrics-admin { grid-template-columns:1fr; } .mc-mood-options,.mc-form-compact .mc-mood-options { grid-template-columns:repeat(2,minmax(0,1fr)); } .mc-mood-options button { min-height:112px; } .mc-balance-summary { grid-template-columns:1fr; } .mc-history-list article { grid-template-columns:auto minmax(0,1fr); } .mc-history-list article > span:last-child { grid-column:2; justify-self:start; } }
      `}</style>

      <div className="mc-page">
        <Hero role={role} total={records.length} commonMood={analytics.common} attentionCount={analytics.attention} positiveCount={analytics.positive} />
        {error ? <div className="mc-page-error">{error}</div> : null}
        {isLoading ? <div className="mc-card mc-loading">Loading MoodCampus reflections...</div> : null}

        {!isLoading && role === 'student' ? (
          <>
            <div className="mc-student-top">
              <MoodForm onSaved={loadData} />
              <div>
                <div className="mc-metrics mc-metrics-student" style={{ marginTop: 0 }}>
                  <MetricCard icon={analytics.latest ? moodMeta[analytics.latest.mood].icon : 'reflection'} label="This week's mood" value={analytics.latest ? moodMeta[analytics.latest.mood].label : 'Not recorded'} helper={analytics.latest ? formatDate(analytics.latest.recordedAt) : 'Start with one reflection'} color={analytics.latest ? moodMeta[analytics.latest.mood].color : '#0d9e8a'} />
                  <MetricCard icon="history" label="Total check-ins" value={String(records.length)} helper="Visible personal reflections" color="#2563eb" delay={45} />
                  <MetricCard icon={analytics.common ? moodMeta[analytics.common].icon : 'reflection'} label="Most common" value={analytics.common ? moodMeta[analytics.common].label : 'No pattern'} helper="Based on mood history" color={analytics.common ? moodMeta[analytics.common].color : '#7c3aed'} delay={90} />
                  <MetricCard icon="reflection" label="Latest reflection" value={analytics.latest?.note ? 'Note added' : 'No note'} helper={analytics.latest ? formatDate(analytics.latest.recordedAt) : 'No reflection yet'} color="#7650b5" delay={135} />
                  <MetricCard icon="calm" label="Mood balance" value={`${analytics.balance}% steady`} helper="Calm or motivated check-ins" color="#059669" delay={180} />
                </div>
                <div style={{ marginTop: '1rem' }}><InsightCard records={records} summary={summary} role={role} /></div>
              </div>
            </div>
            <div className="mc-chart-grid">{charts}</div>
            <MoodHistory records={records} role={role} />
            <div style={{ marginTop: '1rem' }}><Guidance role={role} /></div>
          </>
        ) : null}

        {!isLoading && role === 'mentor' ? (
          <>
            <div className="mc-metrics mc-metrics-mentor">
              <MetricCard icon={analytics.common ? moodMeta[analytics.common].icon : 'reflection'} label="Most common mood" value={analytics.common ? moodMeta[analytics.common].label : 'No pattern'} helper="Across visible records" color={analytics.common ? moodMeta[analytics.common].color : '#0d9e8a'} />
              <MetricCard icon="history" label="Mood records" value={String(records.length)} helper="Visible weekly check-ins" color="#2563eb" delay={45} />
              <MetricCard icon="pressure" label="Pressure signals" value={String(analytics.attention)} helper="Stressed or overwhelmed" color="#d46645" delay={90} />
              <MetricCard icon="calm" label="Steady signals" value={String(analytics.positive)} helper="Calm or motivated" color="#059669" delay={135} />
            </div>
            <div className="mc-role-grid"><AttentionBoard records={records} /><InsightCard records={records} summary={summary} role={role} /></div>
            <div className="mc-chart-grid">{charts}</div>
            <MoodHistory records={records} role={role} />
            <div className="mc-footer-grid"><Guidance role={role} /><MoodForm onSaved={loadData} compact /></div>
          </>
        ) : null}

        {!isLoading && role === 'admin' ? (
          <>
            <div className="mc-metrics mc-metrics-admin">
              <MetricCard icon="history" label="Total records" value={String(records.length)} helper="Visible mood activity" color="#0b1d35" />
              <MetricCard icon={analytics.common ? moodMeta[analytics.common].icon : 'reflection'} label="Most common" value={analytics.common ? moodMeta[analytics.common].label : 'No pattern'} helper="Leading mood count" color={analytics.common ? moodMeta[analytics.common].color : '#0d9e8a'} delay={40} />
              <MetricCard icon="calm" label="Steady records" value={String(analytics.positive)} helper="Calm or motivated" color="#059669" delay={80} />
              <MetricCard icon="pressure" label="Pressure records" value={String(analytics.attention)} helper="Stressed or overwhelmed" color="#d46645" delay={120} />
              <MetricCard icon="people" label="Latest activity" value={analytics.latest ? formatDate(analytics.latest.recordedAt) : 'None'} helper={analytics.latest ? moodMeta[analytics.latest.mood].label : 'No check-ins yet'} color="#2563eb" delay={160} />
              <MetricCard icon="reflection" label="Mood balance" value={`${analytics.balance}%`} helper="Steady-signal share" color="#7650b5" delay={200} />
            </div>
            <div className="mc-chart-grid">{charts}</div>
            <div className="mc-role-grid"><AttentionBoard records={records} /><InsightCard records={records} summary={summary} role={role} /></div>
            <MoodHistory records={records} role={role} />
            <div className="mc-footer-grid"><Guidance role={role} /><MoodForm onSaved={loadData} compact /></div>
          </>
        ) : null}
      </div>
    </>
  );
}
