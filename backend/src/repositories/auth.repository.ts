import { queryDatabase } from '../config/database.js';
import type { User, UserRow } from '../types/user.js';
import type { UserRole } from '../types/roles.js';

function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const authRepository = {
  createUser: async (input: {
    fullName: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }) => {
    const result = await queryDatabase<UserRow>(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, password_hash, role, created_at, updated_at`,
      [input.fullName, input.email, input.passwordHash, input.role]
    );

    return mapUserRow(result.rows[0]);
  },

  findByEmail: async (email: string) => {
    const result = await queryDatabase<UserRow>(
      `SELECT id, full_name, email, password_hash, role, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  },

  findById: async (id: string) => {
    const result = await queryDatabase<UserRow>(
      `SELECT id, full_name, email, password_hash, role, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }
};
