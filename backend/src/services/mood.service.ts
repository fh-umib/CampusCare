import { moodRepository } from '../repositories/mood.repository.js';
import type { MoodState } from '../types/mood.js';
import type { PublicUser } from '../types/user.js';
import { canViewGlobalRecords, optionalString, requireCurrentUser, requireEnum } from '../utils/moduleValidation.js';

const moodValues = ['motivated', 'tired', 'stressed', 'calm', 'overwhelmed'] as const satisfies readonly MoodState[];

function scopeFor(user: PublicUser) {
  return canViewGlobalRecords(user.role) ? {} : { userId: user.id };
}

export const moodService = {
  list: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return moodRepository.findRecords(scopeFor(user));
  },

  create: (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const data = payload as Record<string, unknown>;

    return moodRepository.create({
      userId: user.id,
      mood: requireEnum(data.mood, moodValues, 'mood'),
      note: optionalString(data.note, 'note')
    });
  },

  summary: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return moodRepository.summary(scopeFor(user));
  }
};
