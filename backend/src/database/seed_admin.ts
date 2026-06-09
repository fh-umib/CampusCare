import { pool } from '../config/database.js';
import { passwordUtils } from '../utils/password.js';

const admin = {
  fullName: 'Flutura Hyseni',
  email: 'fluturahysenni@gmail.com',
  password: '12345678'
};

async function seedAdmin() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to seed the admin account.');
  }

  const passwordHash = await passwordUtils.hash(admin.password);

  const result = await pool.query<{ id: string; email: string; role: string }>(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
     SET full_name = EXCLUDED.full_name,
         password_hash = EXCLUDED.password_hash,
         role = 'admin',
         updated_at = NOW()
     RETURNING id, email, role`,
    [admin.fullName, admin.email, passwordHash]
  );

  const user = result.rows[0];
  console.log(`Approved admin account is ready: ${user.email} (${user.role}).`);
}

try {
  await seedAdmin();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Unable to seed the approved admin account: ${message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
