import { moodRepository } from '../repositories/mood.repository.js';
import { notificationService } from './notification.service.js';
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

  create: async (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const data = payload as Record<string, unknown>;

    const mood = requireEnum(data.mood, moodValues, 'mood');
    const created = await moodRepository.create({
      userId: user.id,
      mood,
      note: optionalString(data.note, 'note')
    });
    await notificationService.create({
      userId: user.id,
      type: 'mood',
      title: 'Mood reflection saved',
      message: `Your ${mood} MoodCampus check-in was recorded.`,
      link: '/mood-campus'
    });
    return created;
  },

  summary: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return moodRepository.summary(scopeFor(user));
  }
};
