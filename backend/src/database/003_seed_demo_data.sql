-- CampusCare demo seed data.
-- Student and mentor demo password: CampusCare123
-- Approved admin login: fluturahysenni@gmail.com / 12345678
-- Password hash generated with bcrypt. Do not use these credentials in production.
-- For real usage, users should preferably be created through POST /api/auth/register.

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Flutura Hyseni',
    'flutura.student@campuscare.test',
    '$2b$10$1kbPa8ZqxXAvmNzMk/Lqy.IK/6JRorckUqFn8SdsqxqbX6PXLqSG6',
    'student'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Mentor A',
    'mentor@campuscare.test',
    '$2b$10$1kbPa8ZqxXAvmNzMk/Lqy.IK/6JRorckUqFn8SdsqxqbX6PXLqSG6',
    'mentor'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Flutura Hyseni',
    'fluturahysenni@gmail.com',
    '$2b$12$druNJ6xhQ2qon.0qQIcZVu5crQWtElVU3t/wuNxXxcDidJZkU5Ldy',
    'admin'
  )
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

INSERT INTO skills (id, name, category)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'React', 'Frontend'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'TypeScript', 'Programming'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'C#', 'Programming'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'SQL', 'Database'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'GitHub', 'Version Control'),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'UI Design', 'Design'),
  ('aaaaaaaa-0000-0000-0000-000000000007', 'Backend', 'Development'),
  ('aaaaaaaa-0000-0000-0000-000000000008', 'Database', 'Development'),
  ('aaaaaaaa-0000-0000-0000-000000000009', 'Presentation', 'Communication'),
  ('aaaaaaaa-0000-0000-0000-000000000010', 'Project Management', 'Collaboration')
ON CONFLICT (name) DO UPDATE
SET category = EXCLUDED.category;

INSERT INTO student_skills (id, user_id, skill_id, level, availability)
VALUES
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    (SELECT id FROM skills WHERE name = 'React'),
    'intermediate',
    'open_to_projects'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    (SELECT id FROM skills WHERE name = 'SQL'),
    'intermediate',
    'available'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000003',
    (SELECT id FROM users WHERE email = 'mentor@campuscare.test'),
    (SELECT id FROM skills WHERE name = 'Backend'),
    'advanced',
    'available'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000004',
    (SELECT id FROM users WHERE email = 'mentor@campuscare.test'),
    (SELECT id FROM skills WHERE name = 'Project Management'),
    'advanced',
    'busy'
  )
ON CONFLICT (user_id, skill_id) DO UPDATE
SET level = EXCLUDED.level,
    availability = EXCLUDED.availability;

INSERT INTO user_profiles (
  user_id, study_year, department, reason_for_joining, support_interest,
  expertise_areas, can_help_with, availability, mentoring_reason, preferred_support_type,
  admin_position, admin_department_unit, admin_access_reason, onboarding_completed
)
VALUES
  (
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    '3',
    'Computer Science and Engineering',
    'I want one place to ask for help, show skills, and track pressure during exam weeks.',
    'academic help',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    TRUE
  ),
  (
    (SELECT id FROM users WHERE email = 'mentor@campuscare.test'),
    NULL,
    NULL,
    NULL,
    NULL,
    'Backend, databases, GitHub workflows, and project organization',
    'SQL joins, API structure, GitHub merge conflicts, and project coordination',
    'Available twice per week',
    'I want to help students unblock technical problems earlier.',
    'Replies to Silent Help requests and short project guidance',
    NULL,
    NULL,
    NULL,
    TRUE
  ),
  (
    (SELECT id FROM users WHERE email = 'fluturahysenni@gmail.com'),
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Platform administrator',
    'Faculty of Computer Science and Engineering',
    'Monitor support activity, module usage, and lost/found statuses for the demo environment.',
    TRUE
  )
ON CONFLICT (user_id) DO UPDATE
SET study_year = EXCLUDED.study_year,
    department = EXCLUDED.department,
    reason_for_joining = EXCLUDED.reason_for_joining,
    support_interest = EXCLUDED.support_interest,
    expertise_areas = EXCLUDED.expertise_areas,
    can_help_with = EXCLUDED.can_help_with,
    availability = EXCLUDED.availability,
    mentoring_reason = EXCLUDED.mentoring_reason,
    preferred_support_type = EXCLUDED.preferred_support_type,
    admin_position = EXCLUDED.admin_position,
    admin_department_unit = EXCLUDED.admin_department_unit,
    admin_access_reason = EXCLUDED.admin_access_reason,
    onboarding_completed = EXCLUDED.onboarding_completed;

