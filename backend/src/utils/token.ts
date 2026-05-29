import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { JwtPayload } from '../types/auth.js';
import { AppError } from './httpError.js';

export const tokenUtils = {
  sign: (payload: JwtPayload) => {
    if (!env.jwtSecret) {
      throw new AppError(500, 'JWT secret is not configured');
    }

    return jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as SignOptions['expiresIn']
    });
  },

  verify: (token: string) => {
    if (!env.jwtSecret) {
      throw new AppError(500, 'JWT secret is not configured');
    }

    try {
      return jwt.verify(token, env.jwtSecret) as JwtPayload;
    } catch {
      throw new AppError(401, 'Invalid or expired token');
    }
  }
};
