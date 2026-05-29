import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../types/dashboard';
import { formatDate } from '../utils/formatDate';

type StatCard = {
  label: string;
  value: number;
  description: string;
};

function formatMetric(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function roleIntro(role?: string) {
  if (role === 'admin') {
    return {
      title: 'Admin Dashboard',
      description: 'Global CampusCare activity, support load, wellbeing signals, and report status.'
    };
  }

  if (role === 'mentor') {
    return {
      title: 'Mentor Dashboard',
      description: 'Support-focused overview for help requests, student skills, and wellbeing trends.'
    };
  }

  return {
    title: 'Student Dashboard',
    description: 'Your personal CampusCare activity across help requests, skills, stress, mood, and lost/found reports.'
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
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

  const moodTotal = useMemo(() => {
    return stats?.totalMoodRecords ?? Object.values(stats?.moodCounts ?? {}).reduce((total, count) => total + count, 0);
  }, [stats]);

  const cards = useMemo<StatCard[]>(() => {
    if (!stats) {
      return [];
    }

    if (user?.role === 'admin') {
      return [
        { label: 'Total Users', value: stats.totalUsers, description: 'Registered students, mentors, and admins' },
        { label: 'Help Requests', value: stats.totalHelpRequests, description: 'All submitted help requests' },
        { label: 'Open Help Requests', value: stats.openHelpRequests, description: 'Requests needing attention' },
        { label: 'Skills Added', value: stats.totalSkills, description: 'Shared SkillMap catalog entries' },
        { label: 'Skill Profiles', value: stats.totalStudentSkills ?? 0, description: 'Skills attached to user profiles' },
        { label: 'Stress Records', value: stats.totalStressRecords, description: 'ExamStress check-ins' },
        { label: 'Mood Records', value: moodTotal, description: 'MoodCampus check-ins' },
        { label: 'Lost/Found Items', value: stats.totalLostFoundItems ?? 0, description: 'All lost/found reports' },
        { label: 'Average Stress', value: stats.averageStressLevel, description: 'Average recorded stress level' }
      ];
    }

    if (user?.role === 'mentor') {
      return [
        { label: 'Open Help Requests', value: stats.openHelpRequests, description: 'Students waiting for support' },
        { label: 'Help Requests', value: stats.totalHelpRequests, description: 'Support conversations visible to mentors' },
        { label: 'SkillMap Skills', value: stats.totalSkills, description: 'Skills available for collaboration' },
        { label: 'Student Skill Profiles', value: stats.totalStudentSkills ?? 0, description: 'Students showing practical skills' },
        { label: 'Average Stress', value: stats.averageStressLevel, description: 'Overall wellbeing signal' },
        { label: 'Stress Records', value: stats.totalStressRecords, description: 'Stress check-ins available' },
        { label: 'Mood Records', value: moodTotal, description: 'Mood check-ins available' }
      ];
    }

    return [
      { label: 'My Help Requests', value: stats.totalHelpRequests, description: 'Support requests connected to you' },
      { label: 'My Skills', value: stats.totalStudentSkills ?? 0, description: 'Skills attached to your SkillMap profile' },
      { label: 'My Stress Records', value: stats.totalStressRecords, description: 'Your ExamStress check-ins' },
      { label: 'My Mood Records', value: moodTotal, description: 'Your MoodCampus entries' },
      { label: 'My Lost/Found Reports', value: stats.totalLostFoundItems ?? 0, description: 'Lost/found reports connected to you' },
      { label: 'Resolved Reports', value: stats.lostFoundResolved, description: 'Your resolved lost/found reports' },
      { label: 'Average Stress', value: stats.averageStressLevel, description: 'Your average stress level' }
    ];
  }, [moodTotal, stats, user?.role]);

  const intro = roleIntro(user?.role);

  return (
    <div className="space-y-6">
      <PageHeader title={intro.title} description={intro.description} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge-green">{user?.role} view</span>
        {user?.role === 'admin' ? <span className="badge">Global activity</span> : null}
        {user?.role === 'mentor' ? <span className="badge">Support overview</span> : null}
      </div>
      {isLoading ? <div className="empty-state">Loading dashboard statistics...</div> : null}
      {error ? <div className="alert-error">{error}</div> : null}
      {stats ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <article key={card.label} className="panel">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{formatMetric(card.value)}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {card.value === 0 ? 'No data yet. Use the module pages to add activity.' : card.description}
                </p>
              </article>
            ))}
          </section>

          {user?.role === 'student' ? (
            <section className="panel">
              <h2 className="section-title">Quick Actions</h2>
              <p className="section-subtitle">Continue the main student flow from here.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="btn-secondary" to="/silent-help">
                  Create help request
                </Link>
                <Link className="btn-secondary" to="/skill-map">
                  Add skill
                </Link>
                <Link className="btn-secondary" to="/stress-tracker">
                  Add stress record
                </Link>
                <Link className="btn-secondary" to="/mood-campus">
                  Add mood
                </Link>
                <Link className="btn-secondary" to="/lost-found">
                  Report item
                </Link>
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="panel">
              <h2 className="section-title">Mood Summary</h2>
              <p className="section-subtitle">
                {user?.role === 'student' ? 'Your MoodCampus records.' : 'MoodCampus counts for support awareness.'}
              </p>
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
              <p className="section-subtitle">
                {user?.role === 'student' ? 'Your latest CampusCare activity.' : 'Latest platform support and report activity.'}
              </p>
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
