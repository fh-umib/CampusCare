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
  getAdminSecurity:async(userId:string)=>(await queryDatabase<{admin_2fa_enabled:boolean;admin_totp_secret_encrypted:string|null;admin_totp_pending_encrypted:string|null}>('SELECT admin_2fa_enabled,admin_totp_secret_encrypted,admin_totp_pending_encrypted FROM users WHERE id=$1 AND role=\'admin\'',[userId])).rows[0]??null,
  setPendingTotp:(userId:string,value:string)=>queryDatabase('UPDATE users SET admin_totp_pending_encrypted=$2 WHERE id=$1 AND role=\'admin\'',[userId,value]),
  enableTotp:(userId:string)=>queryDatabase('UPDATE users SET admin_2fa_enabled=TRUE,admin_totp_secret_encrypted=admin_totp_pending_encrypted,admin_totp_pending_encrypted=NULL WHERE id=$1 AND role=\'admin\' AND admin_totp_pending_encrypted IS NOT NULL',[userId]),
  disableTotp:(userId:string)=>queryDatabase('UPDATE users SET admin_2fa_enabled=FALSE,admin_totp_secret_encrypted=NULL,admin_totp_pending_encrypted=NULL WHERE id=$1 AND role=\'admin\'',[userId]),
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
