import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { getApiErrorMessage } from '../services/apiClient';
import { helpRequestService } from '../services/helpRequestService';
import type { HelpRequest, HelpRequestCategory, HelpRequestStatus } from '../types/helpRequest';
import { formatDate } from '../utils/formatDate';

const categories: HelpRequestCategory[] = [
  'subject',
  'project',
  'github',
  'programming',
  'academic_stress',
  'teamwork',
  'other'
];

const statuses: HelpRequestStatus[] = ['open', 'answered', 'closed'];

function displayLabel(value: string) {
  return value.replace('_', ' ');
}

export default function HelpRequestsPage() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [filters, setFilters] = useState<{ status: HelpRequestStatus | ''; category: HelpRequestCategory | '' }>({
    status: '',
    category: ''
  });
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

  async function loadRequests() {
    setError('');
    try {
      setIsLoading(true);
      setRequests(await helpRequestService.list(filters));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.category]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.title || !form.description) {
      setError('Title and description are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await helpRequestService.create(form);
      setForm({ title: '', category: 'programming', description: '', isAnonymous: true });
      setMessage('Help request created.');
      await loadRequests();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReply(id: string) {
    const messageText = replyText[id]?.trim();

    if (!messageText) {
      return;
    }

    try {
      await helpRequestService.reply(id, messageText);
      setReplyText({ ...replyText, [id]: '' });
      setMessage('Reply sent.');
      await loadRequests();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Silent Help"
        description="Create anonymous or named requests for academic, programming, teamwork, and stress support."
      />
      {message ? <div className="alert-success">{message}</div> : null}
      {error ? <div className="alert-error">{error}</div> : null}

      <section className="panel">
        <h2 className="section-title">Create Help Request</h2>
        <p className="section-subtitle">
          Anonymous requests hide your name in the public list and display "Anonymous Student".
        </p>
        <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleCreate}>
          <label>
            <span className="field-label">Request title</span>
            <input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>
          <label>
            <span className="field-label">Category</span>
            <select
              className="input"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value as HelpRequestCategory })}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {displayLabel(category)}
                </option>
              ))}
            </select>
          </label>
          <label className="lg:col-span-2">
            <span className="field-label">What kind of help do you need?</span>
            <textarea
              className="textarea min-h-28"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(event) => setForm({ ...form, isAnonymous: event.target.checked })}
            />
            Keep this request anonymous
          </label>
          <div className="flex justify-end">
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create request'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel-soft flex flex-wrap gap-3">
        <select className="input max-w-48" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as HelpRequestStatus | '' })}>
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select className="input max-w-56" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value as HelpRequestCategory | '' })}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {displayLabel(category)}
            </option>
          ))}
        </select>
      </section>

      {isLoading ? <div className="empty-state">Loading help requests...</div> : null}
      {!isLoading && requests.length === 0 ? (
        <div className="empty-state">No help requests yet. Create the first request for the demo.</div>
      ) : null}
      <section className="grid gap-4">
        {requests.map((request) => (
          <article key={request.id} className="panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{request.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {request.studentName} - {formatDate(request.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="badge-blue">{displayLabel(request.category)}</span>
                <span className={request.status === 'open' ? 'badge-green' : 'badge-amber'}>{request.status}</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{request.description}</p>
            <div className="mt-4 flex gap-2">
              <input
                className="input"
                placeholder="Write a quick reply"
                value={replyText[request.id] ?? ''}
                onChange={(event) => setReplyText({ ...replyText, [request.id]: event.target.value })}
              />
              <button className="btn-secondary" type="button" onClick={() => void handleReply(request.id)}>
                Reply
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
