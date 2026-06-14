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
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

