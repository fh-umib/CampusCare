import type { UserRole } from '../types/roles.js';
import type { ForgotPasswordInput, LoginInput, RegisterInput } from '../types/auth.js';
import { AppError } from './httpError.js';

const roles: UserRole[] = ['student', 'mentor', 'admin'];
const publicRegistrationRoles: UserRole[] = ['student', 'mentor'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterPayload(payload: unknown): RegisterInput {
  if (!payload || typeof payload !== 'object') {
    throw new AppError(400, 'Invalid registration payload');
  }

  const data = payload as Partial<RegisterInput>;
  const errors: string[] = [];

  if (!data.fullName || typeof data.fullName !== 'string') {
    errors.push('fullName is required');
  }

  if (!data.email || typeof data.email !== 'string' || !emailPattern.test(data.email)) {
    errors.push('A valid email is required');
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (data.role && !roles.includes(data.role)) {
    errors.push("role must be one of: student, mentor, admin");
  }

  if (data.role === 'admin') {
    throw new AppError(403, 'Admin accounts are created manually.');
  }

  if (errors.length > 0) {
    throw new AppError(400, 'Registration validation failed', errors);
  }

  return {
    fullName: data.fullName!.trim(),
    email: data.email!.trim().toLowerCase(),
    password: data.password!,
    role: publicRegistrationRoles.includes(data.role as UserRole) ? data.role : 'student'
  };
}

export function validateLoginPayload(payload: unknown): LoginInput {
  if (!payload || typeof payload !== 'object') {
    throw new AppError(400, 'Invalid login payload');
  }

  const data = payload as Partial<LoginInput>;
  const errors: string[] = [];

  if (!data.email || typeof data.email !== 'string' || !emailPattern.test(data.email)) {
    errors.push('A valid email is required');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    throw new AppError(400, 'Login validation failed', errors);
  }

  return {
    email: data.email!.trim().toLowerCase(),
    password: data.password!
  };
}

export function validateForgotPasswordPayload(payload: unknown): ForgotPasswordInput {
  if (!payload || typeof payload !== 'object') {
    throw new AppError(400, 'Invalid password recovery payload');
  }

  const data = payload as Partial<ForgotPasswordInput>;
  const errors: string[] = [];

  if (!data.email || typeof data.email !== 'string' || !emailPattern.test(data.email)) {
    errors.push('A valid email is required');
  }

  if (data.role && !roles.includes(data.role)) {
    errors.push('role must be one of: student, mentor, admin');
  }

  if (errors.length > 0) {
    throw new AppError(400, 'Password recovery validation failed', errors);
  }

  return {
    email: data.email!.trim().toLowerCase(),
    role: data.role
  };
}
