import { useEffect, useMemo, useState } from 'react';
import type { UserRole } from '../../types/roles';
import type { AnalyticsOverview } from '../../types/analytics';
import { analyticsService } from '../../services/analyticsService';
import { getApiErrorMessage } from '../../services/apiClient';

const titles: Record<UserRole, string> = { student: 'Your Weekly Insights', mentor: 'Support Analytics', admin: 'Platform Analytics' };
const labels: Record<string, string> = { averageStress: 'Average stress', stressCheckIns: 'Stress check-ins', moodCheckIns: 'Mood check-ins', skillsAdded: 'Skills added', helpRequestsCreated: 'Help requests', openHelpRequests: 'Open requests', answeredHelpRequests: 'Answered requests', averageResponseHours: 'Response hours', activeUsers: 'Active users', totalUsers: 'Total users', newRegistrations: 'New registrations', notificationTotal: 'Notifications' };

function BarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  if (!data.length) return <div className="an-empty">No activity recorded for this period.</div>;
  return <div className="an-bars" role="img" aria-label="Activity distribution">{data.map((item) => <div key={item.label}><span>{item.label.replace(/_/g, ' ')}</span><div><i style={{ width: `${(item.value / max) * 100}%` }} /></div><strong>{item.value}</strong></div>)}</div>;
}

export function AnalyticsPanel({ role }: { role: UserRole }) {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  useEffect(() => { let active = true; analyticsService.overview(role).then((value) => active && setData(value)).catch((e) => active && setError(getApiErrorMessage(e))).finally(() => active && setLoading(false)); return () => { active = false; }; }, [role]);
  const metrics = useMemo(() => data ? Object.entries(data.metrics).filter(([key, value]) => value !== null && key in labels).slice(0, role === 'admin' ? 6 : 5) : [], [data, role]);
  const download = async (cadence: 'weekly' | 'monthly') => { try { setDownloading(cadence); setError(''); await analyticsService.downloadPdf(role, cadence); } catch (e) { setError(getApiErrorMessage(e)); } finally { setDownloading(null); } };
  if (loading) return <section className="an-panel db-card db-space" aria-busy="true">Loading analytics…</section>;
  return <section className="an-panel db-card db-space" aria-labelledby="analytics-title">
    <div className="an-head"><div><h2 id="analytics-title">{titles[role]}</h2><p>Real activity from {data?.period.start.slice(0, 10)} to {data?.period.end.slice(0, 10)} UTC</p></div><div className="an-actions"><button type="button" onClick={() => void download('weekly')} disabled={Boolean(downloading)}>{downloading === 'weekly' ? 'Preparing…' : 'Weekly PDF'}</button><button type="button" onClick={() => void download('monthly')} disabled={Boolean(downloading)}>{downloading === 'monthly' ? 'Preparing…' : 'Monthly PDF'}</button></div></div>
    {error ? <div className="alert-error">{error}</div> : null}
    {data ? <><div className="an-metrics">{metrics.map(([key, value]) => <article key={key}><span>{labels[key]}</span><strong>{String(value)}</strong></article>)}</div><div className="an-grid"><div><h3>Module activity</h3><BarChart data={data.distributions.moduleUsage ?? []} /></div><div><h3>Activity heatmap</h3><div className="an-heatmap" role="img" aria-label="Activity by weekday and hour">{data.heatmap.length ? data.heatmap.slice(0, 42).map((point) => <span key={`${point.day}-${point.hour}`} style={{ opacity: Math.max(.18, Math.min(1, point.value / 5)) }} title={`${point.day} ${point.hour}:00 — ${point.value}`} aria-label={`${point.day} ${point.hour}:00, ${point.value} activities`} />) : <div className="an-empty">No heatmap activity yet.</div>}</div></div></div><p className="an-note">{data.limitations[0]}</p></> : null}
  </section>;
}
