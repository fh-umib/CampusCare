import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../types/roles.js';

export function authorizeRoles(..._roles: UserRole[]) {
  return (_request: Request, _response: Response, next: NextFunction) => {
    next();
  };
}

