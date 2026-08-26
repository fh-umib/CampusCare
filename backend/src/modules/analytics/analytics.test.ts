import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveDateRange } from './analytics.validation.js';
import { assertAnalyticsRole, calculateAiSuccessRate } from './analytics.service.js';
import { buildReport } from '../reports/report.service.js';
import { renderReportPdf } from '../reports/pdf.service.js';
import type { AnalyticsOverview } from './analytics.types.js';
import type { PublicUser } from '../../types/user.js';

const user = (role: PublicUser['role']): PublicUser => ({ id: '00000000-0000-4000-8000-000000000000', fullName: 'Test User', email: 'test@example.com', role, createdAt: new Date(), updatedAt: new Date() });
const empty: AnalyticsOverview = { role: 'student', period: { key: '7d', start: '2026-07-01T00:00:00.000Z', end: '2026-07-08T00:00:00.000Z' }, metrics: { stressCheckIns: 0, moodCheckIns: 0, mostCommonMood: null, helpRequestsCreated: 0, skillsAdded: 0 }, distributions: { moduleUsage: [] }, series: {}, heatmap: [], comparison: { currentActivity: 0, previousActivity: 0, changePercent: 0 }, limitations: [] };

test('period validation uses UTC and rejects invalid values', () => {
  assert.equal(resolveDateRange({ period: '7d' }, new Date('2026-07-17T14:00:00Z')).start.toISOString(), '2026-07-11T00:00:00.000Z');
  assert.equal(resolveDateRange({ period: 'current-month' }, new Date('2026-07-17T14:00:00Z')).key, 'current_month');
  assert.equal(resolveDateRange({ period: 'previous-month' }, new Date('2026-07-17T14:00:00Z')).key, 'previous_month');
  assert.throws(() => resolveDateRange({ period: 'year' }), /Invalid analytics period/);
  assert.throws(() => resolveDateRange({ period: 'custom', start: '2026-07-10', end: '2026-07-01' }), /Custom range/);
});

test('role checks prevent student and mentor access to admin analytics', () => {
  assert.throws(() => assertAnalyticsRole(user('student'), 'admin'), /permission/);
  assert.throws(() => assertAnalyticsRole(user('mentor'), 'admin'), /permission/);
  assert.doesNotThrow(() => assertAnalyticsRole(user('admin'), 'admin'));
});

test('empty datasets produce deterministic privacy-safe reports and PDFs', async () => {
  const report = buildReport(empty, 'weekly');
  assert.equal(JSON.stringify(report).includes('userId'), false);
  assert.equal(JSON.stringify(report).includes('anonymous'), false);
  const pdf = await renderReportPdf(report);
  assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
  assert.ok(pdf.length > 500);
});

test('admin AI analytics reports zero success safely when the provider is unavailable', () => {
  assert.equal(calculateAiSuccessRate(0, 0), 0);
  assert.equal(calculateAiSuccessRate(0, 4), 0);
});
