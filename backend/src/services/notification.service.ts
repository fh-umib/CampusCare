import { notificationRepository } from '../repositories/notification.repository.js';
import type { CreateNotificationInput } from '../types/notification.js';
import type { PublicUser } from '../types/user.js';
import { AppError } from '../utils/httpError.js';
import { requireCurrentUser } from '../utils/moduleValidation.js';

export const notificationService = {
  create: (input: CreateNotificationInput) => notificationRepository.create(input),

  list: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return notificationRepository.findVisible(user.id, user.role);
  },

  markAsRead: async (id: string, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const updated = await notificationRepository.markVisibleAsRead(id, user.id, user.role);
    if (!updated) throw new AppError(404, 'Notification not found');
  },

  markAllAsRead: async (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    await notificationRepository.markAllVisibleAsRead(user.id, user.role);
  }
};