INSERT INTO help_requests (id, user_id, title, category, description, is_anonymous, status, created_at)
VALUES
  (
    'cccccccc-0000-0000-0000-000000000001',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'GitHub merge conflict before project submission',
    'github',
    'I need help resolving merge conflicts before submitting our team project.',
    TRUE,
    'answered',
    NOW() - INTERVAL '6 days'
  ),
  (
    'cccccccc-0000-0000-0000-000000000002',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'Understanding SQL joins',
    'subject',
    'I understand simple SELECT queries, but INNER JOIN and LEFT JOIN are still confusing.',
    FALSE,
    'open',
    NOW() - INTERVAL '5 days'
  ),
  (
    'cccccccc-0000-0000-0000-000000000003',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'React state issue in form component',
    'programming',
    'My React form state resets unexpectedly after submit and I cannot find why.',
    TRUE,
    'open',
    NOW() - INTERVAL '4 days'
  ),
  (
    'cccccccc-0000-0000-0000-000000000004',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'Exam stress during database week',
    'academic_stress',
    'I am feeling overwhelmed because several exams are close together.',
    TRUE,
    'answered',
    NOW() - INTERVAL '3 days'
  ),
  (
    'cccccccc-0000-0000-0000-000000000005',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'Teamwork and project coordination',
    'teamwork',
    'Our team needs advice on dividing tasks and keeping everyone updated.',
    FALSE,
    'closed',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO help_replies (id, help_request_id, user_id, message, created_at)
VALUES
  (
    'dddddddd-0000-0000-0000-000000000001',
    'cccccccc-0000-0000-0000-000000000001',
    (SELECT id FROM users WHERE email = 'mentor@campuscare.test'),
    'Start by pulling the latest branch, then resolve each conflicted file one at a time before committing.',
    NOW() - INTERVAL '5 days'
  ),
  (
    'dddddddd-0000-0000-0000-000000000002',
    'cccccccc-0000-0000-0000-000000000004',
    (SELECT id FROM users WHERE email = 'mentor@campuscare.test'),
    'Try organizing your revision into smaller blocks and ask for support early if the stress level stays high.',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO stress_records (id, user_id, subject, stress_level, note, recorded_at)
VALUES
  (
    'eeeeeeee-0000-0000-0000-000000000001',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'Databases',
    4,
    'Preparing joins, normalization, and SQL exercises.',
    NOW() - INTERVAL '7 days'
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000002',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'Software Engineering',
    3,
    'Project documentation is almost finished.',
    NOW() - INTERVAL '5 days'
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000003',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'Operating Systems',
    5,
    'Need more practice with process scheduling concepts.',
    NOW() - INTERVAL '3 days'
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000004',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'Business Intelligence',
    2,
    'Feeling more confident after reviewing dashboards.',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_records (id, user_id, mood, note, recorded_at)
VALUES
  (
    'ffffffff-0000-0000-0000-000000000001',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'motivated',
    'Good progress on the project.',
    NOW() - INTERVAL '10 days'
  ),
  (
    'ffffffff-0000-0000-0000-000000000002',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'tired',
    'Long study sessions this week.',
    NOW() - INTERVAL '8 days'
  ),
  (
    'ffffffff-0000-0000-0000-000000000003',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'stressed',
    'Several deadlines are close.',
    NOW() - INTERVAL '6 days'
  ),
  (
    'ffffffff-0000-0000-0000-000000000004',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'calm',
    'Planning helped make the week easier.',
    NOW() - INTERVAL '4 days'
  ),
  (
    'ffffffff-0000-0000-0000-000000000005',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'overwhelmed',
    'Need help prioritizing tasks.',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO lost_found_items (id, user_id, title, description, location, item_type, status, item_date, created_at)
VALUES
  (
    '99999999-0000-0000-0000-000000000001',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'USB Flash Drive',
    'Black 32GB USB flash drive found near the computer lab.',
    'Computer Lab 2',
    'found',
    'open',
    CURRENT_DATE - 5,
    NOW() - INTERVAL '5 days'
  ),
  (
    '99999999-0000-0000-0000-000000000002',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'Student ID Card',
    'Student ID card reported missing after lectures.',
    'Main Hall',
    'lost',
    'claimed',
    CURRENT_DATE - 4,
    NOW() - INTERVAL '4 days'
  ),
  (
    '99999999-0000-0000-0000-000000000003',
    (SELECT id FROM users WHERE email = 'mentor@campuscare.test'),
    'Laptop Charger',
    'HP laptop charger left in the project room.',
    'Project Room',
    'found',
    'open',
    CURRENT_DATE - 3,
    NOW() - INTERVAL '3 days'
  ),
  (
    '99999999-0000-0000-0000-000000000004',
    (SELECT id FROM users WHERE email = 'flutura.student@campuscare.test'),
    'Notebook',
    'Blue notebook with database notes.',
    'Library',
    'lost',
    'resolved',
    CURRENT_DATE - 2,
    NOW() - INTERVAL '2 days'
  ),
  (
    '99999999-0000-0000-0000-000000000005',
    (SELECT id FROM users WHERE email = 'fluturahysenni@gmail.com'),
    'Water Bottle',
    'Reusable water bottle found near classroom 104.',
    'Classroom 104',
    'found',
    'open',
    CURRENT_DATE - 1,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;
