import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { helpRequestService } from '../services/helpRequestService';
import type { HelpRequest, HelpRequestCategory, HelpRequestStatus } from '../types/helpRequest';
import { formatDate } from '../utils/formatDate';

type Priority = 'high' | 'medium' | 'low';

const categories: HelpRequestCategory[] = ['subject', 'project', 'github', 'programming', 'academic_stress', 'teamwork', 'other'];
const chartCategories: HelpRequestCategory[] = ['subject', 'project', 'github', 'programming', 'academic_stress', 'teamwork'];
const statuses: HelpRequestStatus[] = ['open', 'answered', 'closed'];
const priorities: Priority[] = ['high', 'medium', 'low'];

const categoryMeta: Record<HelpRequestCategory, { label: string; code: string; color: string; bg: string; border: string }> = {
  subject: { label: 'Subject', code: 'SB', color: '#0d9e8a', bg: 'rgba(13,158,138,.09)', border: 'rgba(13,158,138,.24)' },
  project: { label: 'Project', code: 'PR', color: '#2563eb', bg: 'rgba(37,99,235,.09)', border: 'rgba(37,99,235,.22)' },
  github: { label: 'GitHub', code: 'GH', color: '#0f2647', bg: 'rgba(15,38,71,.08)', border: 'rgba(15,38,71,.18)' },
  programming: { label: 'Programming', code: 'PG', color: '#0891b2', bg: 'rgba(8,145,178,.09)', border: 'rgba(8,145,178,.22)' },
  academic_stress: { label: 'Academic Stress', code: 'AS', color: '#d97706', bg: 'rgba(217,119,6,.10)', border: 'rgba(217,119,6,.24)' },
  teamwork: { label: 'Teamwork', code: 'TW', color: '#059669', bg: 'rgba(5,150,105,.09)', border: 'rgba(5,150,105,.22)' },
  other: { label: 'Other', code: 'OT', color: '#64748b', bg: 'rgba(100,116,139,.09)', border: 'rgba(100,116,139,.22)' }
};

const statusMeta: Record<HelpRequestStatus, { label: string; badge: string; color: string }> = {
  open: { label: 'Open', badge: 'border-teal-200 bg-teal-50 text-teal-700', color: '#0d9e8a' },
  answered: { label: 'Answered', badge: 'border-sky-200 bg-sky-50 text-sky-700', color: '#2563eb' },
  closed: { label: 'Closed', badge: 'border-slate-200 bg-slate-100 text-slate-600', color: '#64748b' }
};

const priorityMeta: Record<Priority, { label: string; badge: string; rank: number; color: string }> = {
  high: { label: 'High', badge: 'border-amber-200 bg-amber-50 text-amber-700', rank: 3, color: '#d97706' },
  medium: { label: 'Medium', badge: 'border-sky-200 bg-sky-50 text-sky-700', rank: 2, color: '#2563eb' },
  low: { label: 'Low', badge: 'border-slate-200 bg-slate-100 text-slate-600', rank: 1, color: '#64748b' }
};

function daysOld(createdAt: string) {
  const created = new Date(createdAt).getTime();
  return Number.isNaN(created) ? 0 : Math.max(0, Math.floor((Date.now() - created) / 86_400_000));
}

function getPriority(request: HelpRequest): Priority {
  if (request.status === 'closed') {
    return 'low';
  }

  if (request.category === 'academic_stress' && request.status === 'open') {
    return 'high';
  }

  if (request.status === 'open' && daysOld(request.createdAt) >= 3) {
    return 'high';
  }

  if (request.status === 'open' && ['programming', 'github', 'project'].includes(request.category)) {
    return 'medium';
  }

  if (request.status === 'open') {
    return 'medium';
  }

  if (request.status === 'answered' && daysOld(request.createdAt) >= 5) {
    return 'medium';
  }

  return 'low';
}

function statusRank(status: HelpRequestStatus) {
  if (status === 'open') {
    return 3;
  }

  if (status === 'answered') {
    return 2;
  }

  return 1;
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

  for (const request of requests) {
    categoryCounts[request.category] += 1;
    priorityCounts[getPriority(request)] += 1;
  }

  return {
    total: requests.length,
    open: requests.filter((request) => request.status === 'open').length,
    answered: requests.filter((request) => request.status === 'answered').length,
    closed: requests.filter((request) => request.status === 'closed').length,
    anonymous: requests.filter((request) => request.isAnonymous || request.studentName === 'Anonymous Student').length,
    categoryCounts,
    priorityCounts
  };
}

