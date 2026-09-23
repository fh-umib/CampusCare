import assert from 'node:assert/strict';
import test from 'node:test';
import { stressRepository } from '../repositories/stress.repository.js';
import { auditService } from '../modules/security/audit.service.js';
import { notificationService } from './notification.service.js';
import { stressService } from './stress.service.js';
import type { PublicUser } from '../types/user.js';
import { AppError } from '../utils/httpError.js';

const student: PublicUser = {
  id: '10000000-0000-4000-8000-000000000031',
  fullName: 'ExamStress Student',
  email: 'stress.student@example.com',
  role: 'student',
  createdAt: new Date(),
  updatedAt: new Date()
};

const record = {
  id: '20000000-0000-4000-8000-000000000031',
  userId: student.id,
  studentName: null,
  subject: 'Databases',
  stressLevel: 4,
  note: 'Reviewing normalization before the exam.',
  recordedAt: new Date('2026-09-22T12:00:00Z')
};

test('stress check-in remains successful when a follow-up notification fails', async () => {
  const repository = stressRepository as unknown as Record<string, unknown>;
  const notifications = notificationService as unknown as Record<string, unknown>;
  const audit = auditService as unknown as Record<string, unknown>;
  const originals = {
    create: repository.create,
    notificationCreate: notifications.create,
    auditRecord: audit.record
  };

  try {
    repository.create = async () => record;
    notifications.create = async () => { throw new AppError(503, 'Database is currently unavailable'); };
    audit.record = async () => true;

    const result = await stressService.create(
      { subject: 'Databases', stress_level: 4, note: 'Reviewing normalization before the exam.' },
      student
    );

    assert.equal(result.id, record.id);
    assert.equal(result.userId, student.id);
  } finally {
    repository.create = originals.create;
    notifications.create = originals.notificationCreate;
    audit.record = originals.auditRecord;
  }
});

test('stress persistence errors remain errors and do not create notifications', async () => {
  const repository = stressRepository as unknown as Record<string, unknown>;
  const notifications = notificationService as unknown as Record<string, unknown>;
  const originals = { create: repository.create, notificationCreate: notifications.create };
  let notificationCount = 0;

  try {
    repository.create = async () => { throw new AppError(503, 'Database is currently unavailable', [], 'DATABASE_UNAVAILABLE'); };
    notifications.create = async () => { notificationCount += 1; };

    await assert.rejects(
      stressService.create({ subject: 'Databases', stress_level: 3 }, student),
      (error: unknown) => error instanceof AppError && error.code === 'DATABASE_UNAVAILABLE'
    );
    assert.equal(notificationCount, 0);
  } finally {
    repository.create = originals.create;
    notifications.create = originals.notificationCreate;
  }
});

test('stress validation enforces the intended 1 to 5 scale', async () => {
  await assert.rejects(stressService.create({ stress_level: 0 }, student), /between 1 and 5/);
  await assert.rejects(stressService.create({ stress_level: 6 }, student), /between 1 and 5/);
  await assert.rejects(stressService.create({ stress_level: 3.5 }, student), /integer/);
});

test('student stress reads are owner scoped', async () => {
  const repository = stressRepository as unknown as Record<string, unknown>;
  const original = repository.findRecords;
  let receivedScope: { userId?: string } | undefined;

  try {
    repository.findRecords = async (scope: { userId?: string }) => {
      receivedScope = scope;
      return [];
    };
    await stressService.list(student);
    assert.deepEqual(receivedScope, { userId: student.id });
  } finally {
    repository.findRecords = original;
  }
});
