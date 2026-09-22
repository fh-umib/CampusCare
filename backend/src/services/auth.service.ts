import { authRepository } from '../repositories/auth.repository.js';
import type { PublicUser, User } from '../types/user.js';
import { passwordUtils } from '../utils/password.js';
import { tokenUtils } from '../utils/token.js';
import {
  validateForgotPasswordPayload,
  validateLoginPayload,
  validateRegisterPayload
} from '../utils/validation.js';
import { AppError } from '../utils/httpError.js';
import { twoFactorService } from '../modules/security/twoFactor.service.js';
import { auditService } from '../modules/security/audit.service.js';

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
      throw new AppError(409, 'An account with this email already exists.');
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
      await auditService.record({ actor: toPublicUser(user), action: 'login_failed', entityType: 'session' });
      throw new AppError(401, 'Invalid email or password');
    }

    assertAdminIsAuthorized(user);

    if(user.role==='admin'){
      const security=await authRepository.getAdminSecurity(user.id);
      if(security?.admin_2fa_enabled)return{requiresTwoFactor:true,challengeToken:tokenUtils.signTwoFactorChallenge({userId:user.id,role:user.role})};
    }

    await auditService.record({actor:toPublicUser(user),action:'login_success',entityType:'session'});

    return createAuthResponse(user);
  },

  verifyTwoFactor:async(payload:unknown)=>{if(!payload||typeof payload!=='object')throw new AppError(400,'Verification details are required.');const data=payload as Record<string,unknown>;if(typeof data.challengeToken!=='string'||typeof data.code!=='string')throw new AppError(400,'Challenge token and verification code are required.');const challenge=tokenUtils.verify(data.challengeToken);if(challenge.purpose!=='admin-2fa'||challenge.role!=='admin')throw new AppError(401,'Invalid or expired verification challenge.');const user=await authRepository.findById(challenge.userId);if(!user||user.role!=='admin'||!(await twoFactorService.verifyLogin(user.id,data.code)))throw new AppError(401,'The verification code is invalid or expired.',[],'TWO_FACTOR_CODE_INVALID');const publicUser=toPublicUser(user);await auditService.record({actor:publicUser,action:'admin_2fa_verified',entityType:'session'});await auditService.record({actor:publicUser,action:'login_success',entityType:'session'});return createAuthResponse(user)},

  forgotPassword: async (payload: unknown) => {
    validateForgotPasswordPayload(payload);

    return {
      prepared: true
    };
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
