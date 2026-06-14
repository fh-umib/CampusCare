import type { PoolClient } from 'pg';
import { pool } from '../config/database.js';
import { passwordUtils } from '../utils/password.js';

const demoPassword = process.env.DEMO_SEED_PASSWORD ?? '12345678';

const demoUsers = [
  {
    fullName: 'CampusCare Student',
    email: 'student@campuscare.local',
    role: 'student'
  },
  {
    fullName: 'CampusCare Mentor',
    email: 'mentor@campuscare.local',
    role: 'mentor'
  },
  {
    fullName: 'Flutura Hyseni',
    email: 'fluturahysenni@gmail.com',
    role: 'admin'
  }
] as const;

type DemoRole = (typeof demoUsers)[number]['role'];

async function upsertDemoUser(
  client: PoolClient,
  fullName: string,
  email: string,
  role: DemoRole,
  passwordHash: string
) {
  const result = await client.query<{ id: string }>(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
     SET full_name = EXCLUDED.full_name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         updated_at = NOW()
     RETURNING id`,
    [fullName, email, passwordHash, role]
  );

  return result.rows[0].id;
}

async function seedDemoData() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to seed demo data.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userIds = new Map<DemoRole, string>();
    for (const user of demoUsers) {
      const passwordHash = await passwordUtils.hash(demoPassword);
      const userId = await upsertDemoUser(client, user.fullName, user.email, user.role, passwordHash);
      userIds.set(user.role, userId);
    }

    const studentId = userIds.get('student');
    const mentorId = userIds.get('mentor');
    const adminId = userIds.get('admin');

    if (!studentId || !mentorId || !adminId) {
      throw new Error('Unable to resolve all demo user IDs.');
    }

    await client.query(
      `INSERT INTO user_profiles (
         user_id, study_year, department, reason_for_joining, support_interest,
         expertise_areas, can_help_with, availability, mentoring_reason,
         preferred_support_type, admin_position, admin_department_unit,
         admin_access_reason, onboarding_completed
       )
       VALUES
         ($1, '3', 'Computer Science and Engineering',
          'Use one workspace for academic support and wellbeing check-ins.',
          'academic help', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE),
         ($2, NULL, NULL, NULL, NULL,
          'Programming, databases, and project guidance',
          'SQL, GitHub workflows, backend structure, and project planning',
          'Available twice per week',
          'Support students with practical academic guidance.',
          'Silent Help replies and short mentoring sessions',
          NULL, NULL, NULL, TRUE),
         ($3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
          'Platform administrator',
          'Faculty of Computer Science and Engineering',
          'Review platform activity and support trends.',
          TRUE)
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
           onboarding_completed = EXCLUDED.onboarding_completed`,
      [studentId, mentorId, adminId]
    );

    const skillResult = await client.query<{ id: string }>(
      `INSERT INTO skills (name, category)
       VALUES ('TypeScript', 'Programming')
       ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category
       RETURNING id`
    );
    const skillId = skillResult.rows[0].id;

    await client.query(
      `INSERT INTO student_skills (id, user_id, skill_id, level, availability)
       VALUES ('71000000-0000-0000-0000-000000000001', $1, $2, 'intermediate', 'open_to_projects')
       ON CONFLICT (user_id, skill_id) DO UPDATE
       SET level = EXCLUDED.level,
           availability = EXCLUDED.availability`,
      [studentId, skillId]
    );

    await client.query(
      `INSERT INTO help_requests (
         id, user_id, title, category, description, is_anonymous, status, created_at
       )
       VALUES (
         '72000000-0000-0000-0000-000000000001', $1,
         'Understanding database normalization', 'subject',
         'I need guidance with identifying normal forms in a database exercise.',
         TRUE, 'open', NOW() - INTERVAL '1 day'
       )
       ON CONFLICT (id) DO UPDATE
       SET user_id = EXCLUDED.user_id,
           title = EXCLUDED.title,
           category = EXCLUDED.category,
           description = EXCLUDED.description,
           is_anonymous = EXCLUDED.is_anonymous,
           status = EXCLUDED.status`,
      [studentId]
    );

    await client.query(
      `INSERT INTO stress_records (
         id, user_id, subject, stress_level, note, recorded_at
       )
       VALUES (
         '73000000-0000-0000-0000-000000000001', $1,
         'Databases', 3, 'Preparing for the normalization and SQL exam.',
         NOW() - INTERVAL '2 days'
       )
       ON CONFLICT (id) DO UPDATE
       SET user_id = EXCLUDED.user_id,
           subject = EXCLUDED.subject,
           stress_level = EXCLUDED.stress_level,
           note = EXCLUDED.note`,
      [studentId]
    );

    await client.query(
      `INSERT INTO mood_records (id, user_id, mood, note, recorded_at)
       VALUES (
         '74000000-0000-0000-0000-000000000001', $1,
         'motivated', 'Making steady progress on the semester project.',
         NOW() - INTERVAL '1 day'
       )
       ON CONFLICT (id) DO UPDATE
       SET user_id = EXCLUDED.user_id,
           mood = EXCLUDED.mood,
           note = EXCLUDED.note`,
      [studentId]
    );

    await client.query(
      `INSERT INTO lost_found_items (
         id, user_id, title, description, location, item_type, status, item_date, created_at
       )
       VALUES (
         '75000000-0000-0000-0000-000000000001', $1,
         'USB Flash Drive', 'Black USB flash drive found after a laboratory session.',
         'Computer Lab 2', 'found', 'open', CURRENT_DATE - 1,
         NOW() - INTERVAL '1 day'
       )
       ON CONFLICT (id) DO UPDATE
       SET user_id = EXCLUDED.user_id,
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           location = EXCLUDED.location,
           item_type = EXCLUDED.item_type,
           status = EXCLUDED.status,
           item_date = EXCLUDED.item_date`,
      [studentId]
    );

    await client.query(
      `INSERT INTO notifications (id, role, type, title, message, link, is_read, created_at)
       VALUES
         ('76000000-0000-0000-0000-000000000001', 'student', 'reply',
          'Silent Help is ready', 'Support replies and request updates will appear here.',
          '/silent-help', FALSE, NOW() - INTERVAL '50 minutes'),
         ('76000000-0000-0000-0000-000000000002', 'student', 'profile',
          'Complete your CampusCare profile', 'Keep your profile and skills current for better collaboration.',
          '/profile', FALSE, NOW() - INTERVAL '40 minutes'),
         ('76000000-0000-0000-0000-000000000003', 'mentor', 'help_request',
          'New support request', 'A student request is available in the Silent Help queue.',
          '/silent-help', FALSE, NOW() - INTERVAL '30 minutes'),
         ('76000000-0000-0000-0000-000000000004', 'mentor', 'stress',
          'Wellbeing overview available', 'Review the latest stress and mood support signals.',
          '/stress-tracker', FALSE, NOW() - INTERVAL '20 minutes'),
         ('76000000-0000-0000-0000-000000000005', 'admin', 'system',
          'Platform activity overview', 'CampusCare demo module activity is ready for review.',
          '/dashboard', FALSE, NOW() - INTERVAL '15 minutes'),
         ('76000000-0000-0000-0000-000000000006', 'admin', 'lost_found',
          'Campus report needs review', 'A Lost & Found report is currently open.',
          '/lost-found', FALSE, NOW() - INTERVAL '10 minutes')
       ON CONFLICT (id) DO UPDATE
       SET role = EXCLUDED.role,
           type = EXCLUDED.type,
           title = EXCLUDED.title,
           message = EXCLUDED.message,
           link = EXCLUDED.link`,
      []
    );

    await client.query('COMMIT');
    console.log('CampusCare demo data seeded successfully.');
    console.log('Demo users: student@campuscare.local, mentor@campuscare.local, fluturahysenni@gmail.com');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

try {
  await seedDemoData();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Unable to seed CampusCare demo data: ${message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
