import { readFile } from 'node:fs/promises';
import { pool } from '../config/database.js';

const migrationFiles = [
  '001_init_users.sql',
  '002_init_modules.sql',
  '004_user_profiles_and_engagement.sql',
  '006_notifications.sql',
  '007_ai_study_assistant.sql',
  '008_realtime_support_chat.sql'
];

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run database migrations.');
  }

  const client = await pool.connect();

  try {
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    for (const fileName of migrationFiles) {
      const applied = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [fileName]);
      if (applied.rowCount) {
        console.log(`Skipping applied migration: ${fileName}`);
        continue;
      }
      const migrationUrl = new URL(`./${fileName}`, import.meta.url);
      const sql = await readFile(migrationUrl, 'utf8');
      console.log(`Running migration: ${fileName}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [fileName]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
      console.log(`Migration completed: ${fileName}`);
    }

    console.log('CampusCare database migrations completed successfully.');
  } finally {
    client.release();
  }
}

try {
  await runMigrations();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Unable to run CampusCare database migrations: ${message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
