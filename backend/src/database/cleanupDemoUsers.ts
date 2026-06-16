import type { PoolClient } from 'pg';
import { pool } from '../config/database.js';
import { passwordUtils } from '../utils/password.js';

const demoPassword = process.env.DEMO_SEED_PASSWORD ?? '12345678';

const requiredUsers = [
  {
    fullName: 'Flutura Hyseni',
    email: 'fluturahysenni@gmail.com',
    role: 'admin'
  },
  {
    fullName: 'CampusCare Student',
    email: 'student@campuscare.local',
    role: 'student'
  },
  {
    fullName: 'CampusCare Mentor',
    email: 'mentor@campuscare.local',
    role: 'mentor'
  }
] as const;

type RequiredUser = (typeof requiredUsers)[number];

async function tableExists(client: PoolClient, tableName: string) {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     )`,
    [tableName]
  );

  return result.rows[0]?.exists ?? false;
}

async function upsertRequiredUser(client: PoolClient, user: RequiredUser, passwordHash: string) {
  await client.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
     SET full_name = EXCLUDED.full_name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         updated_at = NOW()`,
    [user.fullName, user.email, passwordHash, user.role]
  );
}

async function deleteRowsForRemovedUsers(
  client: PoolClient,
  tableName: string,
  columnName = 'user_id',
  includeNullUser = false
) {
  if (!(await tableExists(client, tableName))) return 0;

  const result = await client.query(
    `DELETE FROM ${tableName}
     WHERE ${includeNullUser ? `${columnName} IS NULL OR` : ''}
       ${columnName} IN (
         SELECT id
         FROM users
         WHERE LOWER(email) <> ALL($1::text[])
       )`,
    [requiredUsers.map((user) => user.email)]
  );

  return result.rowCount ?? 0;
}

async function cleanupDemoUsers() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to clean demo users.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const passwordHash = await passwordUtils.hash(demoPassword);
    for (const user of requiredUsers) {
      await upsertRequiredUser(client, user, passwordHash);
    }

    const deleted = {
      notificationReads: await deleteRowsForRemovedUsers(client, 'notification_reads'),
      notifications: await deleteRowsForRemovedUsers(client, 'notifications'),
      helpReplies: await deleteRowsForRemovedUsers(client, 'help_replies', 'user_id', true),
      helpRequests: await deleteRowsForRemovedUsers(client, 'help_requests', 'user_id', true),
      studentSkills: await deleteRowsForRemovedUsers(client, 'student_skills'),
      stressRecords: await deleteRowsForRemovedUsers(client, 'stress_records'),
      moodRecords: await deleteRowsForRemovedUsers(client, 'mood_records'),
      lostFoundItems: await deleteRowsForRemovedUsers(client, 'lost_found_items', 'user_id', true),
      userProfiles: await deleteRowsForRemovedUsers(client, 'user_profiles')
    };

    const usersResult = await client.query<{ row_count: number }>(
      `WITH deleted_users AS (
         DELETE FROM users
         WHERE LOWER(email) <> ALL($1::text[])
         RETURNING id
       )
       SELECT COUNT(*)::int AS row_count FROM deleted_users`,
      [requiredUsers.map((user) => user.email)]
    );

    const remainingResult = await client.query<{
      full_name: string;
      email: string;
      role: string;
    }>(
      `SELECT full_name, email, role
       FROM users
       ORDER BY
         CASE role WHEN 'admin' THEN 1 WHEN 'student' THEN 2 WHEN 'mentor' THEN 3 ELSE 4 END,
         email`
    );

    await client.query('COMMIT');

    console.log('CampusCare production demo user cleanup completed.');
    console.log(`Removed users: ${usersResult.rows[0]?.row_count ?? 0}`);
    console.log(`Removed related rows: ${JSON.stringify(deleted)}`);
    console.log('Remaining users:');
    for (const user of remainingResult.rows) {
      console.log(`- ${user.full_name} <${user.email}> (${user.role})`);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

try {
  await cleanupDemoUsers();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Unable to clean CampusCare demo users: ${message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
