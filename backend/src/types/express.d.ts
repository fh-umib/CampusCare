import type { PublicUser } from './user.js';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      currentUser?: PublicUser;
    }
  }
}

export {};
