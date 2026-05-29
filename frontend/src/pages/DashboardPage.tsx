import { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { getApiErrorMessage } from '../services/apiClient';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../types/dashboard';
import { formatDate } from '../utils/formatDate';

type StatCard = {
  key: keyof DashboardStats;
  label: string;
  description: string;
};

const statCards: StatCard[] = [
  { key: 'totalHelpRequests', label: 'Help Requests', description: 'All student support requests' },
  { key: 'openHelpRequests', label: 'Open Help', description: 'Requests still needing attention' },
  { key: 'totalSkills', label: 'Skills', description: 'Skills available in SkillMap' },
  { key: 'totalStressRecords', label: 'Stress Records', description: 'ExamStress check-ins' },
  { key: 'averageStressLevel', label: 'Average Stress', description: 'Current average from records' },
  { key: 'lostFoundOpen', label: 'Lost & Found Open', description: 'Items still unresolved' },
  { key: 'lostFoundResolved', label: 'Resolved Items', description: 'Closed lost/found reports' },
  { key: 'totalUsers', label: 'Users', description: 'Registered CampusCare users' }
];

function formatMetric(value: unknown) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  return String(value ?? 0);
}

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
      <PageHeader
        title="Dashboard"
        description="A quick overview of CampusCare support activity, skills, wellbeing signals, and campus reports."
      />
      {isLoading ? <div className="empty-state">Loading dashboard statistics...</div> : null}
      {error ? <div className="alert-error">{error}</div> : null}
      {stats ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const value = stats[card.key];
              return (
                <article key={card.key} className="panel">
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{formatMetric(value)}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {Number(value ?? 0) === 0 ? 'No data yet. Add activity during the demo flow.' : card.description}
                  </p>
                </article>
              );
            })}
          </section>
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="panel">
              <h2 className="section-title">Mood Summary</h2>
              <p className="section-subtitle">Counts from MoodCampus check-ins.</p>
              {Object.keys(stats.moodCounts ?? {}).length === 0 ? (
                <div className="empty-state mt-4">No mood records yet.</div>
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
              <p className="section-subtitle">Latest support and lost/found updates.</p>
              {stats.recentActivity?.length ? (
                <div className="mt-4 space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={`${activity.type}-${activity.createdAt}-${index}`} className="border-b border-slate-100 pb-3">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-slate-500">
                        {activity.type.replace('_', ' ')} - {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state mt-4">No recent activity yet.</div>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
