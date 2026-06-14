import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { EmptyState as UIEmptyState } from '../components/ui/EmptyState';
import { ButtonSpinner, PageLoadingState, SkeletonTable } from '../components/ui/LoadingStates';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { helpRequestService } from '../services/helpRequestService';
import type { HelpRequest, HelpRequestCategory, HelpRequestStatus } from '../types/helpRequest';
import { formatDate } from '../utils/formatDate';

type Priority = 'high' | 'medium' | 'low';
type IconName = 'help' | 'shield' | 'reply' | 'chart' | 'priority' | 'anonymous' | 'search' | 'category' | 'status' | 'arrow';

const categories: HelpRequestCategory[] = ['subject', 'project', 'github', 'programming', 'academic_stress', 'teamwork', 'other'];
const chartCategories: HelpRequestCategory[] = ['subject', 'project', 'github', 'programming', 'academic_stress', 'teamwork'];
const statuses: HelpRequestStatus[] = ['open', 'answered', 'closed'];
const priorities: Priority[] = ['high', 'medium', 'low'];

const categoryMeta: Record<HelpRequestCategory, { label: string; color: string; background: string }> = {
  subject: { label: 'Subject', color: '#0d9e8a', background: 'rgba(13,158,138,.09)' },
  project: { label: 'Project', color: '#2563eb', background: 'rgba(37,99,235,.08)' },
  github: { label: 'GitHub', color: '#0f2647', background: 'rgba(15,38,71,.08)' },
  programming: { label: 'Programming', color: '#0891b2', background: 'rgba(8,145,178,.09)' },
  academic_stress: { label: 'Academic Stress', color: '#d97706', background: 'rgba(217,119,6,.09)' },
  teamwork: { label: 'Teamwork', color: '#059669', background: 'rgba(5,150,105,.08)' },
  other: { label: 'Other', color: '#64748b', background: 'rgba(100,116,139,.08)' }
};

const statusMeta: Record<HelpRequestStatus, { label: string; color: string; background: string }> = {
  open: { label: 'Open', color: '#0d9e8a', background: '#ecfdf5' },
  answered: { label: 'Answered', color: '#2563eb', background: '#eff6ff' },
  closed: { label: 'Closed', color: '#64748b', background: '#f1f5f9' }
};

const priorityMeta: Record<Priority, { label: string; color: string; background: string; rank: number }> = {
  high: { label: 'High', color: '#b45309', background: '#fff7ed', rank: 3 },
  medium: { label: 'Medium', color: '#2563eb', background: '#eff6ff', rank: 2 },
  low: { label: 'Low', color: '#64748b', background: '#f1f5f9', rank: 1 }
};

const iconPaths: Record<IconName, ReactNode> = {
  help: <><path d="M4 5.5h16v11H9l-5 4v-15Z" /><path d="M8 10h8M8 13h5" /></>,
  shield: <><path d="M12 3 20 6.5v6.2c0 4.6-3.2 7.5-8 9.3-4.8-1.8-8-4.7-8-9.3V6.5L12 3Z" /><path d="m8.7 12 2.1 2.1 4.7-5" /></>,
  reply: <><path d="M9 8 4 12l5 4" /><path d="M5 12h8c4 0 6 2 6 6" /></>,
  chart: <><path d="M4 20V10M10 20V5M16 20v-8M22 20V3" /><path d="M2 20h22" /></>,
  priority: <><path d="M12 3v12" /><path d="M12 20h.01" /><circle cx="12" cy="12" r="9" /></>,
  anonymous: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21c.5-4.5 2.8-7 7-7s6.5 2.5 7 7" /><path d="M4 4l16 16" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  category: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  status: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />
};

function Icon({ name, size = 38, color = '#0d9e8a', background = 'rgba(13,158,138,.09)' }: { name: IconName; size?: number; color?: string; background?: string }) {
  return (
    <span className="sh-icon" style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), color, background }}>
      <svg aria-hidden="true" width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {iconPaths[name]}
      </svg>
    </span>
  );
}

function daysOld(createdAt: string) {
  const created = new Date(createdAt).getTime();
  return Number.isNaN(created) ? 0 : Math.max(0, Math.floor((Date.now() - created) / 86_400_000));
}

function getPriority(request: HelpRequest): Priority {
  if (request.status === 'closed') return 'low';
  if (request.category === 'academic_stress' && request.status === 'open') return 'high';
  if (request.status === 'open' && daysOld(request.createdAt) >= 3) return 'high';
  if (request.status === 'open' && ['programming', 'github', 'project'].includes(request.category)) return 'medium';
  if (request.status === 'open') return 'medium';
  if (request.status === 'answered' && daysOld(request.createdAt) >= 5) return 'medium';
  return 'low';
}

function statusRank(status: HelpRequestStatus) {
  return status === 'open' ? 3 : status === 'answered' ? 2 : 1;
}

