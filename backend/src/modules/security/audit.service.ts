import type { PublicUser } from '../../types/user.js';
import { requireCurrentUser } from '../../utils/moduleValidation.js';
import { AppError } from '../../utils/httpError.js';
import { logger } from '../../utils/logger.js';
import { auditRepository } from './audit.repository.js';

const safeMetadata = (value: Record<string, unknown> = {}) => Object.fromEntries(Object.entries(value).filter(([key, item]) => !/(password|token|secret|message|prompt|email)/i.test(key) && ['string', 'number', 'boolean'].includes(typeof item)));
const optionalQueryString = (value: unknown, maxLength = 100) => typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : undefined;

export const auditService = {
  record: async (input: { actor?: PublicUser; action: string; entityType?: string; entityId?: string; metadata?: Record<string, unknown>; ipAddress?: string; userAgent?: string }) => { try { await auditRepository.create({ actorUserId: input.actor?.id, actorRole: input.actor?.role, action: input.action, entityType: input.entityType, entityId: input.entityId, metadata: safeMetadata(input.metadata), ipAddress: input.ipAddress, userAgent: input.userAgent }); return true; } catch { logger.warn('audit_record_failed', { action: input.action }); return false; } },
  activity: async (user?: PublicUser) => { const current = requireCurrentUser(user); const rows = await auditRepository.list({ actorUserId: current.id, page: 1, limit: 50 }); return { items: rows.map((row) => ({ id: row.id, action: row.action, entityType: row.entity_type, context: row.metadata, createdAt: row.created_at })), total: Number(rows[0]?.total ?? 0) }; },
  adminList: async (query: Record<string, unknown>, user?: PublicUser) => {
    const current = requireCurrentUser(user);
    if (current.role !== 'admin') throw new AppError(403, 'You do not have permission to perform this action.', [], 'AUDIT_FORBIDDEN');
    const page = Math.max(1, Number(query.page) || 1), limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const rows = await auditRepository.list({ action: optionalQueryString(query.action), actor: optionalQueryString(query.actor), role: optionalQueryString(query.role, 20), start: optionalQueryString(query.start, 40), end: optionalQueryString(query.end, 40), page, limit });
    return { items: rows.map((row) => ({ id: row.id, timestamp: row.created_at, actor: row.actor_name ?? 'System', role: row.actor_role, action: row.action, entity: row.entity_type, context: row.metadata })), page, limit, total: Number(rows[0]?.total ?? 0) };
  }
};
