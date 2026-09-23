import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../services/apiClient';
import { securityService, type AuditItem } from '../services/securityService';

type DateRange = '7d' | '30d' | '90d' | 'all';
const rangeOptions: Array<{ value: DateRange; label: string; days?: number }> = [
  { value: '7d', label: 'Last 7 Days', days: 7 },
  { value: '30d', label: 'Last 30 Days', days: 30 },
  { value: '90d', label: 'Last 90 Days', days: 90 },
  { value: 'all', label: 'All Time' }
];

function rangeBounds(range: DateRange, now = new Date()): Record<string, string> {
  const option = rangeOptions.find((item) => item.value === range);
  if (!option?.days) return {};
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (option.days - 1));
  return { start: start.toISOString(), end: now.toISOString() };
}

const formatAction = (value: string) => value.replace(/_/g, ' ');

export default function AuditLogsPage() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const [role, setRole] = useState('');
  const [range, setRange] = useState<DateRange>('30d');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const params: Record<string, string | number> = { page, limit: 20, ...rangeBounds(range) };
    if (action.trim()) params.action = action.trim();
    if (actor.trim()) params.actor = actor.trim();
    if (role) params.role = role;
    setLoading(true);
    void securityService.auditLogs(params).then((data) => {
      if (!active) return;
      setItems(data.items);
      setTotal(data.total);
      setError('');
    }).catch((requestError) => {
      if (!active) return;
      setItems([]);
      setTotal(0);
      setError(getApiErrorMessage(requestError));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [action, actor, page, range, role]);

  const activeFilters = useMemo(() => [
    rangeOptions.find((item) => item.value === range)?.label,
    action.trim() ? `Event: ${action.trim()}` : '',
    actor.trim() ? `Actor: ${actor.trim()}` : '',
    role ? `Role: ${role}` : ''
  ].filter(Boolean), [action, actor, range, role]);

  const updateFilter = (update: () => void) => { setPage(1); update(); };
  const resetFilters = () => { setPage(1); setAction(''); setActor(''); setRole(''); setRange('30d'); };

  return <div className="space-y-5">
    <header><p className="text-xs font-extrabold uppercase tracking-widest text-teal-700">Security & accountability</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Audit Logs</h1><p className="mt-2 text-sm text-slate-600">Meaningful platform actions without private message content or credentials.</p></header>
    <section className="premium-card p-4" aria-label="Audit log filters">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Filter activity</h2><p className="text-xs text-slate-500">Results update automatically.</p></div><button className="btn-secondary" type="button" onClick={resetFilters}>Reset filters</button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1 text-xs font-semibold text-slate-600">Date range<select className="input" value={range} onChange={(event) => updateFilter(() => setRange(event.target.value as DateRange))}>{rangeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">Event or action<input className="input" placeholder="e.g. login or profile" value={action} onChange={(event) => updateFilter(() => setAction(event.target.value))} /></label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">User or actor<input className="input" placeholder="Search actor name" value={actor} onChange={(event) => updateFilter(() => setActor(event.target.value))} /></label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">Role<select className="input" value={role} onChange={(event) => updateFilter(() => setRole(event.target.value))}><option value="">All roles</option><option value="student">Student</option><option value="mentor">Mentor</option><option value="admin">Admin</option></select></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span className="font-semibold">Active:</span>{activeFilters.map((filter) => <span className="rounded-full bg-teal-50 px-2.5 py-1 font-semibold text-teal-800" key={filter}>{filter}</span>)}</div>
    </section>
    {error ? <div className="alert-error">{error}</div> : null}
    <section className="premium-card overflow-hidden" aria-busy={loading}>
      <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Context'].map((heading) => <th className="px-4 py-3" key={heading}>{heading}</th>)}</tr></thead><tbody>{items.map((item) => <tr className="border-t border-slate-100" key={item.id}><td className="whitespace-nowrap px-4 py-3">{new Date(item.timestamp).toLocaleString()}</td><td className="px-4 py-3">{item.actor}</td><td className="px-4 py-3 capitalize">{item.role ?? '—'}</td><td className="px-4 py-3 font-semibold capitalize">{formatAction(item.action)}</td><td className="px-4 py-3">{item.entity ?? '—'}</td><td className="px-4 py-3 text-xs text-slate-500">{item.context ? Object.entries(item.context).map(([key, value]) => `${key}: ${String(value)}`).join(', ') : '—'}</td></tr>)}</tbody></table></div>
      <div className="grid gap-3 p-4 md:hidden">{items.map((item) => <article className="rounded-xl border border-slate-200 p-3" key={item.id}><strong className="text-sm capitalize">{formatAction(item.action)}</strong><p className="mt-1 text-xs text-slate-500">{item.actor} · {item.role ?? 'system'} · {new Date(item.timestamp).toLocaleString()}</p><p className="mt-2 text-xs text-slate-600">{item.entity ?? 'Platform activity'}</p></article>)}</div>
      {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading audit events…</p> : null}
      {!loading && !items.length && !error ? <p className="p-8 text-center text-sm text-slate-500">No audit events match the selected filters.</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm"><span>{total} records</span><div className="flex gap-2"><button className="btn-secondary" disabled={page === 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button><span className="self-center text-xs text-slate-500">Page {page}</span><button className="btn-secondary" disabled={page * 20 >= total || loading} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>
    </section>
  </div>;
}
