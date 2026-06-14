import type { UserRole } from './roles';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
  role?: UserRole;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role?: Exclude<UserRole, 'admin'>;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};
