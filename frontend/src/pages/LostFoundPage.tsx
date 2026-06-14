import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { EmptyState as UIEmptyState } from '../components/ui/EmptyState';
import { ButtonSpinner, PageLoadingState } from '../components/ui/LoadingStates';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { lostFoundService } from '../services/lostFoundService';
import type { LostFoundItem, LostFoundItemType, LostFoundStatus } from '../types/lostFound';
import { formatDate } from '../utils/formatDate';

type Role = 'student' | 'mentor' | 'admin';
type IconName = 'lost' | 'found' | 'location' | 'calendar' | 'status' | 'search' | 'report' | 'resolved' | 'timeline' | 'insight' | 'arrow' | 'close';

const statuses: LostFoundStatus[] = ['open', 'claimed', 'resolved'];
const typeMeta = {
  lost: { label: 'Lost', color: '#c88719', soft: '#fff7e8', icon: 'lost' as IconName },
  found: { label: 'Found', color: '#0d9e8a', soft: '#e8f8f5', icon: 'found' as IconName }
};
const statusMeta: Record<LostFoundStatus, { label: string; color: string; soft: string }> = {
  open: { label: 'Open', color: '#2563eb', soft: '#eff6ff' },
  claimed: { label: 'Claimed', color: '#c88719', soft: '#fff7e8' },
  resolved: { label: 'Resolved', color: '#059669', soft: '#ecfdf5' }
};

const iconPaths: Record<IconName, ReactNode> = {
  lost: <><path d="M4 7h16v13H4z" /><path d="M8 7V5a4 4 0 0 1 8 0v2M12 11v4M12 18h.01" /></>,
  found: <><path d="M5 8h14v12H5z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /><path d="m9 14 2 2 4-4" /></>,
  location: <><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" /><circle cx="12" cy="10" r="2.4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  status: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  report: <><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4M9 12h6M9 16h4" /></>,
  resolved: <><path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></>,
  timeline: <><path d="M4 6h16M4 12h10M4 18h13" /><circle cx="19" cy="12" r="2" /></>,
  insight: <><path d="M9 18h6M10 22h4" /><path d="M8.3 15.2A7 7 0 1 1 15.7 15c-.8.6-1.2 1.3-1.2 2h-5c0-.8-.4-1.3-1.2-1.8Z" /></>,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />
};

function Icon({ name, size = 40, color = '#0d9e8a', background = 'rgba(13,158,138,.1)' }: { name: IconName; size?: number; color?: string; background?: string }) {
  return <span className="lf-icon" style={{ width: size, height: size, color, background }}><svg aria-hidden="true" width={size * .52} height={size * .52} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg></span>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return <div className="lf-heading">{eyebrow ? <span>{eyebrow}</span> : null}<h2>{title}</h2><p>{description}</p></div>;
}

function EmptyState({ title, text, actionHref, actionLabel, icon = 'item' }: { title: string; text: string; actionHref?: string; actionLabel?: string; icon?: 'item' | 'search' | 'chart' }) {
  const isPersonal = title === 'No personal reports yet';
  const isFilterResult = title === 'No reports match your filters';
  return <UIEmptyState
    icon={isFilterResult ? 'search' : icon}
    title={isPersonal ? 'No lost or found reports yet' : isFilterResult ? 'No matching items' : title}
    description={isPersonal ? 'Report a lost or found item to help the campus community return it.' : isFilterResult ? 'Try changing the item type, status, location, or search text.' : text}
    actionHref={isPersonal ? '#report-form' : actionHref}
    actionLabel={isPersonal ? 'Create report' : actionLabel}
    variant="soft"
  />;
}

