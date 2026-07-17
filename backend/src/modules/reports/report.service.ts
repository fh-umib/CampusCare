import type { PublicUser } from '../../types/user.js';
import type { AnalyticsOverview, AnalyticsRole, DateRange } from '../analytics/analytics.types.js';
import { analyticsService } from '../analytics/analytics.service.js';

export type Report = { title: string; role: AnalyticsRole; cadence: 'weekly' | 'monthly'; generatedAt: string; period: AnalyticsOverview['period']; summary: string[]; analytics: AnalyticsOverview; disclaimer: string };

export function buildReport(analytics: AnalyticsOverview, cadence: 'weekly' | 'monthly'): Report {
  const m = analytics.metrics;
  const summary = analytics.role === 'student'
    ? [`You recorded ${m.stressCheckIns} stress and ${m.moodCheckIns} mood check-ins.`, `Your most frequent mood was ${m.mostCommonMood ?? 'not available'}.`, `You created ${m.helpRequestsCreated} support requests and added ${m.skillsAdded} skills.`, 'Use these patterns as a reflection aid and contact appropriate campus support when needed.']
    : [`The support queue recorded ${m.openHelpRequests} open and ${m.answeredHelpRequests} answered requests.`, `Average first response time was ${m.averageResponseHours ?? 'not available'} hours.`, `${m.activeUsers} users were active across measured modules.`, analytics.comparison.changePercent === null ? 'There is no comparable prior-period baseline.' : `Platform activity changed ${analytics.comparison.changePercent}% from the previous period.`];
  return { title: `CampusCare ${analytics.role[0].toUpperCase() + analytics.role.slice(1)} ${cadence[0].toUpperCase() + cadence.slice(1)} Report`, role: analytics.role, cadence, generatedAt: new Date().toISOString(), period: analytics.period, summary, analytics, disclaimer: analytics.role === 'student' ? 'This report summarizes self-reported patterns and is not a diagnosis or medical prediction.' : 'This report contains aggregated operational signals and must not be used to identify individual students.' };
}

export const reportService = {
  generate: async (role: AnalyticsRole, cadence: 'weekly' | 'monthly', range: DateRange, user: PublicUser | undefined) => buildReport(await analyticsService.overview(role, range, user), cadence)
};
