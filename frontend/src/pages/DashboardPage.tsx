import { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { getApiErrorMessage } from '../services/apiClient';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../types/dashboard';
import { formatDate } from '../utils/formatDate';

const statLabels: Array<[keyof DashboardStats, string]> = [
  ['totalUsers', 'Users'],
  ['totalHelpRequests', 'Help requests'],
  ['openHelpRequests', 'Open help'],
  ['totalSkills', 'Skills'],
  ['totalStressRecords', 'Stress records'],
  ['averageStressLevel', 'Avg. stress'],
  ['lostFoundOpen', 'Lost/found open'],
  ['lostFoundResolved', 'Lost/found resolved']
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .stats()
      .then(setStats)
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="CampusCare activity, wellbeing, and support overview." />
      {isLoading ? <p className="empty-text">Loading dashboard...</p> : null}
      {error ? <div className="alert-error">{error}</div> : null}
      {stats ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statLabels.map(([key, label]) => (
              <article key={key} className="panel">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{String(stats[key] ?? 0)}</p>
              </article>
            ))}
          </section>
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="panel">
              <h2 className="section-title">Mood Counts</h2>
              {Object.keys(stats.moodCounts ?? {}).length === 0 ? (
                <p className="empty-text mt-3">No mood records yet.</p>
              ) : (
                <div className="mt-4 grid gap-2">
                  {Object.entries(stats.moodCounts).map(([mood, count]) => (
                    <div key={mood} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                      <span className="capitalize">{mood.replace('_', ' ')}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="panel">
              <h2 className="section-title">Recent Activity</h2>
              {stats.recentActivity?.length ? (
                <div className="mt-4 space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={`${activity.type}-${activity.createdAt}-${index}`} className="border-b border-slate-100 pb-3">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-slate-500">
                        {activity.type.replace('_', ' ')} · {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text mt-3">No recent activity yet.</p>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
