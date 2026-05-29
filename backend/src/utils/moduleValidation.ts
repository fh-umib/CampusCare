import type { PublicUser } from '../types/user.js';
import { AppError } from './httpError.js';

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
