import type { UserRole } from './roles.js';

export type NotificationType =
  | 'help_request'
  | 'reply'
  | 'skill_check'
  | 'stress'
  | 'mood'
  | 'lost_found'
  | 'profile'
  | 'system';

export type Notification = {
  id: string;
  userId: string | null;
  role: UserRole | null;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

export type CreateNotificationInput = {
  userId?: string;
  role?: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

