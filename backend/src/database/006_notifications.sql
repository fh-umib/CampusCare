CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20),
  type VARCHAR(40) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT notifications_target_check CHECK (user_id IS NOT NULL OR role IS NOT NULL),
  CONSTRAINT notifications_role_check CHECK (role IS NULL OR role IN ('student', 'mentor', 'admin'))
);

CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_role_created
  ON notifications(role, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user
  ON notification_reads(user_id);

INSERT INTO notifications (user_id, type, title, message, link)
SELECT u.id, sample.type, sample.title, sample.message, sample.link
FROM users u
CROSS JOIN (
  VALUES
    ('system', 'New support activity', 'CampusCare notifications are ready for module updates.', '/dashboard'),
    ('help_request', 'Open requests need review', 'Review the Silent Help queue for open student requests.', '/silent-help'),
    ('lost_found', 'Lost & Found reports updated', 'Campus item reports are available for status review.', '/lost-found')
) AS sample(type, title, message, link)
WHERE u.email = 'fluturahysenni@gmail.com'
  AND NOT EXISTS (
    SELECT 1
    FROM notifications existing
    WHERE existing.user_id = u.id AND existing.title = sample.title
  );
