import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { lostFoundService } from '../services/lostFoundService';
import type { LostFoundItem, LostFoundItemType, LostFoundStatus } from '../types/lostFound';
import { formatDate } from '../utils/formatDate';

const statuses: LostFoundStatus[] = ['open', 'claimed', 'resolved'];

export default function LostFoundPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filters, setFilters] = useState<{ item_type: LostFoundItemType | ''; status: LostFoundStatus | '' }>({
    item_type: '',
    status: ''
  });
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    item_type: 'lost' as LostFoundItemType,
    item_date: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadItems() {
    setError('');
    try {
      setIsLoading(true);
      setItems(await lostFoundService.list(filters));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.item_type, filters.status]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title || !form.description) {
      setError('Title and description are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await lostFoundService.create({
        title: form.title,
        description: form.description,
        location: form.location || undefined,
        item_type: form.item_type,
        item_date: form.item_date || undefined
      });
      setForm({ title: '', description: '', location: '', item_type: 'lost', item_date: '' });
      setMessage('Lost/found report created.');
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatus(id: string, status: LostFoundStatus) {
    try {
      await lostFoundService.updateStatus(id, status);
      setMessage('Status updated.');
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Lost & Found" description="Report and track lost or found items inside the faculty." />
      {message ? <div className="alert-success">{message}</div> : null}
      {error ? <div className="alert-error">{error}</div> : null}

      <form className="panel grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        <h2 className="section-title lg:col-span-2">Create Report</h2>
        <label>
          <span className="field-label">Title</span>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label>
          <span className="field-label">Type</span>
          <select className="input" value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value as LostFoundItemType })}>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </label>
        <label>
          <span className="field-label">Location</span>
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </label>
        <label>
          <span className="field-label">Item date</span>
          <input className="input" type="date" value={form.item_date} onChange={(e) => setForm({ ...form, item_date: e.target.value })} />
        </label>
        <label className="lg:col-span-2">
          <span className="field-label">Description</span>
          <textarea className="textarea min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="lg:col-span-2">
          <button className="btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating...' : 'Create report'}
          </button>
        </div>
      </form>

      <section className="flex flex-wrap gap-3">
        <select className="input max-w-44" value={filters.item_type} onChange={(e) => setFilters({ ...filters, item_type: e.target.value as LostFoundItemType | '' })}>
          <option value="">All types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <select className="input max-w-44" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as LostFoundStatus | '' })}>
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </section>

      {isLoading ? <p className="empty-text">Loading reports...</p> : null}
      {!isLoading && items.length === 0 ? <p className="empty-text">No lost or found reports yet.</p> : null}
      <section className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => {
          const canManage = user?.role === 'admin' || item.userId === user?.id;

          return (
            <article key={item.id} className="panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.location ?? 'No location'} · {item.itemDate ? formatDate(item.itemDate) : formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="badge-blue">{item.itemType}</span>
                  <span className={item.status === 'open' ? 'badge-green' : 'badge-amber'}>{item.status}</span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">{item.description}</p>
              {canManage ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button key={status} className="btn-secondary" type="button" onClick={() => void handleStatus(item.id, status)}>
                      Mark {status}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
