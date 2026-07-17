import type { UserRole } from '../../types/roles.js';

export type AnalyticsPeriodKey = '7d' | '30d' | 'current_month' | 'previous_month' | 'custom';
export type AnalyticsRole = UserRole;

export type DateRange = {
  key: AnalyticsPeriodKey;
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
};

export type CountPoint = { label: string; value: number };
export type TimePoint = { date: string; value: number };
export type HeatmapPoint = { day: string; hour: number; value: number };

export type AnalyticsOverview = {
  role: AnalyticsRole;
  period: { key: AnalyticsPeriodKey; start: string; end: string };
  metrics: Record<string, number | string | null>;
  distributions: Record<string, CountPoint[]>;
  series: Record<string, TimePoint[]>;
  heatmap: HeatmapPoint[];
  comparison: { currentActivity: number; previousActivity: number; changePercent: number | null };
  limitations: string[];
};
