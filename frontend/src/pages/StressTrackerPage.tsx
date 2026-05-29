import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { getApiErrorMessage } from '../services/apiClient';
import { stressService } from '../services/stressService';
import type { StressRecord, StressSummary } from '../types/stress';
import { formatDate } from '../utils/formatDate';

const stressLabels = ['Low', 'Mild', 'Medium', 'High', 'Very High'];

export default function StressTrackerPage() {
  const [records, setRecords] = useState<StressRecord[]>([]);
  const [summary, setSummary] = useState<StressSummary[]>([]);
  const [form, setForm] = useState({ subject: '', stress_level: 3, note: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await stressService.create({
        subject: form.subject || undefined,
        stress_level: form.stress_level,
        note: form.note || undefined
      });
      setForm({ subject: '', stress_level: 3, note: '' });
      setMessage('Stress record saved.');
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStressLevelChange(value: string) {
    const nextLevel = Math.min(5, Math.max(1, Number(value)));
    setForm((current) => ({ ...current, stress_level: nextLevel }));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="ExamStress Tracker" description="Record exam pressure from 1 Low to 5 Very High." />
      {message ? <div className="alert-success">{message}</div> : null}
      {error ? <div className="alert-error">{error}</div> : null}

      <form className="panel grid gap-4 lg:grid-cols-3" onSubmit={handleSubmit}>
        <label>
          <span className="field-label">Subject</span>
          <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </label>
        <label>
          <span className="field-label">
            Stress level: {form.stress_level} {stressLabels[form.stress_level - 1]}
          </span>
          <input
            className="w-full accent-emerald-600"
            min={1}
            max={5}
            step={1}
            type="range"
            value={form.stress_level}
            onChange={(e) => handleStressLevelChange(e.currentTarget.value)}
            onInput={(e) => handleStressLevelChange(e.currentTarget.value)}
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
            {stressLabels.map((label, index) => (
              <span key={label} className={form.stress_level === index + 1 ? 'text-emerald-700' : undefined}>
                {index + 1} {label}
              </span>
            ))}
          </div>
        </label>
        <label>
          <span className="field-label">Note</span>
          <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
        <div className="lg:col-span-3">
          <button className="btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : 'Save stress record'}
          </button>
        </div>
      </form>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel">
          <h2 className="section-title">Summary</h2>
          {summary.length === 0 ? (
            <p className="empty-text mt-3">No stress summary yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {summary.map((item) => (
                <div key={item.subject ?? 'overall'} className="rounded-md bg-slate-50 p-3">
                  <p className="font-medium">{item.subject ?? 'Overall'}</p>
                  <p className="text-sm text-slate-500">
                    {item.count} records - average {item.averageStressLevel}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="panel">
          <h2 className="section-title">Records</h2>
          {isLoading ? <p className="empty-text mt-3">Loading records...</p> : null}
          {!isLoading && records.length === 0 ? <p className="empty-text mt-3">No stress records yet.</p> : null}
          <div className="mt-4 space-y-3">
            {records.map((record) => (
              <div key={record.id} className="border-b border-slate-100 pb-3">
                <p className="font-medium">
                  Level {record.stressLevel} - {stressLabels[record.stressLevel - 1]}
                </p>
                <p className="text-sm text-slate-500">
                  {record.subject ?? 'No subject'} - {formatDate(record.recordedAt)}
                </p>
                {record.note ? <p className="mt-1 text-sm text-slate-700">{record.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