function sortRequests(left: HelpRequest, right: HelpRequest) {
  const priorityDifference = priorityMeta[getPriority(right)].rank - priorityMeta[getPriority(left)].rank;
  if (priorityDifference) return priorityDifference;
  const statusDifference = statusRank(right.status) - statusRank(left.status);
  if (statusDifference) return statusDifference;
  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

function buildSummary(requests: HelpRequest[]) {
  const categoryCounts = categories.reduce<Record<HelpRequestCategory, number>>((counts, category) => {
    counts[category] = 0;
    return counts;
  }, {} as Record<HelpRequestCategory, number>);
  const priorityCounts = priorities.reduce<Record<Priority, number>>((counts, priority) => {
    counts[priority] = 0;
    return counts;
  }, {} as Record<Priority, number>);

  requests.forEach((request) => {
    categoryCounts[request.category] += 1;
    priorityCounts[getPriority(request)] += 1;
  });

  return {
    total: requests.length,
    open: requests.filter((request) => request.status === 'open').length,
    answered: requests.filter((request) => request.status === 'answered').length,
    closed: requests.filter((request) => request.status === 'closed').length,
    anonymous: requests.filter((request) => request.isAnonymous || request.studentName === 'Anonymous Student').length,
    replies: requests.reduce((total, request) => total + (request.replies?.length ?? 0), 0),
    categoryCounts,
    priorityCounts
  };
}

function Badge({ children, color, background }: { children: ReactNode; color: string; background: string }) {
  return <span className="sh-badge" style={{ color, background }}>{children}</span>;
}

function RequestCard({ request, selected, onSelect }: { request: HelpRequest; selected: boolean; onSelect: () => void }) {
  const priority = getPriority(request);
  const priorityDetails = priorityMeta[priority];
  const category = categoryMeta[request.category];
  const status = statusMeta[request.status];
  const anonymous = request.isAnonymous || request.studentName === 'Anonymous Student';

  return (
    <article className={`sh-request-card sh-lift ${selected ? 'is-selected' : ''}`} style={{ borderLeftColor: priority === 'high' ? '#d97706' : category.color }} onClick={onSelect}>
      <div className="sh-card-head">
        <div className="sh-card-title">
          <h3>{request.title}</h3>
          <p>{anonymous ? 'Anonymous Student' : request.studentName} · {formatDate(request.createdAt)}</p>
        </div>
        <Badge color={priorityDetails.color} background={priorityDetails.background}>{priorityDetails.label}</Badge>
      </div>
      <p className="sh-preview">{request.description.length > 145 ? `${request.description.slice(0, 145)}...` : request.description}</p>
      <div className="sh-card-footer">
        <div className="sh-badge-row">
          <Badge color={category.color} background={category.background}>{category.label}</Badge>
          <Badge color={status.color} background={status.background}>{status.label}</Badge>
          <span className="sh-reply-count">{request.replies?.length ?? 0} replies</span>
        </div>
        <button className="sh-thread-link" type="button">Open thread <Icon name="arrow" size={22} color="#0d9e8a" background="transparent" /></button>
      </div>
    </article>
  );
}

function Filters({
  search,
  status,
  category,
  priority,
  onSearch,
  onStatus,
  onCategory,
  onPriority
}: {
  search: string;
  status: HelpRequestStatus | 'all';
  category: HelpRequestCategory | 'all';
  priority: Priority | 'all';
  onSearch: (value: string) => void;
  onStatus: (value: HelpRequestStatus | 'all') => void;
  onCategory: (value: HelpRequestCategory | 'all') => void;
  onPriority: (value: Priority | 'all') => void;
}) {
  return (
    <div className="sh-filters">
      <label className="sh-search">
        <Icon name="search" size={30} color="#64748b" background="transparent" />
        <input aria-label="Search requests" placeholder="Search title, description, or category" value={search} onChange={(event) => onSearch(event.target.value)} />
      </label>
      <select aria-label="Filter by status" value={status} onChange={(event) => onStatus(event.target.value as HelpRequestStatus | 'all')}>
        <option value="all">All statuses</option>
        {statuses.map((item) => <option key={item} value={item}>{statusMeta[item].label}</option>)}
      </select>
      <select aria-label="Filter by category" value={category} onChange={(event) => onCategory(event.target.value as HelpRequestCategory | 'all')}>
        <option value="all">All categories</option>
        {categories.map((item) => <option key={item} value={item}>{categoryMeta[item].label}</option>)}
      </select>
      <select aria-label="Filter by priority" value={priority} onChange={(event) => onPriority(event.target.value as Priority | 'all')}>
        <option value="all">All priorities</option>
        {priorities.map((item) => <option key={item} value={item}>{priorityMeta[item].label}</option>)}
      </select>
    </div>
  );
}

function DetailPanel({
  request,
  reply,
  canManageStatus,
  onReplyChange,
  onReply,
  onStatus
}: {
  request: HelpRequest | null;
  reply: string;
  canManageStatus: boolean;
  onReplyChange: (value: string) => void;
  onReply: () => void;
  onStatus: (status: HelpRequestStatus) => void;
}) {
  if (!request) {
    return <div className="sh-card sh-detail-empty"><UIEmptyState icon="request" title="Select a request" description="Choose a request from the list to review details, replies, and status." /></div>;
  }

  const category = categoryMeta[request.category];
  const status = statusMeta[request.status];
  const priority = priorityMeta[getPriority(request)];
  const anonymous = request.isAnonymous || request.studentName === 'Anonymous Student';

  return (
    <article className="sh-card sh-detail">
      <span className="sh-eyebrow">Selected request</span>
      <h2>{request.title}</h2>
      <p className="sh-detail-meta">{anonymous ? 'Anonymous Student' : request.studentName} · {formatDate(request.createdAt)}</p>
      <div className="sh-badge-row">
        <Badge color={category.color} background={category.background}>{category.label}</Badge>
        <Badge color={status.color} background={status.background}>{status.label}</Badge>
        <Badge color={priority.color} background={priority.background}>{priority.label} priority</Badge>
      </div>
      <div className="sh-description">{request.description}</div>
      <div className="sh-replies">
        <h3>Replies</h3>
        {request.replies?.length ? request.replies.map((item) => (
          <div className="sh-reply" key={item.id}>
            <p>{item.message}</p>
            <span>{item.replierName} · {formatDate(item.createdAt)}</span>
          </div>
        )) : <UIEmptyState compact icon="request" title="No replies yet" description="A calm, useful response can move this thread forward." variant="soft" />}
      </div>
      <div className="sh-reply-form">
        <label htmlFor={`reply-${request.id}`}>Write a supportive reply</label>
        {canManageStatus ? <p className="sh-reply-guidance">Reply with clarity, kindness, and one useful next step.</p> : null}
        <textarea id={`reply-${request.id}`} placeholder="Offer a clear next step without asking for private information." value={reply} onChange={(event) => onReplyChange(event.target.value)} />
        <button className="sh-primary-button" type="button" disabled={!reply.trim()} onClick={onReply}><Icon name="reply" size={24} color="#ffffff" background="transparent" />Send reply</button>
      </div>
      {canManageStatus ? (
        <div className="sh-status-actions">
          <span>Status actions</span>
          <div>
            {statuses.map((item) => (
              <button key={item} type="button" disabled={request.status === item} onClick={() => onStatus(item)}>Mark {item}</button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function CategoryChart({ requests }: { requests: HelpRequest[] }) {
  const summary = buildSummary(requests);
  const max = Math.max(1, ...chartCategories.map((category) => summary.categoryCounts[category]));

  return (
    <div className="sh-card sh-chart">
      <div className="sh-section-head"><div><h2>Requests by category</h2><p>Repeated support needs from currently loaded requests.</p></div><Icon name="chart" /></div>
      <div className="sh-bars">
        {chartCategories.map((category) => {
          const count = summary.categoryCounts[category];
          const meta = categoryMeta[category];
          return (
            <div key={category}>
              <div className="sh-bar-label"><span>{meta.label}</span><strong>{count}</strong></div>
              <div className="sh-bar-track"><span style={{ width: `${count ? Math.max(7, (count / max) * 100) : 3}%`, background: count ? meta.color : '#dfeaf3' }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusVisual({ requests, title = 'Request status' }: { requests: HelpRequest[]; title?: string }) {
  const summary = buildSummary(requests);
  const total = Math.max(1, summary.total);
  const openEnd = (summary.open / total) * 100;
  const answeredEnd = openEnd + (summary.answered / total) * 100;

  return (
    <div className="sh-card sh-visual-card">
      <div className="sh-section-head"><div><h2>{title}</h2><p>Open, answered, and closed support threads.</p></div><Icon name="status" /></div>
      <div className="sh-status-visual">
        <div
          className="sh-donut"
          style={{ background: summary.total ? `conic-gradient(#0d9e8a 0 ${openEnd}%,#2563eb ${openEnd}% ${answeredEnd}%,#94a3b8 ${answeredEnd}% 100%)` : '#e8eff5' }}
        >
          <span><strong>{summary.total}</strong>requests</span>
        </div>
        <div className="sh-legend">
          {statuses.map((status) => {
            const count = status === 'open' ? summary.open : status === 'answered' ? summary.answered : summary.closed;
            return <div key={status}><span><i style={{ background: statusMeta[status].color }} />{statusMeta[status].label}</span><strong>{count}</strong></div>;
          })}
        </div>
      </div>
    </div>
  );
}

function PriorityVisual({ requests }: { requests: HelpRequest[] }) {
  const summary = buildSummary(requests);
  const total = Math.max(1, summary.total);

  return (
    <div className="sh-card sh-visual-card">
      <div className="sh-section-head"><div><h2>Priority load</h2><p>Frontend priority based on category, age, and status.</p></div><Icon name="priority" color="#d97706" background="rgba(217,119,6,.09)" /></div>
      <div className="sh-priority-stack">
        {priorities.map((priority) => (
          <div key={priority}>
            <div className="sh-row-between"><span>{priorityMeta[priority].label}</span><strong>{summary.priorityCounts[priority]}</strong></div>
            <div className="sh-bar-track"><span style={{ width: `${summary.priorityCounts[priority] ? Math.max(5, summary.priorityCounts[priority] / total * 100) : 3}%`, background: priorityMeta[priority].color }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyTrend({ requests, title = 'Weekly support load' }: { requests: HelpRequest[]; title?: string }) {
  const weeks = Array.from({ length: 6 }, (_, index) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - (5 - index) * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return {
      label: `${start.getMonth() + 1}/${start.getDate()}`,
      count: requests.filter((request) => {
        const created = new Date(request.createdAt);
        return created >= start && created <= end;
      }).length
    };
  });
  const max = Math.max(1, ...weeks.map((week) => week.count));
  const points = weeks.map((week, index) => `${8 + index * 36.8},${76 - (week.count / max) * 58}`).join(' ');

  return (
    <div className="sh-card sh-visual-card">
      <div className="sh-section-head"><div><h2>{title}</h2><p>Requests grouped safely from their creation dates.</p></div><Icon name="chart" /></div>
      <div className="sh-trend">
        <svg aria-label="Six week request trend" role="img" viewBox="0 0 200 88">
          <defs><linearGradient id="shTrendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#67e3d6" stopOpacity=".32" /><stop offset="100%" stopColor="#67e3d6" stopOpacity="0" /></linearGradient></defs>
          <polyline points={`8,80 ${points} 192,80`} fill="url(#shTrendFill)" stroke="none" />
          <polyline points={points} fill="none" stroke="#0d9e8a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {weeks.map((week, index) => <circle key={week.label} cx={8 + index * 36.8} cy={76 - (week.count / max) * 58} r="3.5" fill="#ffffff" stroke="#0d9e8a" strokeWidth="2" />)}
        </svg>
        <div className="sh-trend-labels">{weeks.map((week) => <span key={week.label}>{week.label}<strong>{week.count}</strong></span>)}</div>
      </div>
    </div>
  );
}

function IdentityVisual({ requests }: { requests: HelpRequest[] }) {
  const summary = buildSummary(requests);
  const named = Math.max(0, summary.total - summary.anonymous);
  const total = Math.max(1, summary.total);

  return (
    <div className="sh-card sh-visual-card">
      <div className="sh-section-head"><div><h2>Identity preference</h2><p>Anonymous versus named support requests.</p></div><Icon name="anonymous" /></div>
      <div className="sh-identity-bar">
        <span style={{ width: `${summary.anonymous / total * 100}%` }} />
        <i style={{ width: `${named / total * 100}%` }} />
      </div>
      <div className="sh-identity-values">
        <div><span><b className="is-anonymous" />Anonymous</span><strong>{summary.anonymous}</strong></div>
        <div><span><b className="is-named" />Named</span><strong>{named}</strong></div>
      </div>
    </div>
  );
}

function SupportJourney({ request }: { request: HelpRequest | null }) {
  const hasReply = Boolean(request?.replies?.length);
  const stages = [
    { label: 'Created', complete: Boolean(request) },
    { label: 'Reviewed', complete: hasReply || request?.status === 'answered' || request?.status === 'closed' },
    { label: 'Answered', complete: request?.status === 'answered' || request?.status === 'closed' },
    { label: 'Resolved', complete: request?.status === 'closed' }
  ];

  return (
    <div className="sh-card sh-journey">
      <div className="sh-section-head"><div><h2>Support journey</h2><p>{request ? 'Progress for the selected request.' : 'Select a request to see its progress.'}</p></div><Icon name="shield" /></div>
      <div className="sh-journey-track">
        {stages.map((stage, index) => (
          <div className={`sh-journey-step ${stage.complete ? 'is-complete' : ''}`} key={stage.label}>
            <span>{index + 1}</span><strong>{stage.label}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function HelpfulEmpty({ title, text, actionHref, actionLabel }: { title: string; text: string; actionHref?: string; actionLabel?: string }) {
  return <UIEmptyState icon={actionHref ? 'request' : 'search'} title={title} description={text} actionHref={actionHref} actionLabel={actionLabel} />;
}

export default function HelpRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<HelpRequestStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<HelpRequestCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [form, setForm] = useState({ title: '', category: 'programming' as HelpRequestCategory, description: '', isAnonymous: true });
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const role = user?.role === 'mentor' || user?.role === 'admin' ? user.role : 'student';
  const isStudent = role === 'student';

  async function loadRequests() {
    setError('');
    try {
      setIsLoading(true);
      const data = await helpRequestService.list();
      setRequests(data);
      setSelectedId((current) => current || data[0]?.id || '');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      const created = await helpRequestService.create(form);
      setForm({ title: '', category: 'programming', description: '', isAnonymous: true });
      setMessage('Help request created. Your support thread is now available.');
      await loadRequests();
      setSelectedId(created.id);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReply(id: string) {
    const reply = replyText[id]?.trim();
    if (!reply) return;
    try {
      setError('');
      setMessage('');
      await helpRequestService.reply(id, reply);
      setReplyText((current) => ({ ...current, [id]: '' }));
      setMessage('Reply sent.');
      await loadRequests();
      setSelectedId(id);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleStatus(id: string, status: HelpRequestStatus) {
    try {
      setError('');
      setMessage('');
      await helpRequestService.updateStatus(id, status);
      setMessage('Help request status updated.');
      await loadRequests();
      setSelectedId(id);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  const studentRequests = useMemo(() => requests.filter((request) => request.userId === user?.id), [requests, user?.id]);
  const visibleRequests = isStudent ? studentRequests : requests;
  const summary = useMemo(() => buildSummary(visibleRequests), [visibleRequests]);
  const globalSummary = useMemo(() => buildSummary(requests), [requests]);

  const filteredRequests = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return visibleRequests.filter((request) => {
      if (statusFilter !== 'all' && request.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && request.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && getPriority(request) !== priorityFilter) return false;
      return !normalized || [request.title, request.description, request.category, request.studentName].join(' ').toLowerCase().includes(normalized);
    }).sort(sortRequests);
  }, [categoryFilter, priorityFilter, search, statusFilter, visibleRequests]);

  const selectedRequest = useMemo(
    () => filteredRequests.find((request) => request.id === selectedId) ?? filteredRequests[0] ?? null,
    [filteredRequests, selectedId]
  );

  const commonCategory = useMemo(() => {
    const entries = categories.map((category) => ({ category, count: globalSummary.categoryCounts[category] })).sort((a, b) => b.count - a.count);
    return entries[0]?.count ? categoryMeta[entries[0].category].label : 'No data';
  }, [globalSummary.categoryCounts]);

  const latestReply = studentRequests
    .flatMap((request) => request.replies ?? [])
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];

  const hero = role === 'student'
    ? { eyebrow: 'Student support space', title: 'Ask safely. Get support without pressure.', description: 'Silent Help gives you a calm space to ask for academic, project, teamwork, or exam support, anonymously if you choose.' }
    : role === 'mentor'
      ? { eyebrow: 'Mentor guidance console', title: 'Prioritize students who need guidance', description: 'Review open requests, reply with care, and notice repeated support needs before they grow.' }
      : { eyebrow: 'Admin support overview', title: 'Silent Help overview', description: 'Monitor support requests, status distribution, and repeated campus needs.' };

  const responseCoverage = globalSummary.total
    ? Math.round(((globalSummary.answered + globalSummary.closed) / globalSummary.total) * 100)
    : 0;

  const adminStats = [
    ['Total requests', globalSummary.total, 'help'],
    ['Open requests', globalSummary.open, 'priority'],
    ['Answered', globalSummary.answered, 'reply'],
    ['Closed', globalSummary.closed, 'status'],
    ['Anonymous', globalSummary.anonymous, 'anonymous'],
    ['Top category', commonCategory, 'category']
  ] as Array<[string, string | number, IconName]>;

  return (
    <>
      <style>{`
        @keyframes shReveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes shPulse{0%,100%{box-shadow:0 0 0 0 rgba(103,227,214,.3)}50%{box-shadow:0 0 0 6px rgba(103,227,214,0)}}
        .sh-page{margin:-2rem;min-height:100vh;padding:2rem;background:radial-gradient(circle at 94% 2%,rgba(13,158,138,.1),transparent 25rem),linear-gradient(180deg,#f8fbff,#eef4f8);color:#0b1d35;font-family:"DM Sans",sans-serif}
        .sh-page *{box-sizing:border-box}.sh-icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
        .sh-card{border:1px solid #dfeaf3;border-radius:18px;background:rgba(255,255,255,.92);box-shadow:0 12px 32px rgba(15,23,42,.055);backdrop-filter:blur(12px)}
        .sh-lift{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}.sh-lift:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(15,23,42,.1)}
        .sh-hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:2rem;overflow:hidden;min-height:220px;padding:2rem;border-radius:24px;color:#fff;background:radial-gradient(circle at 85% 0,rgba(103,227,214,.24),transparent 30%),linear-gradient(135deg,#071527,#0b1d35 58%,#0f3b52);box-shadow:0 18px 44px rgba(11,29,53,.18);animation:shReveal .45s ease both}
        .sh-hero-content{position:relative;z-index:1;max-width:760px}.sh-eyebrow{display:inline-block;color:#0d9e8a;font-size:.65rem;font-weight:850;letter-spacing:.09em;text-transform:uppercase}
        .sh-hero .sh-eyebrow{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(103,227,214,.2);border-radius:999px;padding:.35rem .75rem;background:rgba(103,227,214,.08);color:#bdf8ef}.sh-hero .sh-eyebrow::before{content:"";width:7px;height:7px;border-radius:50%;background:#67e3d6;animation:shPulse 2s infinite}
        .sh-hero h1{margin:.9rem 0 .55rem;font-family:"Sora",sans-serif;font-size:clamp(1.8rem,3vw,2.55rem);letter-spacing:-.025em}.sh-hero p{max-width:700px;margin:0;color:rgba(255,255,255,.66);font-size:.9rem;line-height:1.7}
        .sh-hero-actions{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1.2rem}.sh-primary-button,.sh-secondary-button{display:inline-flex;min-height:42px;align-items:center;justify-content:center;gap:7px;border-radius:11px;padding:.55rem 1rem;font-size:.78rem;font-weight:800;transition:.18s ease}
        .sh-primary-button{border:0;background:#0d9e8a;color:white;box-shadow:0 8px 20px rgba(13,158,138,.2)}.sh-primary-button:hover:not(:disabled),.sh-secondary-button:hover:not(:disabled){transform:translateY(-2px)}.sh-primary-button:disabled,.sh-secondary-button:disabled{cursor:not-allowed;opacity:.5}
        .sh-secondary-button{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:white}.sh-trust-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}.sh-trust-row span{border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:.3rem .65rem;color:rgba(255,255,255,.68);font-size:.67rem;font-weight:700}
        .sh-hero-quote{max-width:520px;margin-top:1rem!important;border-left:2px solid #67e3d6;padding-left:.8rem;color:#d8fffa!important;font-family:"Sora",sans-serif;font-size:.78rem!important;font-weight:600}
        .sh-hero-number{position:relative;z-index:1;display:grid;min-width:150px;justify-items:center}.sh-hero-number strong{font-family:"Sora",sans-serif;font-size:3rem}.sh-hero-number span{color:rgba(255,255,255,.58);font-size:.7rem}
        .sh-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-top:1.25rem}.sh-student-grid .sh-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:1rem}.sh-admin-stats{grid-template-columns:repeat(6,minmax(0,1fr))}.sh-stat{padding:1rem}.sh-stat strong{display:block;margin-top:.7rem;overflow:hidden;font-family:"Sora",sans-serif;font-size:1.55rem;text-overflow:ellipsis;white-space:nowrap}.sh-stat p{margin:.3rem 0 0;color:#64748b;font-size:.7rem}
        .sh-main-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(340px,.75fr);gap:1rem;margin-top:1.25rem;align-items:start}.sh-student-grid{grid-template-columns:minmax(330px,.72fr) minmax(0,1.28fr)}
        .sh-card-padding{padding:1.25rem}.sh-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}.sh-section-head h2{margin:0;font-family:"Sora",sans-serif;font-size:1rem}.sh-section-head p{margin:.25rem 0 0;color:#64748b;font-size:.75rem;line-height:1.5}
        .sh-form{display:grid;gap:.9rem;margin-top:1rem}.sh-form label>span,.sh-reply-form label{display:block;margin-bottom:.35rem;color:#64748b;font-size:.65rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.sh-form input,.sh-form select,.sh-form textarea,.sh-reply-form textarea{width:100%;border:1px solid #d6e2ec;border-radius:10px;background:white;padding:.7rem .8rem;color:#0b1d35;font:inherit;font-size:.8rem;outline:none;transition:.18s}.sh-form input:focus,.sh-form select:focus,.sh-form textarea:focus,.sh-reply-form textarea:focus{border-color:#0d9e8a;box-shadow:0 0 0 3px rgba(13,158,138,.1)}.sh-form textarea,.sh-reply-form textarea{min-height:105px;resize:vertical}
        .sh-anonymous{display:flex!important;align-items:flex-start;gap:.7rem;border:1px solid #ccece7;border-radius:12px;padding:.8rem;background:#f0fdfa}.sh-anonymous input{width:auto;margin-top:3px}.sh-anonymous strong,.sh-anonymous small{display:block}.sh-anonymous strong{font-size:.78rem}.sh-anonymous small{margin-top:.15rem;color:#64748b;font-size:.68rem;line-height:1.45}
        .sh-guidance{margin-top:1rem;padding:1rem}.sh-guidance ul{display:grid;gap:.45rem;margin:.8rem 0 0;padding-left:1.1rem;color:#64748b;font-size:.74rem;line-height:1.5}
        .sh-filters{display:grid;grid-template-columns:minmax(220px,1fr) repeat(3,minmax(125px,auto));gap:.65rem;margin-bottom:1rem;padding:1rem;border:1px solid #dfeaf3;border-radius:16px;background:rgba(255,255,255,.88)}.sh-search{display:flex;align-items:center;border:1px solid #d6e2ec;border-radius:10px;background:white;padding:0 .35rem}.sh-search input{min-width:0;width:100%;border:0;padding:.65rem .25rem;outline:0;font-size:.76rem}.sh-filters select{min-width:0;border:1px solid #d6e2ec;border-radius:10px;background:white;padding:.65rem;color:#475569;font-size:.73rem}
        .sh-list{display:grid;gap:.75rem}.sh-request-card{display:flex;min-height:170px;cursor:pointer;flex-direction:column;border:1px solid #dfeaf3;border-left:4px solid;border-radius:16px;background:white;padding:1rem;box-shadow:0 6px 18px rgba(15,23,42,.035);animation:shReveal .35s ease both}.sh-request-card.is-selected{border-color:rgba(13,158,138,.48);box-shadow:0 0 0 3px rgba(13,158,138,.08),0 12px 28px rgba(15,23,42,.07)}
        .sh-card-head,.sh-card-footer,.sh-row-between{display:flex;align-items:flex-start;justify-content:space-between;gap:.8rem}.sh-card-title{min-width:0}.sh-card-title h3{margin:0;color:#0b1d35;font-size:.9rem}.sh-card-title p{margin:.25rem 0 0;color:#94a3b8;font-size:.67rem}.sh-preview{margin:.75rem 0;color:#64748b;font-size:.76rem;line-height:1.6}.sh-card-footer{align-items:center;margin-top:auto}.sh-badge-row{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem}.sh-badge{display:inline-flex;border-radius:999px;padding:.28rem .6rem;font-size:.62rem;font-weight:800}.sh-reply-count{color:#64748b;font-size:.65rem}.sh-thread-link{display:inline-flex;align-items:center;gap:3px;border:0;background:transparent;color:#0d9e8a;font-size:.68rem;font-weight:800}
        .sh-detail{padding:1.25rem}.sh-detail h2{margin:.45rem 0;font-family:"Sora",sans-serif;font-size:1.25rem}.sh-detail-meta{margin:0 0 .8rem;color:#94a3b8;font-size:.7rem}.sh-description{margin-top:1rem;border:1px solid #e8eff5;border-radius:13px;padding:1rem;background:#f8fbfd;color:#475569;font-size:.78rem;line-height:1.7}.sh-replies{margin-top:1.1rem}.sh-replies h3{margin:0 0 .65rem;font-size:.85rem}.sh-reply{margin-top:.55rem;border-left:3px solid #0d9e8a;border-radius:0 10px 10px 0;padding:.75rem;background:#f8fbfd}.sh-reply p{margin:0;color:#475569;font-size:.75rem;line-height:1.55}.sh-reply span{display:block;margin-top:.35rem;color:#94a3b8;font-size:.63rem}.sh-inline-empty,.sh-detail-empty{border:1px dashed #d5e2ec;border-radius:12px;padding:1rem;background:#f8fbfd;color:#64748b;font-size:.73rem;line-height:1.5}.sh-detail-empty{display:grid;min-height:260px;place-items:center;align-content:center;text-align:center}.sh-detail-empty h3{margin:.8rem 0 .25rem;color:#0b1d35}.sh-detail-empty p{max-width:260px;margin:0}
        .sh-reply-form{margin-top:1.1rem}.sh-reply-guidance{margin:-.15rem 0 .55rem;color:#64748b;font-size:.68rem;line-height:1.5}.sh-reply-form .sh-primary-button{width:100%;margin-top:.55rem}.sh-status-actions{margin-top:1.1rem;border-top:1px solid #edf2f7;padding-top:1rem}.sh-status-actions>span{display:block;margin-bottom:.5rem;color:#64748b;font-size:.65rem;font-weight:800;text-transform:uppercase}.sh-status-actions>div{display:flex;flex-wrap:wrap;gap:.4rem}.sh-status-actions button{border:1px solid #d6e2ec;border-radius:9px;background:white;padding:.45rem .65rem;color:#475569;font-size:.67rem;font-weight:750}.sh-status-actions button:disabled{opacity:.45}
        .sh-chart{padding:1.25rem}.sh-bars{display:grid;gap:.8rem;margin-top:1rem}.sh-bar-label{display:flex;justify-content:space-between;margin-bottom:.3rem;color:#64748b;font-size:.7rem}.sh-bar-label strong{color:#0b1d35}.sh-bar-track{height:7px;overflow:hidden;border-radius:999px;background:#e8eff5}.sh-bar-track span{display:block;height:100%;border-radius:999px;transform-origin:left;animation:shBar .7s ease both}
        .sh-pulse-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:1.25rem}.sh-visual-card{min-width:0;padding:1.25rem}.sh-status-visual{display:grid;grid-template-columns:125px minmax(0,1fr);align-items:center;gap:1.25rem;margin-top:1rem}.sh-donut{position:relative;display:grid;width:120px;height:120px;place-items:center;border-radius:50%}.sh-donut::after{content:"";position:absolute;inset:16px;border-radius:50%;background:#fff}.sh-donut span{position:relative;z-index:1;display:grid;color:#64748b;font-size:.6rem;text-align:center}.sh-donut strong{color:#0b1d35;font-family:"Sora",sans-serif;font-size:1.35rem}.sh-legend{display:grid;gap:.6rem}.sh-legend>div{display:flex;align-items:center;justify-content:space-between;color:#64748b;font-size:.7rem}.sh-legend span{display:flex;align-items:center;gap:7px}.sh-legend i{width:7px;height:7px;border-radius:50%}.sh-legend strong{color:#0b1d35}.sh-priority-stack{display:grid;gap:.8rem;margin-top:1.15rem}.sh-priority-stack .sh-row-between{color:#64748b;font-size:.7rem}.sh-priority-stack strong{color:#0b1d35}.sh-trend{margin-top:.75rem}.sh-trend svg{display:block;width:100%;height:125px;overflow:visible}.sh-trend-labels{display:grid;grid-template-columns:repeat(6,1fr);gap:.2rem;color:#94a3b8;font-size:.55rem;text-align:center}.sh-trend-labels span{display:grid}.sh-trend-labels strong{margin-top:.15rem;color:#0b1d35;font-size:.68rem}
        .sh-identity-bar{display:flex;height:18px;margin-top:1.35rem;overflow:hidden;border-radius:999px;background:#e8eff5}.sh-identity-bar span{background:linear-gradient(90deg,#0d9e8a,#67e3d6);animation:shBar .7s ease both;transform-origin:left}.sh-identity-bar i{background:#2563eb}.sh-identity-values{display:grid;grid-template-columns:repeat(2,1fr);gap:.7rem;margin-top:1rem}.sh-identity-values>div{display:flex;align-items:center;justify-content:space-between;border:1px solid #e8eff5;border-radius:10px;padding:.65rem;background:#f8fbfd;color:#64748b;font-size:.68rem}.sh-identity-values span{display:flex;align-items:center;gap:6px}.sh-identity-values b{width:7px;height:7px;border-radius:50%}.sh-identity-values .is-anonymous{background:#0d9e8a}.sh-identity-values .is-named{background:#2563eb}.sh-identity-values strong{color:#0b1d35}
        .sh-journey{margin-top:1rem;padding:1.1rem}.sh-journey-track{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:.35rem;margin-top:1.15rem}.sh-journey-track::before{content:"";position:absolute;left:10%;right:10%;top:15px;height:2px;background:#e1eaf2}.sh-journey-step{position:relative;z-index:1;display:grid;justify-items:center;gap:.45rem;color:#94a3b8;font-size:.62rem;text-align:center}.sh-journey-step span{display:grid;width:32px;height:32px;place-items:center;border:3px solid #fff;border-radius:50%;background:#dfeaf3;color:#64748b;font-weight:800;box-shadow:0 0 0 1px #dfeaf3}.sh-journey-step.is-complete{color:#0b1d35}.sh-journey-step.is-complete span{background:#0d9e8a;color:#fff;box-shadow:0 0 0 1px #0d9e8a}
        .sh-analytics-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:1rem;margin-top:1.25rem}.sh-distribution{padding:1.25rem}.sh-distribution-list{display:grid;gap:.8rem;margin-top:1rem}.sh-distribution-row{display:grid;grid-template-columns:90px 1fr 30px;align-items:center;gap:.7rem;color:#64748b;font-size:.7rem}.sh-distribution-row .sh-bar-track{margin:0}.sh-insights{display:grid;gap:.65rem;margin-top:1rem}.sh-insight{display:flex;gap:.7rem;border:1px solid #e8eff5;border-radius:12px;padding:.75rem;background:#f8fbfd}.sh-insight p{margin:0;color:#64748b;font-size:.73rem;line-height:1.5}.sh-mentor-note{margin:1rem 0 0;border-left:2px solid #0d9e8a;padding-left:.75rem;color:#0b1d35;font-size:.72rem;font-weight:700}
        .sh-table{overflow-x:auto}.sh-table table{width:100%;border-collapse:collapse;min-width:760px}.sh-table th,.sh-table td{padding:.75rem;border-bottom:1px solid #edf2f7;text-align:left;font-size:.7rem}.sh-table th{color:#94a3b8;font-size:.6rem;text-transform:uppercase}.sh-table td{color:#475569}.sh-table button{border:0;background:transparent;color:#0d9e8a;font-weight:800}
        .sh-empty{display:grid;min-height:180px;place-items:center;align-content:center;gap:.45rem;border:1px dashed #d5e2ec;border-radius:16px;background:rgba(255,255,255,.7);color:#64748b;font-size:.76rem;text-align:center}.sh-empty strong{color:#0b1d35;font-family:"Sora",sans-serif;font-size:.88rem}.sh-empty p{max-width:340px;margin:0;line-height:1.55}.sh-empty a{margin-top:.35rem;border-radius:9px;background:#0d9e8a;padding:.5rem .8rem;color:#fff;font-size:.68rem;font-weight:800;text-decoration:none}
        @media(max-width:1180px){.sh-admin-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.sh-main-grid,.sh-student-grid{grid-template-columns:1fr}.sh-analytics-grid{grid-template-columns:1fr}.sh-pulse-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:850px){.sh-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sh-filters{grid-template-columns:repeat(2,minmax(0,1fr))}.sh-search{grid-column:1/-1}.sh-hero{grid-template-columns:1fr}.sh-hero-number{display:none}}
        @media(max-width:720px){.sh-page{margin:-1rem;padding:1rem}.sh-admin-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sh-card-footer{align-items:flex-start;flex-direction:column}.sh-thread-link{align-self:flex-end}.sh-pulse-grid{grid-template-columns:1fr}}
        @media(max-width:480px){.sh-stat-grid,.sh-admin-stats,.sh-filters{grid-template-columns:1fr}.sh-search{grid-column:auto}.sh-hero{padding:1.3rem}.sh-request-card{min-height:0}.sh-card-head{flex-direction:column}}
      `}</style>

      <div className="sh-page">
        <section className="sh-hero">
          <div className="sh-hero-content">
            <span className="sh-eyebrow">{hero.eyebrow}</span>
            <h1>{hero.title}</h1>
            <p>{hero.description}</p>
            {isStudent ? (
              <>
                <p className="sh-hero-quote">You do not need to handle everything alone.</p>
                <div className="sh-trust-row"><span>Anonymous option</span><span>Mentor support</span><span>Academic and emotional concerns</span></div>
                <div className="sh-hero-actions"><a className="sh-primary-button" href="#create-request"><Icon name="help" size={24} color="#fff" background="transparent" />Create a request</a><a className="sh-secondary-button" href="#request-queue">View my requests</a></div>
              </>
            ) : role === 'mentor' ? (
              <div className="sh-hero-actions"><a className="sh-primary-button" href="#request-queue">Open queue</a><a className="sh-secondary-button" href="#support-trends">View trends</a></div>
            ) : <div className="sh-trust-row"><span>Support module active</span><span>Status monitoring</span><span>Trend overview</span></div>}
          </div>
          <div className="sh-hero-number"><strong>{isStudent ? summary.open : globalSummary.open}</strong><span>{isStudent ? 'my open requests' : `${globalSummary.priorityCounts.high} high priority`}</span></div>
        </section>

        {message ? <div className="alert-success mt-4">{message}</div> : null}
        {error ? <div className="alert-error mt-4">{error}</div> : null}
        {isLoading ? (
          <div aria-busy="true" style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
            <PageLoadingState variant="support" label="Loading Silent Help requests" />
            {role === 'admin' ? <SkeletonTable rows={4} columns={6} /> : null}
          </div>
        ) : null}

        {!isLoading && !error && isStudent ? (
          <>
            <section className="sh-main-grid sh-student-grid">
              <article className="sh-card sh-card-padding" id="create-request">
                <div className="sh-section-head"><div><h2>Create a safe help request</h2><p>Share only what you feel comfortable sharing. Your request can stay anonymous.</p></div><Icon name="shield" /></div>
                <form className="sh-form" onSubmit={handleCreate}>
                  <label><span>Title</span><input required placeholder="Describe what you need help with" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
                  <label><span>Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as HelpRequestCategory })}>{categories.map((category) => <option key={category} value={category}>{categoryMeta[category].label}</option>)}</select></label>
                  <label><span>Description</span><textarea required placeholder="Explain the situation, what you tried, and what kind of support would help." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
                  <label className="sh-anonymous"><input type="checkbox" checked={form.isAnonymous} onChange={(event) => setForm({ ...form, isAnonymous: event.target.checked })} /><span><strong>Keep this request anonymous</strong><small>Your identity will appear as Anonymous Student.</small></span></label>
                  <button className="sh-primary-button" disabled={isSubmitting} type="submit">{isSubmitting ? <><ButtonSpinner />Creating request...</> : 'Submit request'}</button>
                </form>
              </article>
              <div>
                <div className="sh-section-head"><div><h2>My support snapshot</h2><p>A calm overview of your current Silent Help activity.</p></div><Icon name="chart" /></div>
                <section className="sh-stat-grid">
                  {[
                    ['My open requests', summary.open, 'help', '#0d9e8a'],
                    ['Answered requests', summary.answered, 'reply', '#2563eb'],
                    ['Anonymous requests', summary.anonymous, 'anonymous', '#0891b2'],
                    ['Latest reply', latestReply ? formatDate(latestReply.createdAt) : 'None yet', 'status', '#64748b']
                  ].map(([label, value, icon, color]) => (
                    <article className="sh-card sh-stat sh-lift" key={String(label)}>
                      <Icon name={icon as IconName} color={String(color)} background={`${String(color)}12`} />
                      <strong style={{ color: String(color) }}>{value}</strong>
                      <p>{label}</p>
                    </article>
                  ))}
                </section>
                <SupportJourney request={selectedRequest} />
              </div>
            </section>
            <section className="sh-pulse-grid">
              <StatusVisual requests={studentRequests} title="My requests by status" />
              <CategoryChart requests={studentRequests} />
              <WeeklyTrend requests={studentRequests} title="My support pulse" />
            </section>
            <section className="sh-main-grid" id="request-queue">
              <div>
                <div className="sh-section-head"><div><h2>My request history</h2><p>Follow your submitted requests and supportive replies.</p></div></div>
                <Filters search={search} status={statusFilter} category={categoryFilter} priority={priorityFilter} onSearch={setSearch} onStatus={setStatusFilter} onCategory={setCategoryFilter} onPriority={setPriorityFilter} />
                {!filteredRequests.length ? studentRequests.length
                  ? <HelpfulEmpty title="No matching requests" text="Try changing the search, status, category, or priority filter." />
                  : <HelpfulEmpty title="No help requests yet" text="Create your first request when you need academic, project, teamwork, or exam support." actionHref="#create-request" actionLabel="Create request" /> : null}
                <div className="sh-list">{filteredRequests.map((request) => <RequestCard key={request.id} request={request} selected={selectedRequest?.id === request.id} onSelect={() => setSelectedId(request.id)} />)}</div>
              </div>
              <DetailPanel request={selectedRequest} reply={selectedRequest ? replyText[selectedRequest.id] ?? '' : ''} canManageStatus={false} onReplyChange={(value) => selectedRequest && setReplyText((current) => ({ ...current, [selectedRequest.id]: value }))} onReply={() => selectedRequest && void handleReply(selectedRequest.id)} onStatus={(status) => selectedRequest && void handleStatus(selectedRequest.id, status)} />
            </section>
            <article className="sh-card sh-guidance"><div className="sh-section-head"><div><h2>When to use Silent Help</h2><p>Your request can be anonymous. Write only what you are comfortable sharing.</p></div><Icon name="help" /></div><ul><li>When a subject feels confusing.</li><li>When a project or code issue blocks you.</li><li>When teamwork becomes stressful.</li><li>When exam pressure feels high.</li></ul></article>
          </>
        ) : !isLoading && !error && role === 'mentor' ? (
          <>
            <section className="sh-stat-grid">
              {[
                ['Open requests', globalSummary.open, 'help', '#0d9e8a'],
                ['Answered requests', globalSummary.answered, 'reply', '#2563eb'],
                ['Replies recorded', globalSummary.replies, 'status', '#059669'],
                ['Most active area', commonCategory, 'category', '#0f2647']
              ].map(([label, value, icon, color]) => <article className="sh-card sh-stat sh-lift" key={String(label)}><Icon name={icon as IconName} color={String(color)} background={`${String(color)}12`} /><strong style={{ color: String(color) }}>{value}</strong><p>{label}</p></article>)}
            </section>
            <section className="sh-pulse-grid" id="support-trends">
              <CategoryChart requests={requests} />
              <PriorityVisual requests={requests} />
              <WeeklyTrend requests={requests} title="Student support pulse" />
            </section>
            <section className="sh-main-grid" id="request-queue">
              <div>
                <Filters search={search} status={statusFilter} category={categoryFilter} priority={priorityFilter} onSearch={setSearch} onStatus={setStatusFilter} onCategory={setCategoryFilter} onPriority={setPriorityFilter} />
                <div className="sh-section-head"><div><h2>Priority queue</h2><p>High-priority open requests appear first.</p></div><Badge color="#b45309" background="#fff7ed">{globalSummary.open} open</Badge></div>
                {!filteredRequests.length ? requests.length
                  ? <HelpfulEmpty title="No matching requests" text="Try changing the search, status, category, or priority filter." />
                  : <HelpfulEmpty title="No requests in the queue" text="Student support requests will appear here when they need mentor attention." /> : null}
                <div className="sh-list">{filteredRequests.map((request) => <RequestCard key={request.id} request={request} selected={selectedRequest?.id === request.id} onSelect={() => setSelectedId(request.id)} />)}</div>
              </div>
              <DetailPanel request={selectedRequest} reply={selectedRequest ? replyText[selectedRequest.id] ?? '' : ''} canManageStatus onReplyChange={(value) => selectedRequest && setReplyText((current) => ({ ...current, [selectedRequest.id]: value }))} onReply={() => selectedRequest && void handleReply(selectedRequest.id)} onStatus={(status) => selectedRequest && void handleStatus(selectedRequest.id, status)} />
            </section>
            <section className="sh-analytics-grid">
              <StatusVisual requests={requests} title="Request progress" />
              <div className="sh-card sh-distribution"><div className="sh-section-head"><div><h2>Recent student concerns</h2><p>Signals calculated from loaded request categories.</p></div><Icon name="priority" color="#d97706" background="rgba(217,119,6,.09)" /></div><div className="sh-insights">{[
                `${globalSummary.categoryCounts.academic_stress} academic stress request${globalSummary.categoryCounts.academic_stress === 1 ? '' : 's'} may need careful attention.`,
                `${globalSummary.categoryCounts.teamwork} teamwork concern${globalSummary.categoryCounts.teamwork === 1 ? '' : 's'} appear in the current queue.`,
                `${globalSummary.categoryCounts.github + globalSummary.categoryCounts.programming} GitHub or programming request${globalSummary.categoryCounts.github + globalSummary.categoryCounts.programming === 1 ? '' : 's'} are visible.`
              ].map((text) => <div className="sh-insight" key={text}><Icon name="help" size={30} /><p>{text}</p></div>)}</div><p className="sh-mentor-note">Reply with clarity, kindness, and one useful next step.</p></div>
            </section>
          </>
        ) : !isLoading && !error && role === 'admin' ? (
          <>
            <section className="sh-stat-grid sh-admin-stats">
              {adminStats.map(([label, value, icon]) => <article className="sh-card sh-stat sh-lift" key={label}><Icon name={icon} /><strong>{value}</strong><p>{label}</p></article>)}
            </section>
            <section className="sh-pulse-grid" id="support-trends">
              <CategoryChart requests={requests} />
              <StatusVisual requests={requests} title="Status distribution" />
              <WeeklyTrend requests={requests} title="Campus support pulse" />
            </section>
            <section className="sh-analytics-grid">
              <IdentityVisual requests={requests} />
              <PriorityVisual requests={requests} />
            </section>
            <section className="sh-main-grid" id="request-queue">
              <div>
                <Filters search={search} status={statusFilter} category={categoryFilter} priority={priorityFilter} onSearch={setSearch} onStatus={setStatusFilter} onCategory={setCategoryFilter} onPriority={setPriorityFilter} />
                <div className="sh-card sh-table"><table><thead><tr><th>Request</th><th>Category</th><th>Status</th><th>Priority</th><th>Student</th><th>Date</th><th>Replies</th><th>Action</th></tr></thead><tbody>{filteredRequests.map((request) => <tr key={request.id}><td><strong>{request.title}</strong></td><td>{categoryMeta[request.category].label}</td><td><Badge color={statusMeta[request.status].color} background={statusMeta[request.status].background}>{statusMeta[request.status].label}</Badge></td><td><Badge color={priorityMeta[getPriority(request)].color} background={priorityMeta[getPriority(request)].background}>{priorityMeta[getPriority(request)].label}</Badge></td><td>{request.isAnonymous ? 'Anonymous Student' : request.studentName}</td><td>{formatDate(request.createdAt)}</td><td>{request.replies?.length ?? 0}</td><td><button type="button" onClick={() => setSelectedId(request.id)}>Review</button></td></tr>)}</tbody></table>{!filteredRequests.length ? requests.length
                  ? <HelpfulEmpty title="No matching requests" text="Try changing the search, status, category, or priority filter." />
                  : <HelpfulEmpty title="No Silent Help records yet" text="Support trends will appear after students begin using Silent Help." /> : null}</div>
              </div>
              <div><DetailPanel request={selectedRequest} reply={selectedRequest ? replyText[selectedRequest.id] ?? '' : ''} canManageStatus onReplyChange={(value) => selectedRequest && setReplyText((current) => ({ ...current, [selectedRequest.id]: value }))} onReply={() => selectedRequest && void handleReply(selectedRequest.id)} onStatus={(status) => selectedRequest && void handleStatus(selectedRequest.id, status)} /><div className="sh-card sh-guidance"><div className="sh-section-head"><div><h2>Support insights</h2><p>Useful signals from the current request set.</p></div><Icon name="chart" /></div><ul><li>{commonCategory} is the most active category.</li><li>{globalSummary.categoryCounts.academic_stress} academic stress requests are visible and should be reviewed carefully.</li><li>{globalSummary.open} open requests should be prioritized before closed threads.</li><li>Response coverage is currently {responseCoverage}%.</li></ul></div></div>
            </section>
          </>
        ) : null}
      </div>
    </>
  );
}
