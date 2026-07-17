import { stressRepository } from '../repositories/stress.repository.js';
import { notificationService } from './notification.service.js';
import type { PublicUser } from '../types/user.js';
import {
  canViewGlobalRecords,
  optionalString,
  requireCurrentUser,
  requireIntegerRange,
  requireObject
} from '../utils/moduleValidation.js';

function scopeFor(user: PublicUser) {
  return canViewGlobalRecords(user.role) ? {} : { userId: user.id };
}

export const stressService = {
  list: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return stressRepository.findRecords(scopeFor(user));
  },

  create: async (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const data = requireObject(payload);

    const stressLevel = requireIntegerRange(data.stress_level ?? data.stressLevel, 'stress_level', 1, 5);
    const created = await stressRepository.create({
      userId: user.id,
      subject: optionalString(data.subject, 'subject', 100),
      stressLevel,
      note: optionalString(data.note, 'note', 2000)
    });
    const notifications = [
      notificationService.create({
        userId: user.id,
        type: 'stress' as const,
        title: 'Stress check-in saved',
        message: `Your level ${stressLevel} check-in${created.subject ? ` for ${created.subject}` : ''} was recorded.`,
        link: '/stress-tracker'
      })
    ];
    if (stressLevel >= 4) {
      notifications.push(
        notificationService.create({
          role: 'mentor',
          type: 'stress',
          title: 'High stress signal recorded',
          message: 'A level 4 or 5 ExamStress check-in may need supportive attention.',
          link: '/stress-tracker'
        }),
        notificationService.create({
          role: 'admin',
          type: 'stress',
          title: 'ExamStress attention signal',
          message: 'A high-pressure check-in was added to campus wellbeing activity.',
          link: '/stress-tracker'
        })
      );
    }
    await Promise.all(notifications);
    return created;
  },

  summary: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return stressRepository.summary(scopeFor(user));
  }
};
