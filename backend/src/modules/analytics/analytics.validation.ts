import { AppError } from '../../utils/httpError.js';
import type { AnalyticsPeriodKey, DateRange } from './analytics.types.js';

const periods = ['7d', '30d', 'current_month', 'previous_month', 'custom'] as const;
const maxCustomDays = 366;

function utcStartOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function parseDate(value: unknown, field: string) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(400, `${field} must use YYYY-MM-DD`, [], 'INVALID_DATE_RANGE');
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new AppError(400, `${field} is not a valid date`, [], 'INVALID_DATE_RANGE');
  }
  return date;
}

export function resolveDateRange(query: Record<string, unknown>, now = new Date()): DateRange {
  const requested = query.period ?? '30d';
  const key = (requested === 'current-month' ? 'current_month' : requested === 'previous-month' ? 'previous_month' : requested) as AnalyticsPeriodKey;
  if (!periods.includes(key)) throw new AppError(400, 'Invalid analytics period', [], 'INVALID_PERIOD');

  const today = utcStartOfDay(now);
  let start: Date;
  let end: Date;
  if (key === 'custom') {
    start = parseDate(query.start, 'start');
    end = addDays(parseDate(query.end, 'end'), 1);
    if (end <= start || (end.getTime() - start.getTime()) / 86_400_000 > maxCustomDays) {
      throw new AppError(400, 'Custom range must be between 1 and 366 days', [], 'INVALID_DATE_RANGE');
    }
  } else if (key === 'current_month') {
    start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    end = addDays(today, 1);
  } else if (key === 'previous_month') {
    end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
  } else {
    end = addDays(today, 1);
    start = addDays(end, key === '7d' ? -7 : -30);
  }
  const duration = end.getTime() - start.getTime();
  return { key, start, end, previousStart: new Date(start.getTime() - duration), previousEnd: start };
}
