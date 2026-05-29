import { stressRepository } from '../repositories/stress.repository.js';
import type { PublicUser } from '../types/user.js';
import {
  canViewGlobalRecords,
  optionalString,
  requireCurrentUser,
  requireIntegerRange
} from '../utils/moduleValidation.js';

function scopeFor(user: PublicUser) {
  return canViewGlobalRecords(user.role) ? {} : { userId: user.id };
}

export const stressService = {
  list: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return stressRepository.findRecords(scopeFor(user));
  },

  create: (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const data = payload as Record<string, unknown>;

    return stressRepository.create({
      userId: user.id,
      subject: optionalString(data.subject, 'subject', 100),
      stressLevel: requireIntegerRange(data.stress_level ?? data.stressLevel, 'stress_level', 1, 5),
      note: optionalString(data.note, 'note')
    });
  },

  summary: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return stressRepository.summary(scopeFor(user));
  }
};
