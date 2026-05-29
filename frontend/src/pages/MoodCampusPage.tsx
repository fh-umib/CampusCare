import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { getApiErrorMessage } from '../services/apiClient';
import { moodService } from '../services/moodService';
import type { MoodRecord, MoodState, MoodSummary } from '../types/mood';
import { formatDate } from '../utils/formatDate';

const moods: MoodState[] = ['motivated', 'tired', 'stressed', 'calm', 'overwhelmed'];

function displayLabel(value: string) {
  return value.replace('_', ' ');
}

export default function MoodCampusPage() {
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [summary, setSummary] = useState<MoodSummary[]>([]);
  const [form, setForm] = useState({ mood: 'motivated' as MoodState, note: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
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

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await moodService.create({ mood: form.mood, note: form.note || undefined });
      setForm({ mood: 'motivated', note: '' });
      setMessage('Mood record saved.');
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="MoodCampus"
        description="Record a weekly emotional state and notice wellbeing patterns over time."
      />
      {message ? <div className="alert-success">{message}</div> : null}
      {error ? <div className="alert-error">{error}</div> : null}

      <form className="panel grid gap-4 lg:grid-cols-[240px_1fr_auto]" onSubmit={handleSubmit}>
        <label>
          <span className="field-label">Mood</span>
          <select className="input" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value as MoodState })}>
            {moods.map((mood) => (
              <option key={mood} value={mood}>
                {displayLabel(mood)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Note</span>
          <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
        <div className="flex items-end">
          <button className="btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : 'Save mood'}
          </button>
        </div>
      </form>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel">
          <h2 className="section-title">Mood Summary</h2>
          <p className="section-subtitle">Counts across recent MoodCampus records.</p>
          {summary.length === 0 ? (
            <div className="empty-state mt-4">No mood summary yet.</div>
          ) : (
            <div className="mt-4 grid gap-2">
              {summary.map((item) => (
                <div key={item.mood} className="flex justify-between rounded-md bg-slate-50 px-3 py-2">
                  <span className="capitalize">{displayLabel(item.mood)}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="panel">
          <h2 className="section-title">Mood Records</h2>
          {isLoading ? <div className="empty-state mt-4">Loading mood records...</div> : null}
          {!isLoading && records.length === 0 ? <div className="empty-state mt-4">No mood records yet.</div> : null}
          <div className="mt-4 space-y-3">
            {records.map((record) => (
              <div key={record.id} className="border-b border-slate-100 pb-3">
                <p className="font-medium capitalize">{displayLabel(record.mood)}</p>
                <p className="text-sm text-slate-500">{formatDate(record.recordedAt)}</p>
                {record.note ? <p className="mt-1 text-sm text-slate-700">{record.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
