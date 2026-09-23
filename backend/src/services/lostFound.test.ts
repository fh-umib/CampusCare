import assert from 'node:assert/strict';
import test from 'node:test';
import type { PublicUser } from '../types/user.js';
import { auditService } from '../modules/security/audit.service.js';
import { lostFoundRepository } from '../repositories/lostFound.repository.js';
import { notificationService } from './notification.service.js';
import { lostFoundService } from './lostFound.service.js';

const owner: PublicUser = { id: '10000000-0000-4000-8000-000000000001', fullName: 'Owner', email: 'owner@example.com', role: 'student', createdAt: new Date(), updatedAt: new Date() };
const other: PublicUser = { ...owner, id: '10000000-0000-4000-8000-000000000002', email: 'other@example.com' };
const admin: PublicUser = { ...owner, id: '10000000-0000-4000-8000-000000000003', email: 'admin@example.com', role: 'admin' };
const report = { id: '20000000-0000-4000-8000-000000000001', userId: owner.id, title: 'Lost backpack', description: 'Blue backpack', location: 'Library', itemType: 'lost' as const, status: 'open' as const, itemDate: new Date(), reporterName: 'Owner', createdAt: new Date(), updatedAt: new Date() };

async function withMocks(run: (updates: string[]) => Promise<void>) {
  const repository = lostFoundRepository as unknown as Record<string, unknown>;
  const notifications = notificationService as unknown as Record<string, unknown>;
  const audit = auditService as unknown as Record<string, unknown>;
  const originals = { findById: repository.findById, updateStatus: repository.updateStatus, notification: notifications.create, audit: audit.record };
  const updates: string[] = [];
  try {
    repository.findById = async () => report;
    repository.updateStatus = async (_id: string, status: string) => { updates.push(status); return { ...report, status, updatedAt: new Date() }; };
    notifications.create = async () => ({});
    audit.record = async () => true;
    await run(updates);
  } finally {
    repository.findById = originals.findById;
    repository.updateStatus = originals.updateStatus;
    notifications.create = originals.notification;
    audit.record = originals.audit;
  }
}

test('report owner can resolve their own lost item', async () => withMocks(async (updates) => {
  const updated = await lostFoundService.updateStatus(report.id, { status: 'resolved' }, owner);
  assert.equal(updated?.status, 'resolved');
  assert.deepEqual(updates, ['resolved']);
}));

test('another student cannot resolve someone else’s report', async () => withMocks(async (updates) => {
  await assert.rejects(lostFoundService.updateStatus(report.id, { status: 'resolved' }, other), (error: unknown) => Boolean(error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403));
  assert.deepEqual(updates, []);
}));

test('admin retains report-management permission', async () => withMocks(async (updates) => {
  const updated = await lostFoundService.updateStatus(report.id, { status: 'resolved' }, admin);
  assert.equal(updated?.status, 'resolved');
  assert.deepEqual(updates, ['resolved']);
}));
