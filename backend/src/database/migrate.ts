import { readFile } from 'node:fs/promises';
import { pool } from '../config/database.js';

const migrationFiles = [
  '001_init_users.sql',
  '002_init_modules.sql',
  '004_user_profiles_and_engagement.sql',
  '006_notifications.sql'
];

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run database migrations.');
  }

  const client = await pool.connect();

  try {
    for (const fileName of migrationFiles) {
      const migrationUrl = new URL(`./${fileName}`, import.meta.url);
      const sql = await readFile(migrationUrl, 'utf8');
      console.log(`Running migration: ${fileName}`);
      await client.query(sql);
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
