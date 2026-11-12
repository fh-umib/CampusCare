CREATE TABLE IF NOT EXISTS campus_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(180) NOT NULL, description TEXT NOT NULL,
 event_type VARCHAR(60) NOT NULL, organizer VARCHAR(180) NOT NULL, location VARCHAR(200) NOT NULL,
 start_date TIMESTAMPTZ NOT NULL, end_date TIMESTAMPTZ, registration_deadline TIMESTAMPTZ,
 external_link TEXT, max_team_size INTEGER CHECK(max_team_size BETWEEN 2 AND 50),
 participation_type TEXT NOT NULL CHECK(participation_type IN ('individual','team','both')),
 status TEXT NOT NULL CHECK(status IN ('upcoming','registration_open','closed','completed')),
 tags TEXT[] NOT NULL DEFAULT '{}', requirements TEXT NOT NULL DEFAULT '',
 created_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(end_date IS NULL OR end_date >= start_date), CHECK(registration_deadline IS NULL OR registration_deadline <= start_date)
);
CREATE TABLE IF NOT EXISTS event_interests (
 event_id UUID REFERENCES campus_events(id), user_id UUID REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT NOW(), PRIMARY KEY(event_id,user_id)
);
CREATE TABLE IF NOT EXISTS event_teams (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL REFERENCES campus_events(id), name VARCHAR(100) NOT NULL,
 description TEXT NOT NULL, goal TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '', leader_user_id UUID NOT NULL REFERENCES users(id),
 max_members INTEGER NOT NULL CHECK(max_members BETWEEN 2 AND 50), status TEXT NOT NULL DEFAULT 'recruiting' CHECK(status IN ('recruiting','full','closed')),
 needed_skills TEXT[] NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS event_team_members (
 team_id UUID NOT NULL REFERENCES event_teams(id), user_id UUID NOT NULL REFERENCES users(id),
 status TEXT NOT NULL CHECK(status IN ('pending','accepted','declined')), contribution_skills TEXT[] NOT NULL DEFAULT '{}',
 joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(team_id,user_id)
);
CREATE TABLE IF NOT EXISTS event_team_messages (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), team_id UUID NOT NULL REFERENCES event_teams(id), sender_user_id UUID NOT NULL REFERENCES users(id),
 message TEXT NOT NULL CHECK(length(message) BETWEEN 1 AND 2000), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS campus_events_start_idx ON campus_events(start_date);
CREATE INDEX IF NOT EXISTS event_teams_event_idx ON event_teams(event_id);
CREATE INDEX IF NOT EXISTS event_messages_history_idx ON event_team_messages(team_id,created_at);
CREATE INDEX IF NOT EXISTS event_members_user_idx ON event_team_members(user_id,status);