function Hero({ role, total, open, location }: { role: Role; total: number; open: number; location: string }) {
  const content = role === 'student'
    ? { eyebrow: 'Campus item support', title: 'Report and find campus items.', description: 'Lost something? Found something? CampusCare keeps reports clear, searchable, and easy to follow.', badges: ['Lost reports', 'Found reports', 'Campus locations', 'Status tracking'] }
    : role === 'mentor'
      ? { eyebrow: 'Mentor support view', title: 'Support practical campus needs.', description: 'Review recent lost and found activity and help students create safe, useful reports.', badges: [`${open} open reports`, `${total} total reports`, `${location} active location`] }
      : { eyebrow: 'Item report module active', title: 'Lost & Found overview.', description: 'Monitor campus item reports, open cases, locations, and resolution progress.', badges: [`${total} total reports`, `${open} open cases`, `${location} most active`] };
  return (
    <section className="lf-hero lf-reveal">
      <div><span className="lf-eyebrow"><i />{content.eyebrow}</span><h1>{content.title}</h1><p>{content.description}</p><div className="lf-hero-badges">{content.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>{role === 'student' ? <div className="lf-hero-actions"><a href="#report-form">Report an item <Icon name="arrow" size={22} color="#fff" background="transparent" /></a><a href="#campus-reports">Browse reports</a></div> : null}</div>
      <div className="lf-hero-visual"><div><Icon name="location" size={58} color="#67e3d6" background="rgba(103,227,214,.1)" /></div><span>Small details help the right item return to the right person.</span></div>
    </section>
  );
}

function MetricCard({ icon, label, value, helper, color, delay = 0 }: { icon: IconName; label: string; value: string; helper: string; color: string; delay?: number }) {
  return <article className="lf-card lf-metric lf-lift lf-reveal" style={{ animationDelay: `${delay}ms` }}><div><Icon name={icon} color={color} background={`${color}14`} /><i style={{ background: color }} /></div><span>{label}</span><strong style={{ color }}>{value}</strong><p>{helper}</p></article>;
}

function ReportForm({ initialType, onSaved }: { initialType: LostFoundItemType; onSaved: (message: string) => Promise<void> }) {
  const [form, setForm] = useState({ title: '', description: '', location: '', item_type: initialType, item_date: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!form.title.trim() || !form.description.trim()) return setError('Item name and description are required.');
    try {
      setIsSubmitting(true);
      await lostFoundService.create({ title: form.title.trim(), description: form.description.trim(), location: form.location.trim() || undefined, item_type: form.item_type, item_date: form.item_date || undefined });
      setForm({ title: '', description: '', location: '', item_type: 'lost', item_date: '' });
      await onSaved('Item report created. It is now visible in campus reports.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="lf-card lf-form" id="report-form" onSubmit={submit}>
      <SectionHeading eyebrow="New report" title="Report a campus item" description="Clear details make matching and returning an item much easier." />
      {error ? <div className="lf-alert lf-alert-error">{error}</div> : null}
      <div className="lf-type-options">{(['lost', 'found'] as LostFoundItemType[]).map((type) => { const meta = typeMeta[type]; return <button aria-pressed={form.item_type === type} className={form.item_type === type ? 'is-active' : ''} key={type} onClick={() => setForm((current) => ({ ...current, item_type: type }))} style={{ '--type-color': meta.color, '--type-soft': meta.soft } as CSSProperties} type="button"><Icon name={meta.icon} color={meta.color} background={meta.soft} /><div><strong>{meta.label} item</strong><span>{type === 'lost' ? 'I am looking for an item.' : 'I found an item on campus.'}</span></div></button>; })}</div>
      <div className="lf-form-grid">
        <label><span>Item name</span><input placeholder="e.g. Laptop charger" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label><span>Location</span><input placeholder="e.g. Computer Lab 2" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
        <label><span>Item date</span><input type="date" value={form.item_date} onChange={(event) => setForm({ ...form, item_date: event.target.value })} /></label>
        <label className="lf-description"><span>Description</span><textarea placeholder="Color, brand, unique details, and where you last saw it." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      </div>
      <button className="lf-primary-button" disabled={isSubmitting} type="submit">{isSubmitting ? <><ButtonSpinner />Creating report...</> : <>Report {form.item_type} item<Icon name="arrow" size={23} color="#fff" background="transparent" /></>}</button>
    </form>
  );
}

function TypeChart({ items }: { items: LostFoundItem[] }) {
  const lost = items.filter((item) => item.itemType === 'lost').length;
  const found = items.length - lost;
  const total = items.length;
  return <section className="lf-card lf-chart"><SectionHeading eyebrow="Report mix" title="Lost vs found" description="Current balance of campus item reports." />{total ? <div className="lf-type-chart"><div className="lf-donut" style={{ background: `conic-gradient(${typeMeta.lost.color} 0 ${(lost / total) * 100}%,${typeMeta.found.color} ${(lost / total) * 100}% 100%)` }}><span><strong>{total}</strong>reports</span></div><div><p><i style={{ background: typeMeta.lost.color }} /><span>Lost reports</span><strong>{lost}</strong></p><p><i style={{ background: typeMeta.found.color }} /><span>Found reports</span><strong>{found}</strong></p></div></div> : <EmptyState title="No item reports yet" text="Campus item tracking will appear after lost or found reports are created." icon="chart" />}</section>;
}

function StatusChart({ items }: { items: LostFoundItem[] }) {
  const counts = statuses.map((status) => ({ status, count: items.filter((item) => item.status === status).length }));
  return <section className="lf-card lf-chart"><SectionHeading eyebrow="Resolution path" title="Status distribution" description="Progress from open report to returned item." />{items.length ? <><div className="lf-status-segments">{counts.map(({ status, count }) => count ? <span key={status} style={{ width: `${(count / items.length) * 100}%`, background: statusMeta[status].color }} /> : null)}</div><div className="lf-status-list">{counts.map(({ status, count }) => <div key={status}><i style={{ background: statusMeta[status].color }} /><span>{statusMeta[status].label}</span><strong>{count}</strong><small>{Math.round((count / items.length) * 100)}%</small></div>)}</div></> : <EmptyState title="No status activity yet" text="Resolution progress will appear after reports are added." />}</section>;
}

function LocationChart({ items }: { items: LostFoundItem[] }) {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(item.location || 'Location not specified', (counts.get(item.location || 'Location not specified') ?? 0) + 1));
  const rows = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(1, ...rows.map(([, count]) => count));
  return <section className="lf-card lf-chart"><SectionHeading eyebrow="Campus pattern" title="Reports by location" description="Repeated locations across current item activity." />{rows.length ? <div className="lf-bars">{rows.map(([location, count], index) => <div key={location}><div><span>{location}</span><strong>{count}</strong></div><div><span style={{ width: `${(count / max) * 100}%`, animationDelay: `${index * 60}ms` }} /></div></div>)}</div> : <EmptyState title="No location data yet" text="Locations will appear when reports include them." />}</section>;
}

function RecentTimeline({ items }: { items: LostFoundItem[] }) {
  const recent = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  return <section className="lf-card lf-chart"><SectionHeading eyebrow="Recent activity" title="Campus report timeline" description="Latest item activity, ordered by report creation." />{recent.length ? <div className="lf-timeline">{recent.map((item) => { const meta = typeMeta[item.itemType]; return <div key={item.id}><span style={{ background: meta.soft, color: meta.color }}><Icon name={meta.icon} size={30} color={meta.color} background="transparent" /></span><div><strong>{item.title}</strong><small>{item.location || 'No location'} · {formatDate(item.createdAt)}</small></div><b style={{ color: statusMeta[item.status].color }}>{statusMeta[item.status].label}</b></div>; })}</div> : <EmptyState title="No recent reports" text="New campus reports will appear here." />}</section>;
}

function Filters({ search, setSearch, type, setType, status, setStatus, location, setLocation, locations }: { search: string; setSearch: (value: string) => void; type: LostFoundItemType | ''; setType: (value: LostFoundItemType | '') => void; status: LostFoundStatus | ''; setStatus: (value: LostFoundStatus | '') => void; location: string; setLocation: (value: string) => void; locations: string[] }) {
  return <div className="lf-card lf-filters"><div className="lf-search"><Icon name="search" size={32} color="#64748b" background="transparent" /><input placeholder="Search item, description, or location" value={search} onChange={(event) => setSearch(event.target.value)} /></div><select value={type} onChange={(event) => setType(event.target.value as LostFoundItemType | '')}><option value="">All types</option><option value="lost">Lost</option><option value="found">Found</option></select><select value={status} onChange={(event) => setStatus(event.target.value as LostFoundStatus | '')}><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="">All locations</option>{locations.map((value) => <option key={value}>{value}</option>)}</select></div>;
}

function ItemCard({ item, selected, onSelect }: { item: LostFoundItem; selected: boolean; onSelect: () => void }) {
  const type = typeMeta[item.itemType];
  const status = statusMeta[item.status];
  return <article className={`lf-card lf-item-card lf-lift ${selected ? 'is-selected' : ''}`} onClick={onSelect} style={{ '--item-color': item.status === 'resolved' ? status.color : type.color } as CSSProperties}><div className="lf-item-top"><Icon name={type.icon} color={type.color} background={type.soft} /><div><span style={{ color: type.color, background: type.soft }}>{type.label}</span><span style={{ color: status.color, background: status.soft }}>{status.label}</span></div></div><h3>{item.title}</h3><div className="lf-meta"><span><Icon name="location" size={22} color="#64748b" background="transparent" />{item.location || 'Location not specified'}</span><span><Icon name="calendar" size={22} color="#64748b" background="transparent" />{formatDate(item.itemDate || item.createdAt)}</span></div><p>{item.description}</p><button type="button" onClick={(event) => { event.stopPropagation(); onSelect(); }}>Open report <Icon name="arrow" size={22} color="#0d9e8a" background="transparent" /></button></article>;
}

function DetailPanel({ item, canManage, onStatus }: { item: LostFoundItem | null; canManage: boolean; onStatus: (id: string, status: LostFoundStatus) => Promise<void> }) {
  if (!item) return <aside className="lf-card lf-detail"><EmptyState title="Select a report" text="Choose an item report to review location, date, status, and description." /></aside>;
  const type = typeMeta[item.itemType];
  const status = statusMeta[item.status];
  return <aside className="lf-card lf-detail"><div className="lf-detail-head"><Icon name={type.icon} size={48} color={type.color} background={type.soft} /><div><span style={{ color: type.color, background: type.soft }}>{type.label} item</span><span style={{ color: status.color, background: status.soft }}>{status.label}</span></div></div><h2>{item.title}</h2><p className="lf-reporter">Reported by {item.reporterName || 'CampusCare user'} · {formatDate(item.createdAt)}</p><div className="lf-detail-description">{item.description}</div><dl><div><dt>Location</dt><dd>{item.location || 'Not specified'}</dd></div><div><dt>Item date</dt><dd>{formatDate(item.itemDate || item.createdAt)}</dd></div><div><dt>Last updated</dt><dd>{formatDate(item.updatedAt)}</dd></div></dl>{canManage ? <div className="lf-status-actions"><span>Update report status</span>{statuses.map((value) => <button disabled={item.status === value} key={value} onClick={() => void onStatus(item.id, value)} type="button">{statusMeta[value].label}</button>)}</div> : <div className="lf-safe-note"><Icon name="resolved" size={34} color="#0d9e8a" background="#e8f8f5" /><span>Use safe communication and avoid sharing private contact details publicly.</span></div>}</aside>;
}

function Guidance({ role, activeLocation }: { role: Role; activeLocation: string }) {
  const items = role === 'student' ? ['Mention the exact campus location.', 'Include the item date.', 'Describe color, brand, or unique details.', 'Avoid sensitive personal information.'] : role === 'mentor' ? ['Encourage clear report details.', 'Remind students to update returned items.', 'Support safe communication.', 'Avoid sharing private information.'] : ['Review open lost reports first.', 'Watch repeated report locations.', 'Encourage complete descriptions.', 'Use status updates consistently.'];
  return <section className="lf-card lf-guidance"><Icon name="insight" size={46} color="#2563eb" background="#eff6ff" /><div><span>{role === 'student' ? 'Write a useful report' : role === 'mentor' ? 'How mentors can help' : 'Operational insight'}</span><h2>{role === 'admin' ? `${activeLocation} has the most visible activity.` : 'Clear details help items return safely.'}</h2><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div></section>;
}

export default function LostFoundPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<LostFoundItemType | ''>('');
  const [statusFilter, setStatusFilter] = useState<LostFoundStatus | ''>('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const role: Role = user?.role === 'mentor' || user?.role === 'admin' ? user.role : 'student';

  async function loadItems() {
    setError('');
    try {
      setIsLoading(true);
      const data = await lostFoundService.list();
      setItems(data);
      setSelectedId((current) => current && data.some((item) => item.id === current) ? current : data[0]?.id ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadItems(); }, []);

  async function saved(nextMessage: string) {
    setMessage(nextMessage);
    await loadItems();
  }

  async function updateStatus(id: string, status: LostFoundStatus) {
    try {
      setError('');
      await lostFoundService.updateStatus(id, status);
      setMessage(`Report marked ${status}.`);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  const analytics = useMemo(() => {
    const locations = new Map<string, number>();
    items.forEach((item) => { if (item.location) locations.set(item.location, (locations.get(item.location) ?? 0) + 1); });
    const activeLocation = [...locations].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No location yet';
    return {
      lost: items.filter((item) => item.itemType === 'lost').length,
      found: items.filter((item) => item.itemType === 'found').length,
      open: items.filter((item) => item.status === 'open').length,
      completed: items.filter((item) => item.status !== 'open').length,
      activeLocation,
      locations: [...locations.keys()].sort()
    };
  }, [items]);
  const myItems = useMemo(() => items.filter((item) => item.userId === user?.id), [items, user?.id]);
  const myOpen = myItems.filter((item) => item.status === 'open').length;

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return items.filter((item) => (!normalized || `${item.title} ${item.description} ${item.location ?? ''}`.toLowerCase().includes(normalized)) && (!typeFilter || item.itemType === typeFilter) && (!statusFilter || item.status === statusFilter) && (!locationFilter || item.location === locationFilter));
  }, [items, locationFilter, search, statusFilter, typeFilter]);

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const canManageSelected = Boolean(selected && (user?.role === 'admin' || selected.userId === user?.id));

  return (
    <>
      <style>{`
        @keyframes lfReveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes lfGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}} @keyframes lfPulse{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.2)}50%{box-shadow:0 0 0 6px rgba(37,99,235,0)}}
        .lf-page{margin:-2rem;min-height:100vh;padding:2rem;overflow:hidden;color:#0b1d35;background:radial-gradient(circle at 92% 4%,rgba(13,158,138,.11),transparent 25rem),radial-gradient(circle at 0 48%,rgba(37,99,235,.07),transparent 28rem),linear-gradient(180deg,#f8fbff,#eef4f8);font-family:"DM Sans",sans-serif}.lf-page *{box-sizing:border-box}.lf-reveal{animation:lfReveal .45s ease both}.lf-card{min-width:0;border:1px solid #dfeaf3;border-radius:18px;background:rgba(255,255,255,.92);box-shadow:0 12px 32px rgba(15,23,42,.055);backdrop-filter:blur(12px)}.lf-lift{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}.lf-lift:hover{transform:translateY(-3px);border-color:rgba(13,158,138,.28);box-shadow:0 18px 42px rgba(15,23,42,.1)}.lf-icon{display:inline-flex;flex:none;align-items:center;justify-content:center;border-radius:30%}
        .lf-hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 260px;align-items:center;gap:2rem;min-height:250px;overflow:hidden;padding:2rem;border:1px solid rgba(255,255,255,.09);border-radius:24px;color:#fff;background:radial-gradient(circle at 88% 5%,rgba(103,227,214,.24),transparent 31%),linear-gradient(135deg,#071527,#0b1d35 56%,#0f3b52);box-shadow:0 20px 46px rgba(11,29,53,.18)}.lf-hero::after{content:"";position:absolute;right:-75px;bottom:-130px;width:330px;height:330px;border:1px solid rgba(103,227,214,.12);border-radius:50%}.lf-hero>*{position:relative;z-index:1}.lf-eyebrow{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(103,227,214,.22);border-radius:999px;padding:.36rem .76rem;background:rgba(103,227,214,.08);color:#bdf8ef;font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.lf-eyebrow i{width:7px;height:7px;border-radius:50%;background:#67e3d6}.lf-hero h1{margin:.9rem 0 .55rem;font-family:"Sora",sans-serif;font-size:clamp(1.75rem,3.2vw,2.65rem)}.lf-hero p{max-width:720px;margin:0;color:rgba(255,255,255,.68);font-size:.9rem;line-height:1.7}.lf-hero-badges,.lf-hero-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.1rem}.lf-hero-badges span{border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:.38rem .7rem;background:rgba(255,255,255,.06);color:rgba(255,255,255,.78);font-size:.68rem;font-weight:700}.lf-hero-actions a{display:inline-flex;min-height:39px;align-items:center;justify-content:center;gap:.35rem;border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:.5rem .85rem;color:#fff;background:rgba(255,255,255,.07);font-size:.72rem;font-weight:800;text-decoration:none}.lf-hero-actions a:first-child{border-color:#0d9e8a;background:#0d9e8a}.lf-hero-visual{display:grid;justify-items:center;gap:.85rem;text-align:center}.lf-hero-visual>div{display:grid;width:126px;height:126px;place-items:center;border:1px solid rgba(103,227,214,.2);border-radius:50%;background:rgba(255,255,255,.045);box-shadow:inset 0 0 0 14px rgba(255,255,255,.022)}.lf-hero-visual>span{max-width:210px;color:rgba(255,255,255,.58);font-size:.7rem;line-height:1.55}
        .lf-heading>span,.lf-metric>span,.lf-guidance>div>span{display:block;color:#0d9e8a;font-size:.64rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.lf-heading h2,.lf-guidance h2{margin:.25rem 0 0;font-family:"Sora",sans-serif;font-size:1.05rem}.lf-heading p{margin:.3rem 0 0;color:#64748b;font-size:.74rem;line-height:1.55}.lf-alert{margin:1rem 0 0;border-radius:9px;padding:.65rem .75rem;font-size:.72rem}.lf-alert-success{border:1px solid #bbebdc;color:#047857;background:#ecfdf5}.lf-alert-error,.lf-page-error{border:1px solid #fecaca;color:#b91c1c;background:#fef2f2}.lf-page-error{margin:1rem 0;border-radius:10px;padding:.75rem;font-size:.75rem}
        .lf-metrics{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1rem;margin-top:1.2rem}.lf-metric{padding:1rem}.lf-metric>div{display:flex;align-items:center;justify-content:space-between}.lf-metric>div i{width:32px;height:3px;border-radius:999px}.lf-metric>span{margin-top:.8rem;color:#64748b}.lf-metric>strong{display:block;margin:.3rem 0 .2rem;overflow:hidden;font-family:"Sora",sans-serif;font-size:1.4rem;text-overflow:ellipsis;text-transform:capitalize;white-space:nowrap}.lf-metric p{margin:0;color:#94a3b8;font-size:.68rem}
        .lf-form-layout{display:grid;grid-template-columns:minmax(350px,.8fr) minmax(0,1.2fr);gap:1rem;margin-top:1rem}.lf-form{padding:1.25rem}.lf-type-options{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;margin-top:1rem}.lf-type-options button{display:flex;align-items:center;gap:.6rem;border:1px solid #e1eaf1;border-radius:11px;padding:.65rem;color:#475569;background:#f9fcfe;text-align:left;cursor:pointer}.lf-type-options button.is-active{border-color:var(--type-color);background:linear-gradient(145deg,#fff,var(--type-soft));box-shadow:0 0 0 3px color-mix(in srgb,var(--type-color) 9%,transparent)}.lf-type-options strong,.lf-type-options span{display:block}.lf-type-options strong{font-size:.7rem}.lf-type-options span{margin-top:.12rem;color:#7b8ba0;font-size:.58rem}.lf-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.65rem;margin-top:.8rem}.lf-form label{display:grid;gap:.35rem;color:#334155;font-size:.68rem;font-weight:800}.lf-form input,.lf-form textarea,.lf-filters select{width:100%;border:1px solid #d8e4ed;border-radius:10px;outline:none;padding:.65rem .75rem;color:#0b1d35;background:#f9fcfe;font:inherit;font-size:.72rem}.lf-form input:focus,.lf-form textarea:focus,.lf-filters select:focus{border-color:#0d9e8a;box-shadow:0 0 0 3px rgba(13,158,138,.1)}.lf-description{grid-column:1/-1}.lf-form textarea{min-height:82px;resize:vertical}.lf-primary-button{display:flex;width:100%;min-height:42px;align-items:center;justify-content:center;gap:.4rem;margin-top:.8rem;border:0;border-radius:10px;color:#fff;background:#0d9e8a;font:inherit;font-size:.7rem;font-weight:800;cursor:pointer}.lf-primary-button:disabled{opacity:.6}.lf-guidance{display:grid;grid-template-columns:auto 1fr;align-items:start;gap:1rem;padding:1.2rem}.lf-guidance ul{display:grid;grid-template-columns:1fr 1fr;gap:.45rem 1rem;margin:.7rem 0 0;padding:0;list-style:none}.lf-guidance li{position:relative;padding-left:14px;color:#64748b;font-size:.68rem}.lf-guidance li::before{content:"";position:absolute;top:.4rem;left:0;width:5px;height:5px;border-radius:50%;background:#0d9e8a}
        .lf-my-reports{margin-top:1rem}.lf-my-report-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.65rem;margin-top:.8rem}.lf-my-report-list button{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:.55rem;border:1px solid #dfeaf3;border-radius:12px;padding:.7rem;color:#0b1d35;background:rgba(255,255,255,.9);box-shadow:0 8px 22px rgba(15,23,42,.04);font:inherit;text-align:left;cursor:pointer;transition:.18s ease}.lf-my-report-list button:hover{transform:translateY(-2px);border-color:rgba(13,158,138,.3);box-shadow:0 12px 28px rgba(15,23,42,.08)}.lf-my-report-list button>span{min-width:0}.lf-my-report-list strong,.lf-my-report-list small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lf-my-report-list strong{font-size:.68rem}.lf-my-report-list small{margin-top:.12rem;color:#94a3b8;font-size:.55rem}.lf-my-report-list b{grid-column:2;justify-self:start;border-radius:999px;padding:.25rem .45rem;font-size:.54rem}
        .lf-chart-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-top:1rem}.lf-chart{padding:1.15rem}.lf-type-chart{display:grid;grid-template-columns:115px 1fr;align-items:center;gap:1rem;margin-top:1rem}.lf-donut{position:relative;display:grid;width:108px;height:108px;place-items:center;border-radius:50%}.lf-donut::after{content:"";position:absolute;inset:16px;border-radius:50%;background:#fff}.lf-donut span{position:relative;z-index:1;display:grid;color:#64748b;font-size:.56rem;text-align:center}.lf-donut strong{color:#0b1d35;font-family:"Sora",sans-serif;font-size:1.2rem}.lf-type-chart p{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.4rem;margin:.45rem 0;color:#64748b;font-size:.62rem}.lf-type-chart i,.lf-status-list i{width:7px;height:7px;border-radius:50%}.lf-type-chart strong,.lf-status-list strong{color:#0b1d35}.lf-status-segments{display:flex;height:12px;overflow:hidden;margin-top:1rem;border-radius:999px;background:#e8eff5}.lf-status-segments span,.lf-bars>div>div:last-child span{height:100%;transform-origin:left;animation:lfGrow .7s ease both}.lf-status-list{display:grid;gap:.5rem;margin-top:.8rem}.lf-status-list>div{display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:.4rem;color:#64748b;font-size:.6rem}.lf-status-list small{color:#94a3b8}.lf-bars{display:grid;gap:.65rem;margin-top:1rem}.lf-bars>div>div:first-child{display:flex;justify-content:space-between;gap:.5rem;color:#64748b;font-size:.62rem}.lf-bars>div>div:first-child span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lf-bars>div>div:last-child{height:7px;margin-top:.25rem;border-radius:999px;background:#e8eff5}.lf-bars>div>div:last-child span{display:block;border-radius:999px;background:linear-gradient(90deg,#0d9e8a,#2563eb)}.lf-timeline{display:grid;gap:.45rem;margin-top:.9rem}.lf-timeline>div{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.55rem;border-bottom:1px solid #edf2f7;padding:.42rem 0}.lf-timeline>div:last-child{border:0}.lf-timeline>div>span{display:grid;width:32px;height:32px;place-items:center;border-radius:9px}.lf-timeline strong,.lf-timeline small{display:block}.lf-timeline strong{font-size:.66rem}.lf-timeline small{margin-top:.1rem;color:#94a3b8;font-size:.54rem}.lf-timeline b{font-size:.56rem}
        .lf-filters{display:grid;grid-template-columns:minmax(240px,1fr) repeat(3,minmax(130px,.38fr));gap:.6rem;margin-top:1rem;padding:.7rem}.lf-search{display:flex;align-items:center;border:1px solid #d8e4ed;border-radius:10px;background:#f9fcfe}.lf-search input{min-width:0;flex:1;border:0;outline:0;padding:.65rem .2rem;background:transparent;font:inherit;font-size:.7rem}.lf-workspace{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(310px,.65fr);gap:1rem;margin-top:1rem}.lf-items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}.lf-item-card{position:relative;overflow:hidden;padding:.9rem;border-left:3px solid var(--item-color);cursor:pointer}.lf-item-card.is-selected{border-color:var(--item-color);box-shadow:0 0 0 3px color-mix(in srgb,var(--item-color) 9%,transparent),0 14px 32px rgba(15,23,42,.08)}.lf-item-top{display:flex;align-items:center;justify-content:space-between;gap:.6rem}.lf-item-top>div{display:flex;gap:.35rem}.lf-item-top>div span,.lf-detail-head span{border-radius:999px;padding:.28rem .5rem;font-size:.56rem;font-weight:850}.lf-item-card h3{margin:.7rem 0 .4rem;font-family:"Sora",sans-serif;font-size:.85rem}.lf-meta{display:flex;flex-wrap:wrap;gap:.6rem;color:#64748b;font-size:.58rem}.lf-meta span{display:flex;align-items:center}.lf-item-card>p{display:-webkit-box;overflow:hidden;margin:.55rem 0;color:#64748b;font-size:.66rem;line-height:1.5;-webkit-box-orient:vertical;-webkit-line-clamp:2}.lf-item-card>button{display:flex;align-items:center;gap:.25rem;margin-left:auto;border:0;color:#0d9e8a;background:transparent;font:inherit;font-size:.62rem;font-weight:800;cursor:pointer}.lf-detail{position:sticky;top:1rem;align-self:start;padding:1.2rem}.lf-detail-head{display:flex;align-items:center;justify-content:space-between;gap:.6rem}.lf-detail-head>div{display:flex;gap:.35rem}.lf-detail h2{margin:.8rem 0 .2rem;font-family:"Sora",sans-serif;font-size:1.15rem}.lf-reporter{margin:0;color:#94a3b8;font-size:.62rem}.lf-detail-description{margin-top:.8rem;border:1px solid #e7eef4;border-radius:11px;padding:.8rem;color:#475569;background:#f8fbfd;font-size:.7rem;line-height:1.6}.lf-detail dl{display:grid;gap:.5rem;margin:.8rem 0}.lf-detail dl div{display:flex;justify-content:space-between;gap:1rem;border-bottom:1px solid #edf2f7;padding:.4rem 0;font-size:.64rem}.lf-detail dt{color:#94a3b8}.lf-detail dd{margin:0;color:#334155;font-weight:700;text-align:right}.lf-status-actions{display:flex;flex-wrap:wrap;gap:.4rem;border-top:1px solid #edf2f7;padding-top:.75rem}.lf-status-actions>span{width:100%;color:#64748b;font-size:.6rem;font-weight:800}.lf-status-actions button{border:1px solid #dce6ed;border-radius:8px;padding:.4rem .55rem;color:#475569;background:#fff;font:inherit;font-size:.6rem;font-weight:800;cursor:pointer}.lf-status-actions button:disabled{opacity:.45}.lf-safe-note{display:flex;align-items:center;gap:.6rem;border-radius:10px;padding:.65rem;color:#64748b;background:#f0fbf9;font-size:.62rem;line-height:1.45}.lf-empty{display:grid;min-height:150px;place-items:center;align-content:center;gap:.4rem;margin-top:1rem;border:1px dashed #d5e2ec;border-radius:12px;padding:1rem;background:#f8fbfd;text-align:center}.lf-empty strong{font-size:.75rem}.lf-empty>span:last-child{color:#94a3b8;font-size:.65rem}.lf-loading{display:grid;min-height:240px;place-items:center;margin-top:1rem;color:#64748b}
        @media(max-width:1200px){.lf-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}.lf-chart-grid,.lf-my-report-list{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:940px){.lf-hero{grid-template-columns:1fr 180px}.lf-form-layout,.lf-workspace{grid-template-columns:1fr}.lf-detail{position:static}.lf-filters{grid-template-columns:1fr 1fr}.lf-search{grid-column:1/-1}}@media(max-width:720px){.lf-page{margin:-1rem;padding:1rem}.lf-hero{grid-template-columns:1fr;min-height:0;padding:1.35rem}.lf-hero-visual{display:none}.lf-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.lf-chart-grid,.lf-items,.lf-my-report-list{grid-template-columns:1fr}.lf-form-grid,.lf-guidance ul{grid-template-columns:1fr}.lf-description{grid-column:auto}}@media(max-width:480px){.lf-metrics,.lf-type-options,.lf-filters{grid-template-columns:1fr}.lf-search{grid-column:auto}.lf-type-chart{grid-template-columns:1fr;justify-items:center}.lf-type-chart>div:last-child{width:100%}}
      `}</style>
      <div className="lf-page">
        <Hero role={role} total={items.length} open={analytics.open} location={analytics.activeLocation} />
        {message ? <div className="lf-alert lf-alert-success">{message}</div> : null}
        {error ? <div className="lf-page-error">{error}</div> : null}
        {isLoading ? <PageLoadingState variant="support" label="Loading campus item reports" /> : null}
        {!isLoading && !error ? <>
          <div className="lf-metrics">
            <MetricCard icon="report" label={role === 'student' ? 'My reports' : 'Total reports'} value={String(role === 'student' ? myItems.length : items.length)} helper={role === 'student' ? 'Reports created by you' : 'Visible item activity'} color="#0b1d35" />
            <MetricCard icon="status" label={role === 'student' ? 'My open reports' : 'Open reports'} value={String(role === 'student' ? myOpen : analytics.open)} helper="Still awaiting resolution" color="#2563eb" delay={40} />
            <MetricCard icon="lost" label="Lost reports" value={String(role === 'student' ? myItems.filter((item) => item.itemType === 'lost').length : analytics.lost)} helper={role === 'student' ? 'Your lost item reports' : 'Items being searched for'} color="#c88719" delay={80} />
            <MetricCard icon="found" label="Found reports" value={String(role === 'student' ? myItems.filter((item) => item.itemType === 'found').length : analytics.found)} helper={role === 'student' ? 'Your found item reports' : 'Items reported found'} color="#0d9e8a" delay={120} />
            <MetricCard icon="resolved" label="Claimed / resolved" value={String(role === 'student' ? myItems.filter((item) => item.status !== 'open').length : analytics.completed)} helper={role === 'student' ? 'Your reports with progress' : 'Reports with progress'} color="#059669" delay={160} />
            <MetricCard icon="location" label="Active location" value={analytics.activeLocation} helper="Most frequently reported" color="#7650b5" delay={200} />
          </div>
          <div className="lf-form-layout"><ReportForm initialType="lost" onSaved={saved} /><Guidance role={role} activeLocation={analytics.activeLocation} /></div>
          {role === 'student' ? <section className="lf-my-reports"><SectionHeading eyebrow="Personal activity" title="My item reports" description="Your latest reports and their current recovery status." />{myItems.length ? <div className="lf-my-report-list">{myItems.slice(0, 4).map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} type="button"><Icon name={typeMeta[item.itemType].icon} size={34} color={typeMeta[item.itemType].color} background={typeMeta[item.itemType].soft} /><span><strong>{item.title}</strong><small>{item.location || 'No location'} · {formatDate(item.itemDate || item.createdAt)}</small></span><b style={{ color: statusMeta[item.status].color, background: statusMeta[item.status].soft }}>{statusMeta[item.status].label}</b></button>)}</div> : <EmptyState title="No personal reports yet" text="Report a lost or found item to help your campus community." />}</section> : null}
          <div className="lf-chart-grid"><TypeChart items={items} /><StatusChart items={items} /><LocationChart items={items} /><RecentTimeline items={items} /></div>
          <section id="campus-reports" style={{ marginTop: '1rem' }}><SectionHeading eyebrow={role === 'admin' ? 'Operational browser' : 'Campus reports'} title={role === 'student' ? 'Browse lost and found reports' : 'Recent item report activity'} description="Search and filter real reports, then select one to review its full details." /><Filters search={search} setSearch={setSearch} type={typeFilter} setType={setTypeFilter} status={statusFilter} setStatus={setStatusFilter} location={locationFilter} setLocation={setLocationFilter} locations={analytics.locations} /><div className="lf-workspace"><div>{filtered.length ? <div className="lf-items">{filtered.map((item) => <ItemCard item={item} key={item.id} selected={selectedId === item.id} onSelect={() => setSelectedId(item.id)} />)}</div> : items.length ? <EmptyState title="No reports match your filters" text="Try a broader search or report a lost or found item." /> : <EmptyState title={role === 'mentor' ? 'No recent campus item reports' : 'No item reports yet'} text={role === 'mentor' ? 'Lost and found activity will appear here when students submit reports.' : 'Campus item tracking will appear after lost or found reports are created.'} />}</div><DetailPanel item={selected} canManage={canManageSelected} onStatus={updateStatus} /></div></section>
        </> : null}
      </div>
    </>
  );
}
