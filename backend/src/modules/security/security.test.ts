import assert from 'node:assert/strict';
import test from 'node:test';
import type { PublicUser } from '../../types/user.js';
import { tokenUtils } from '../../utils/token.js';
import { auditService } from './audit.service.js';
import { auditRepository } from './audit.repository.js';
import { twoFactorService } from './twoFactor.service.js';

const user = (role: PublicUser['role']): PublicUser => ({ id: '10000000-0000-4000-8000-000000000001', role, fullName: 'Test User', email: 'test@example.com', createdAt: new Date(), updatedAt: new Date() });

test('two-factor challenge tokens are temporary and purpose scoped', () => {
  const token = tokenUtils.signTwoFactorChallenge({ userId: user('admin').id, role: 'admin' });
  const payload = tokenUtils.verify(token);
  assert.equal(payload.purpose, 'admin-2fa');
  assert.equal(payload.role, 'admin');
});

test('student and mentor cannot manage admin two-factor authentication', async () => {
  await assert.rejects(twoFactorService.status(user('student')), (error: unknown) => Boolean(error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403));
  await assert.rejects(twoFactorService.setup(user('mentor')), (error: unknown) => Boolean(error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403));
});

test('student and mentor cannot access audit logs', async () => {
  await assert.rejects(auditService.adminList({}, user('student')), /permission/);
  await assert.rejects(auditService.adminList({}, user('mentor')), /permission/);
});

test('admin audit filters map to the server-side repository together', async () => {
  const repository = auditRepository as unknown as Record<string, unknown>;
  const original = repository.list;
  let received: Record<string, unknown> | undefined;

  try {
    repository.list = async (input: Record<string, unknown>) => {
      received = input;
      return [];
    };
    const result = await auditService.adminList({
      action: ' login ',
      actor: ' Flutura ',
      role: 'admin',
      start: '2026-08-25T00:00:00.000Z',
      end: '2026-09-23T20:00:00.000Z',
      page: '2',
      limit: '20'
    }, user('admin'));

    assert.deepEqual(received, {
      action: 'login',
      actor: 'Flutura',
      role: 'admin',
      start: '2026-08-25T00:00:00.000Z',
      end: '2026-09-23T20:00:00.000Z',
      page: 2,
      limit: 20
    });
    assert.equal(result.total, 0);
  } finally {
    repository.list = original;
  }
});
