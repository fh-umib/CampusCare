-- Configure the single approved CampusCare admin account.
-- Login: fluturahysenni@gmail.com
-- Demo password: 12345678
-- The password is stored only as a bcrypt hash.

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Flutura Hyseni',
  'fluturahysenni@gmail.com',
  '$2b$12$druNJ6xhQ2qon.0qQIcZVu5crQWtElVU3t/wuNxXxcDidJZkU5Ldy',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    updated_at = NOW();
