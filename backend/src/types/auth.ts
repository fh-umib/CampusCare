import type { UserRole } from './roles.js';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type JwtPayload = {
  userId: string;
  role: UserRole;
};

