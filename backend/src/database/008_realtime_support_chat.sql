CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  help_request_id UUID NOT NULL UNIQUE REFERENCES help_requests(id) ON DELETE CASCADE,
  student_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  mentor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  student_last_read_at TIMESTAMPTZ,
  mentor_last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('student', 'mentor')),
  message VARCHAR(2000) NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 2000),
  client_message_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  UNIQUE (conversation_id, sender_user_id, client_message_id)
);

CREATE INDEX IF NOT EXISTS idx_support_conversations_student ON support_conversations(student_user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_conversations_mentor ON support_conversations(mentor_user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_conversation ON support_messages(conversation_id, created_at);

INSERT INTO support_conversations (help_request_id, student_user_id, status, closed_at)
SELECT id, user_id, CASE WHEN status = 'closed' THEN 'closed' ELSE 'open' END,
       CASE WHEN status = 'closed' THEN updated_at ELSE NULL END
FROM help_requests
ON CONFLICT (help_request_id) DO NOTHING;

CREATE OR REPLACE FUNCTION create_support_conversation_for_help_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO support_conversations (help_request_id, student_user_id)
  VALUES (NEW.id, NEW.user_id)
  ON CONFLICT (help_request_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_help_request_support_conversation ON help_requests;
CREATE TRIGGER trg_help_request_support_conversation
AFTER INSERT ON help_requests
FOR EACH ROW EXECUTE FUNCTION create_support_conversation_for_help_request();

DROP TRIGGER IF EXISTS trg_support_conversations_updated_at ON support_conversations;
CREATE TRIGGER trg_support_conversations_updated_at
BEFORE UPDATE ON support_conversations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
