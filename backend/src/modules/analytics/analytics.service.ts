import type { PublicUser } from '../../types/user.js';
import { AppError } from '../../utils/httpError.js';
import { requireCurrentUser } from '../../utils/moduleValidation.js';
import { analyticsRepository } from './analytics.repository.js';
import { aiRepository } from '../ai/ai.repository.js';
import type { AnalyticsOverview, AnalyticsRole, CountPoint, DateRange, HeatmapPoint, TimePoint } from './analytics.types.js';

export function assertAnalyticsRole(user: PublicUser, role: AnalyticsRole) {
  if (user.role !== role) throw new AppError(403, 'You do not have permission to view these analytics.', [], 'ANALYTICS_FORBIDDEN');
}

const number = (value: unknown) => value === null || value === undefined ? 0 : Number(value);
const points = (rows: Record<string, unknown>[]): CountPoint[] => rows.map((r) => ({ label: String(r.label), value: number(r.value) }));
const series = (rows: Record<string, unknown>[]): TimePoint[] => rows.map((r) => ({ date: String(r.date), value: number(r.value) }));
const heatmap = (rows: Record<string, unknown>[]): HeatmapPoint[] => rows.map((r) => ({ day: String(r.weekday_name), hour: number(r.hour), value: number(r.value) }));
const change = (current: number, previous: number) => previous === 0 ? (current === 0 ? 0 : null) : Math.round(((current - previous) / previous) * 1000) / 10;
const period = (range: DateRange) => ({ key: range.key, start: range.start.toISOString(), end: range.end.toISOString() });
export const calculateAiSuccessRate = (successful: unknown, total: unknown) => number(total) ? Math.round(number(successful) / number(total) * 1000) / 10 : 0;

export const analyticsService = {
  overview: async (requestedRole: AnalyticsRole, range: DateRange, currentUser: PublicUser | undefined): Promise<AnalyticsOverview> => {
    const user = requireCurrentUser(currentUser);
    assertAnalyticsRole(user, requestedRole);

    if (requestedRole === 'student') {
      const data = await analyticsRepository.student(user.id, range);
      const aiUsage = await aiRepository.studentUsage(user.id, range.start, range.end);
      const current = number(data.extras.current_activity);
      const previous = number(data.extras.previous_activity);
      const moods = points(data.moods);
      const avg = data.metrics.average_stress === null ? null : number(data.metrics.average_stress);
      const prevAvg = data.metrics.previous_average_stress === null ? null : number(data.metrics.previous_average_stress);
      return {
        role: requestedRole, period: period(range),
        metrics: {
          stressCheckIns: number(data.metrics.stress_count), averageStress: avg,
          stressTrend: avg === null || prevAvg === null ? null : Math.round((avg - prevAvg) * 100) / 100,
          moodCheckIns: moods.reduce((sum, item) => sum + item.value, 0), mostCommonMood: moods[0]?.label ?? null,
          skillsAdded: number(data.extras.skills_added), skillsVerified: null, skillsPendingCheck: null,
          helpRequestsCreated: number(data.extras.help_created), lostFoundCreated: number(data.extras.lost_found_created),
          notificationActivity: number(data.extras.notifications), profileCompletion: data.extras.profile_complete ? 100 : 0,
          weeklyActivityCount: current
          ,aiStudySessions: number(aiUsage.sessions), mostUsedAiMode: aiUsage.most_used_mode ? String(aiUsage.most_used_mode) : null,
          lastAiStudySession: aiUsage.last_session ? new Date(String(aiUsage.last_session)).toISOString() : null
        },
        distributions: { moods, helpRequestStatus: points(data.help), moduleUsage: points(data.modules) },
        series: { activityByDay: series(data.daily) }, heatmap: heatmap(data.heatmap),
        comparison: { currentActivity: current, previousActivity: previous, changePercent: change(current, previous) },
        limitations: ['Skill verification is not represented in the current schema.', 'Wellbeing values are self-reported signals, not clinical conclusions.']
      };
    }

    const data = await analyticsRepository.aggregate(range, requestedRole === 'admin');
    const aiUsage = requestedRole === 'admin' ? await aiRepository.aggregateUsage(range.start, range.end) : null;
    const aiModes = requestedRole === 'admin' ? await aiRepository.modeUsage(range.start, range.end) : [];
    const aiDaily = requestedRole === 'admin' ? await aiRepository.dailyUsage(range.start, range.end) : [];
    const current = number(data.metrics.current_activity);
    const previous = number(data.metrics.previous_activity);
    const metrics: Record<string, number | string | null> = {
      openHelpRequests: number(data.metrics.open_requests), answeredHelpRequests: number(data.metrics.answered_requests),
      averageResponseHours: data.metrics.average_response_hours === null ? null : number(data.metrics.average_response_hours),
      activeUsers: number(data.metrics.active_users)
    };
    if (requestedRole === 'admin') Object.assign(metrics, {
      totalUsers: number(data.metrics.total_users), newRegistrations: number(data.metrics.new_registrations),
      lostFoundActivity: number(data.metrics.lost_found_activity), notificationTotal: number(data.metrics.notification_total)
      ,totalAiRequests: number(aiUsage?.total_requests), activeAiUsers: number(aiUsage?.active_ai_users),
      aiSuccessfulRequests: number(aiUsage?.successful_requests), aiFailedRequests: number(aiUsage?.failed_requests),
      aiAverageResponseMs: number(aiUsage?.average_response_ms)
      ,aiSuccessRate: calculateAiSuccessRate(aiUsage?.successful_requests, aiUsage?.total_requests)
    });
    return {
      role: requestedRole, period: period(range), metrics,
      distributions: { helpRequestStatus: points(data.help), requestCategories: points(data.categories), stressSignals: points(data.stress), moods: points(data.moods), moduleUsage: points(data.modules), ...(requestedRole === 'admin' ? { usersByRole: points(data.roles), aiModeUsage: points(aiModes) } : {}) },
      series: { activityByDay: series(data.daily), ...(requestedRole === 'admin' ? { aiRequestsByDay: series(aiDaily) } : {}) }, heatmap: heatmap(data.heatmap),
      comparison: { currentActivity: current, previousActivity: previous, changePercent: change(current, previous) },
      limitations: ['Priority is not stored in the current schema and is therefore not reported.', 'Wellbeing distributions are anonymous aggregates of self-reported signals.']
    };
  }
};
