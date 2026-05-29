CREATE TABLE IF NOT EXISTS help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (
    category IN ('subject', 'project', 'github', 'programming', 'academic_stress', 'teamwork', 'other')
  ),
  description TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS help_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  help_request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) UNIQUE NOT NULL,
  category VARCHAR(80),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level VARCHAR(30) NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  availability VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (
    availability IN ('available', 'busy', 'open_to_projects')
  ),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS stress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(100),
  stress_level INTEGER NOT NULL CHECK (stress_level BETWEEN 1 AND 5),
  note TEXT,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mood_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood VARCHAR(30) NOT NULL CHECK (mood IN ('motivated', 'tired', 'stressed', 'calm', 'overwhelmed')),
  note TEXT,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lost_found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(120),
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('lost', 'found')),
  status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'resolved')),
  item_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_help_requests_status_category ON help_requests(status, category);
CREATE INDEX IF NOT EXISTS idx_help_replies_help_request_id ON help_replies(help_request_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_student_skills_user_id ON student_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill_id ON student_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_stress_records_user_recorded ON stress_records(user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_mood_records_user_recorded ON mood_records(user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_type_status ON lost_found_items(item_type, status);

DROP TRIGGER IF EXISTS trg_help_requests_updated_at ON help_requests;
CREATE TRIGGER trg_help_requests_updated_at
BEFORE UPDATE ON help_requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_lost_found_items_updated_at ON lost_found_items;
CREATE TRIGGER trg_lost_found_items_updated_at
BEFORE UPDATE ON lost_found_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();



