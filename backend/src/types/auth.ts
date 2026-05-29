import type { UserRole } from './roles.js';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type JwtPayload = {
  userId: string;
  role: UserRole;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};
