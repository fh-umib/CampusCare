import { queryDatabase } from '../config/database.js';
import type { CreateNotificationInput, NotificationType } from '../types/notification.js';
import type { UserRole } from '../types/roles.js';

type NotificationRow = {
  id: string;
  user_id: string | null;
  role: UserRole | null;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: Date;
};

function mapNotification(row: NotificationRow) {
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link,
    isRead: row.is_read,
    createdAt: row.created_at
  };
}

export const notificationRepository = {
  create: async (input: CreateNotificationInput) => {
    const result = await queryDatabase<NotificationRow>(
      `INSERT INTO notifications (user_id, role, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [input.userId ?? null, input.role ?? null, input.type, input.title, input.message, input.link ?? null]
    );
    return mapNotification(result.rows[0]);
  },

  findVisible: async (userId: string, role: UserRole) => {
    const result = await queryDatabase<NotificationRow>(
      `SELECT n.*,
         CASE
           WHEN n.user_id = $1 THEN n.is_read
           ELSE EXISTS (
             SELECT 1 FROM notification_reads nr
             WHERE nr.notification_id = n.id AND nr.user_id = $1
           )
         END AS is_read
       FROM notifications n
       WHERE n.user_id = $1 OR n.role = $2
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId, role]
    );
    return result.rows.map(mapNotification);
  },

  markVisibleAsRead: async (notificationId: string, userId: string, role: UserRole) => {
    const visible = await queryDatabase<{ id: string; user_id: string | null }>(
      `SELECT id, user_id
       FROM notifications
       WHERE id = $1 AND (user_id = $2 OR role = $3)`,
      [notificationId, userId, role]
    );
    const notification = visible.rows[0];
    if (!notification) return false;

    if (notification.user_id === userId) {
      await queryDatabase('UPDATE notifications SET is_read = TRUE WHERE id = $1', [notificationId]);
    } else {
      await queryDatabase(
        `INSERT INTO notification_reads (notification_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (notification_id, user_id) DO NOTHING`,
        [notificationId, userId]
      );
    }
    return true;
  },

  markAllVisibleAsRead: async (userId: string, role: UserRole) => {
    await queryDatabase('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
    await queryDatabase(
      `INSERT INTO notification_reads (notification_id, user_id)
       SELECT id, $1
       FROM notifications
       WHERE role = $2
       ON CONFLICT (notification_id, user_id) DO NOTHING`,
      [userId, role]
    );
  }
};

