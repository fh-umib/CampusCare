import { notificationRepository } from '../repositories/notification.repository.js';
import type { CreateNotificationInput } from '../types/notification.js';
import type { PublicUser } from '../types/user.js';
import { AppError } from '../utils/httpError.js';
import { requireCurrentUser, requireUuid } from '../utils/moduleValidation.js';
import { emitToRole, emitToUser } from '../realtime/realtime.events.js';

export const notificationService = {
  create: async (input: CreateNotificationInput) => {
    const notification=await notificationRepository.create(input);
    if(input.userId)emitToUser(input.userId,'notification:new',notification);
    if(input.role)emitToRole(input.role,'notification:new',notification);
    return notification;
  },

  list: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return notificationRepository.findVisible(user.id, user.role);
  },

  markAsRead: async (id: string, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    requireUuid(id);
    const updated = await notificationRepository.markVisibleAsRead(id, user.id, user.role);
    if (!updated) throw new AppError(404, 'Notification not found');
    emitToUser(user.id,'notification:read',{id});
  },

  markAllAsRead: async (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    await notificationRepository.markAllVisibleAsRead(user.id, user.role);
    emitToUser(user.id,'notification:read-all',{});
  }
};
