import { authRepository } from '../repositories/auth.repository.js';
import type { PublicUser, User } from '../types/user.js';
import { passwordUtils } from '../utils/password.js';
import { tokenUtils } from '../utils/token.js';
import { validateLoginPayload, validateRegisterPayload } from '../utils/validation.js';
import { AppError } from '../utils/httpError.js';

const APPROVED_ADMIN_EMAIL = 'fluturahysenni@gmail.com';

function assertAdminIsAuthorized(user: User) {
  if (user.role === 'admin' && user.email.toLowerCase() !== APPROVED_ADMIN_EMAIL) {
    throw new AppError(403, 'This admin account is not authorized to access the admin workspace.');
  }
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function createAuthResponse(user: User) {
  const publicUser = toPublicUser(user);
  const token = tokenUtils.sign({ userId: user.id, role: user.role });

  return {
    token,
    user: publicUser
  };
}

export const authService = {
  register: async (payload: unknown) => {
    const input = validateRegisterPayload(payload);

    if (input.role === 'admin') {
      throw new AppError(403, 'Admin accounts are created manually.');
    }

    const existingUser = await authRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError(409, 'Email is already registered');
    }

    const passwordHash = await passwordUtils.hash(input.password);
    const user = await authRepository.createUser({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role: input.role ?? 'student'
    });

    return createAuthResponse(user);
  },

  login: async (payload: unknown) => {
    const input = validateLoginPayload(payload);
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const passwordMatches = await passwordUtils.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError(401, 'Invalid email or password');
    }

    assertAdminIsAuthorized(user);

    return createAuthResponse(user);
  },

  getCurrentUser: async (userId: string) => {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    assertAdminIsAuthorized(user);

    return toPublicUser(user);
  }
};
