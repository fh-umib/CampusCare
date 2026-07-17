import type { UserRole } from './roles';

export type AnalyticsOverview = {
  role: UserRole;
  period: { key: string; start: string; end: string };
  metrics: Record<string, number | string | null>;
  distributions: Record<string, Array<{ label: string; value: number }>>;
  series: Record<string, Array<{ date: string; value: number }>>;
  heatmap: Array<{ day: string; hour: number; value: number }>;
  comparison: { currentActivity: number; previousActivity: number; changePercent: number | null };
  limitations: string[];
};
