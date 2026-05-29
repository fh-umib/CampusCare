import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { tokenUtils } from '../utils/token.js';
import { AppError } from '../utils/httpError.js';

export async function authenticate(request: Request, _response: Response, next: NextFunction) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication token is required');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const payload = tokenUtils.verify(token);
    request.currentUser = await authService.getCurrentUser(payload.userId);

    next();
  } catch (error) {
    next(error);
  }
}

export const requireAuth = authenticate;
