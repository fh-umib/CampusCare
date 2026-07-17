import type { PublicUser } from '../types/user.js';
import { AppError } from './httpError.js';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function requireObject(value: unknown, message = 'Request body must be a non-empty JSON object') {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length === 0) {
    throw new AppError(400, message);
  }
  return value as Record<string, unknown>;
}

export function requireUuid(value: unknown, fieldName = 'id') {
  if (typeof value !== 'string' || !uuidPattern.test(value)) {
    throw new AppError(400, `${fieldName} must be a valid UUID`);
  }
  return value;
}

export function optionalBoolean(value: unknown, fieldName: string, fallback: boolean) {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') throw new AppError(400, `${fieldName} must be a boolean`);
  return value;
}

export function requireCurrentUser(user: PublicUser | undefined) {
  if (!user) {
    throw new AppError(401, 'Authentication is required');
  }

  return user;
}

export function requireString(value: unknown, fieldName: string, maxLength?: number) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(400, `${fieldName} is required`);
  }

  const trimmed = value.trim();

  if (maxLength && trimmed.length > maxLength) {
    throw new AppError(400, `${fieldName} must be ${maxLength} characters or fewer`);
  }

  return trimmed;
}

export function optionalString(value: unknown, fieldName: string, maxLength?: number) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return requireString(value, fieldName, maxLength);
}

export function requireEnum<T extends string>(value: unknown, allowedValues: readonly T[], fieldName: string) {
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    throw new AppError(400, `${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }

  return value as T;
}

export function optionalEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string
) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return requireEnum(value, allowedValues, fieldName);
}

export function requireIntegerRange(value: unknown, fieldName: string, min: number, max: number) {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    throw new AppError(400, `${fieldName} must be an integer between ${min} and ${max}`);
  }

  return numberValue;
}

export function canViewGlobalRecords(role: PublicUser['role']) {
  return role === 'mentor' || role === 'admin';
}
