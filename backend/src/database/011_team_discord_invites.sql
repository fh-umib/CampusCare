-- Optional private collaboration link; existing teams remain unchanged.
ALTER TABLE event_teams ADD COLUMN IF NOT EXISTS discord_invite_url TEXT;
