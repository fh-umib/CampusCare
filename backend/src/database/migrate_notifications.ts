import { readFile } from 'node:fs/promises';
import { pool } from '../config/database.js';

async function migrateNotifications() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run the notifications migration.');
  }

  const migrationUrl = new URL('./006_notifications.sql', import.meta.url);
  const sql = await readFile(migrationUrl, 'utf8');
  await pool.query(sql);
  console.log('Notifications migration applied successfully.');
}

try {
  await migrateNotifications();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Unable to apply notifications migration: ${message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}

