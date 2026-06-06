import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { stressService } from '../services/stressService';
import type { StressRecord, StressSummary } from '../types/stress';
import { formatDate } from '../utils/formatDate';

const stressLabels = ['Low', 'Mild', 'Medium', 'High', 'Very High'];

export default function StressTrackerPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<StressRecord[]>([]);
  const [summary, setSummary] = useState<StressSummary[]>([]);
  const [form, setForm] = useState({ subject: '', stress_level: 3, note: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isGlobalView = user?.role === 'mentor' || user?.role === 'admin';

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
    setError('');
    setMessage('');

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
      <PageHeader
        title="ExamStress Tracker"
        description={
          isGlobalView
            ? 'Mentor/admin view: review broader stress records and summaries while still being able to add your own check-in.'
            : 'Student view: record your exam pressure from 1 Low to 5 Very High.'
        }
      />
      <span className="badge">{isGlobalView ? 'Global wellbeing view' : 'Personal records'}</span>
      <section className="panel-soft">
        <p className="text-sm leading-6 text-slate-700">
          Stress records are a check-in, not a grade. Use 1 Low, 2 Mild, 3 Medium, 4 High, and 5 Very High to notice
          pressure before exam weeks become overwhelming.
        </p>
      </section>
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
          <h2 className="section-title">{isGlobalView ? 'Global Stress Summary' : 'My Stress Summary'}</h2>
          {summary.length === 0 ? (
            <p className="empty-text mt-3">No stress summary yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {summary.map((item) => (
                <div key={item.subject ?? 'overall'} className="rounded-md bg-slate-50 p-3">
                  <p className="font-medium">{item.subject ?? 'Overall'}</p>
                  <p className="text-sm text-slate-500">
                    {item.count} records - average level {Number(item.averageStressLevel).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="panel">
          <h2 className="section-title">{isGlobalView ? 'Stress Records' : 'My Stress Records'}</h2>
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
