import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../types/roles.js';
import { AppError } from '../utils/httpError.js';

export function authorizeRoles(...roles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.currentUser) {
      next(new AppError(401, 'Authentication is required'));
      return;
    }

    if (!roles.includes(request.currentUser.role)) {
      next(new AppError(403, 'You do not have permission to perform this action.'));
      return;
    }

    next();
  };
}

export const requireRole = authorizeRoles;