function sortRequests(left: HelpRequest, right: HelpRequest) {
  const priorityDifference = priorityMeta[getPriority(right)].rank - priorityMeta[getPriority(left)].rank;
  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  const statusDifference = statusRank(right.status) - statusRank(left.status);
  if (statusDifference !== 0) {
    return statusDifference;
  }

  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

function cleanText(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

export default function HelpRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<HelpRequestStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<HelpRequestCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [form, setForm] = useState({
    title: '',
    category: 'programming' as HelpRequestCategory,
    description: '',
    isAnonymous: true
  });
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStudent = user?.role === 'student';
  const canManageStatus = user?.role === 'mentor' || user?.role === 'admin';

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
      setMessage('Help request created. The support thread is now visible.');
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

    if (!reply) {
      return;
    }

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

  const summary = useMemo(() => buildSummary(requests), [requests]);
  const maxCategoryCount = Math.max(1, ...chartCategories.map((category) => summary.categoryCounts[category]));
  const maxStatusCount = Math.max(1, summary.open, summary.answered, summary.closed);
  const statCards = [
    {
      label: 'Total Requests',
      value: summary.total,
      helper: 'All loaded support threads',
      accent: '#0b1d35',
      mark: 'TR'
    },
    {
      label: 'Open Requests',
      value: summary.open,
      helper: 'Waiting for attention',
      accent: '#0d9e8a',
      mark: 'OP'
    },
    {
      label: 'Answered',
      value: summary.answered,
      helper: 'Already received replies',
      accent: '#2563eb',
      mark: 'AN'
    },
    {
      label: 'Anonymous',
      value: summary.anonymous,
      helper: 'Identity protected',
      accent: '#0891b2',
      mark: 'ID'
    }
  ];

  const activeHelpAreas = useMemo(() => {
    return categories
      .map((category) => ({ category, count: summary.categoryCounts[category] }))
      .filter((item) => item.count > 0)
      .sort((left, right) => right.count - left.count)
      .slice(0, 5);
  }, [summary.categoryCounts]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests
      .filter((request) => {
        if (statusFilter !== 'all' && request.status !== statusFilter) {
          return false;
        }

        if (categoryFilter !== 'all' && request.category !== categoryFilter) {
          return false;
        }

        if (priorityFilter !== 'all' && getPriority(request) !== priorityFilter) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return [request.title, request.description, request.category, request.studentName]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort(sortRequests);
  }, [categoryFilter, priorityFilter, requests, search, statusFilter]);

  const selectedRequest = useMemo(() => {
    return filteredRequests.find((request) => request.id === selectedId) ?? filteredRequests[0] ?? requests[0] ?? null;
  }, [filteredRequests, requests, selectedId]);

  const roleCopy =
    user?.role === 'admin'
      ? {
          badge: 'Admin overview',
          title: 'Silent Help support center',
          description: 'Review request flow, status distribution, and academic support patterns.'
        }
      : user?.role === 'mentor'
        ? {
            badge: 'Mentor review space',
            title: 'Prioritize student help requests',
            description: 'Review open threads, reply supportively, and notice repeated support needs.'
          }
        : {
            badge: 'Student support space',
            title: 'Ask for help safely',
            description: 'Create an anonymous or named request when you are stuck with coursework, code, teamwork, or exam pressure.'
          };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[24px] border border-[#dfeaf3] bg-[#071527] text-white shadow-sm">
        <div className="relative p-6 md:p-7">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="relative max-w-4xl">
            <span className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-100/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-100">
              {roleCopy.badge}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{roleCopy.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{roleCopy.description}</p>
          </div>
        </div>
      </section>

      {message ? <div className="alert-success">{message}</div> : null}
      {error ? <div className="alert-error">{error}</div> : null}

      <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(260px,0.8fr)_minmax(420px,1.6fr)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {statCards.map((stat) => (
            <article
              key={stat.label}
              className="relative overflow-hidden rounded-[22px] border border-[#dfeaf3] p-5 shadow-[0_14px_34px_rgba(15,23,42,.06)]"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,.95), rgba(248,251,255,.92))'
              }}
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: stat.accent }} />
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-extrabold"
                style={{
                  background: `${stat.accent}12`,
                  borderColor: `${stat.accent}30`,
                  color: stat.accent
                }}
              >
                {stat.mark}
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[#0b1d35]">{stat.value}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{stat.helper}</p>
            </article>
          ))}
        </div>

        <article
          className="rounded-[22px] border border-[#dfeaf3] p-5 shadow-[0_14px_34px_rgba(15,23,42,.06)] md:p-6"
          style={{ background: 'rgba(255,255,255,.92)' }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="section-title">Requests by category</h2>
              <p className="section-subtitle">Repeated help needs from loaded requests.</p>
            </div>
            <div className="grid min-w-full gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 lg:min-w-64">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Status distribution</p>
              <div className="grid gap-2">
                {statuses.map((status) => {
                  const count = status === 'open' ? summary.open : status === 'answered' ? summary.answered : summary.closed;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-600">{statusMeta[status].label}</span>
                        <span className="text-slate-500">{count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full" style={{ width: `${(count / maxStatusCount) * 100}%`, backgroundColor: statusMeta[status].color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {chartCategories.map((category) => {
              const count = summary.categoryCounts[category];
              const meta = categoryMeta[category];
              const width = count ? `${Math.max(8, (count / maxCategoryCount) * 100)}%` : '4%';

              return (
                <div key={category} className="grid grid-cols-[112px_1fr_36px] items-center gap-3 text-sm sm:grid-cols-[150px_1fr_40px]">
                  <span className="font-semibold text-slate-700">{meta.label}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-[#e9f1f7]">
                    <div className="h-full rounded-full" style={{ width, backgroundColor: count ? meta.color : '#dfeaf3' }} />
                  </div>
                  <span className="text-right font-semibold text-slate-500">{count}</span>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
        <aside className="space-y-4">
          {isStudent ? (
            <article id="create-request" className="premium-card">
              <h2 className="section-title">Create a safe help request</h2>
              <p className="section-subtitle">You can stay anonymous. Share only what you feel comfortable sharing.</p>
              <form className="mt-5 space-y-4" onSubmit={handleCreate}>
                <label className="block">
                  <span className="field-label">Title</span>
                  <input
                    className="input"
                    required
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="field-label">Category</span>
                  <select
                    className="input"
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value as HelpRequestCategory })}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {categoryMeta[category].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Description</span>
                  <textarea
                    className="textarea min-h-24"
                    required
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </label>
                <label className="flex items-start gap-3 rounded-lg bg-teal-50 p-3 text-sm text-slate-700">
                  <input
                    className="mt-1"
                    type="checkbox"
                    checked={form.isAnonymous}
                    onChange={(event) => setForm({ ...form, isAnonymous: event.target.checked })}
                  />
                  <span>
                    <span className="block font-semibold text-slate-900">Keep anonymous</span>
                    <span className="text-slate-500">Your name will show as Anonymous Student.</span>
                  </span>
                </label>
                <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Submit request'}
                </button>
              </form>
            </article>
          ) : (
            <article className="premium-card">
              <h2 className="section-title">Mentor attention</h2>
              <p className="section-subtitle">Open, older, and academic stress requests are sorted higher.</p>
              <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                {summary.open} open {summary.open === 1 ? 'request' : 'requests'}
              </div>
            </article>
          )}

          <article className="premium-card">
            <h2 className="section-title">Most active help areas</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeHelpAreas.length ? (
                activeHelpAreas.map(({ category, count }) => (
                  <button
                    key={category}
                    className="rounded-full border px-3 py-1.5 text-xs font-bold"
                    style={{
                      background: categoryMeta[category].bg,
                      borderColor: categoryMeta[category].border,
                      color: categoryMeta[category].color
                    }}
                    type="button"
                    onClick={() => setCategoryFilter(category)}
                  >
                    {categoryMeta[category].label}: {count}
                  </button>
                ))
              ) : (
                <p className="empty-text">No help areas yet.</p>
              )}
            </div>
          </article>

          <article className="premium-card">
            <h2 className="section-title">When to use Silent Help</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm leading-6 text-slate-600">
              <li>When you are stuck in a subject.</li>
              <li>When your code or project has an error.</li>
              <li>When you need GitHub or teamwork help.</li>
              <li>When exam pressure feels high.</li>
            </ul>
          </article>

          <article className="premium-card">
            <h2 className="section-title">How to write a good request</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm leading-6 text-slate-600">
              <li>Use a clear title.</li>
              <li>Explain what you tried.</li>
              <li>Choose the right category.</li>
              <li>Avoid sharing private information.</li>
            </ul>
          </article>
        </aside>

        <section id="request-list" className="space-y-4">
          <article className="premium-card">
              <div className="grid gap-3 lg:grid-cols-[1fr_150px_170px_150px]">
                <input
                  className="input"
                  placeholder="Search requests"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as HelpRequestStatus | 'all')}>
                  <option value="all">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {statusMeta[status].label}
                    </option>
                  ))}
                </select>
                <select
                  className="input"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as HelpRequestCategory | 'all')}
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {categoryMeta[category].label}
                    </option>
                  ))}
                </select>
                <select className="input" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as Priority | 'all')}>
                  <option value="all">All priorities</option>
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priorityMeta[priority].label}
                    </option>
                  ))}
                </select>
              </div>
          </article>

          {isLoading ? <div className="empty-state">Loading help requests...</div> : null}
          {!isLoading && filteredRequests.length === 0 ? <div className="empty-state">No help requests match the selected filters.</div> : null}

          {filteredRequests.map((request) => {
              const priority = getPriority(request);
              const category = categoryMeta[request.category];
              const isSelected = selectedRequest?.id === request.id;
              const isAnonymous = request.isAnonymous || request.studentName === 'Anonymous Student';

              return (
                <article
                  key={request.id}
                  className={`flex min-h-48 cursor-pointer flex-col rounded-2xl border bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md ${
                    isSelected ? 'border-teal-300 ring-2 ring-teal-100' : 'border-[#dfeaf3]'
                  }`}
                  style={{ borderLeft: `4px solid ${priority === 'high' ? priorityMeta.high.color : category.color}` }}
                  onClick={() => setSelectedId(request.id)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950">{request.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {isAnonymous ? 'Anonymous Student' : request.studentName} - {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${priorityMeta[priority].badge}`}>
                      {priorityMeta[priority].label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{cleanText(request.description, 135)}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    <span
                      className="rounded-full border px-3 py-1 text-xs font-bold"
                      style={{ background: category.bg, borderColor: category.border, color: category.color }}
                    >
                      {category.code} {category.label}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusMeta[request.status].badge}`}>
                      {statusMeta[request.status].label}
                    </span>
                    <span className="badge">{request.replies?.length ?? 0} replies</span>
                    <span className="ml-auto text-xs font-semibold text-teal-700">Open thread</span>
                  </div>
                </article>
              );
            })}
        </section>

        <aside>
            {selectedRequest ? (
              <article className="sticky top-24 rounded-2xl border border-[#dfeaf3] bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Selected request</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{selectedRequest.title}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedRequest.isAnonymous ? 'Anonymous Student' : selectedRequest.studentName} - {formatDate(selectedRequest.createdAt)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className="rounded-full border px-3 py-1 text-xs font-bold"
                    style={{
                      background: categoryMeta[selectedRequest.category].bg,
                      borderColor: categoryMeta[selectedRequest.category].border,
                      color: categoryMeta[selectedRequest.category].color
                    }}
                  >
                    {categoryMeta[selectedRequest.category].label}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusMeta[selectedRequest.status].badge}`}>
                    {statusMeta[selectedRequest.status].label}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${priorityMeta[getPriority(selectedRequest)].badge}`}>
                    {priorityMeta[getPriority(selectedRequest)].label}
                  </span>
                </div>

                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{selectedRequest.description}</p>

                <div className="mt-5">
                  <h3 className="section-title">Replies</h3>
                  {selectedRequest.replies?.length ? (
                    <div className="mt-3 space-y-3">
                      {selectedRequest.replies.map((reply) => (
                        <div key={reply.id} className="rounded-xl bg-slate-50 p-3">
                          <p className="text-sm leading-6 text-slate-700">{reply.message}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            {reply.replierName} - {formatDate(reply.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      No replies yet.
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <label className="field-label">Reply</label>
                  <textarea
                    className="textarea min-h-24"
                    value={replyText[selectedRequest.id] ?? ''}
                    onChange={(event) => setReplyText({ ...replyText, [selectedRequest.id]: event.target.value })}
                  />
                  <button
                    className="btn-primary mt-3 w-full"
                    type="button"
                    disabled={!replyText[selectedRequest.id]?.trim()}
                    onClick={() => void handleReply(selectedRequest.id)}
                  >
                    Send reply
                  </button>
                </div>

                {canManageStatus ? (
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <p className="field-label">Status actions</p>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          className="btn-secondary"
                          type="button"
                          disabled={selectedRequest.status === status}
                          onClick={() => void handleStatus(selectedRequest.id, status)}
                        >
                          Mark {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ) : (
              <div className="empty-state">Select a request to view details.</div>
            )}
        </aside>
      </section>
    </div>
  );
}
