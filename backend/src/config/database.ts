import { Pool, type QueryResultRow } from 'pg';
import { env } from './env.js';
import { AppError } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';

export const pool = new Pool({
  connectionString: env.databaseUrl
});

export type DatabaseStatus = 'connected' | 'disconnected';

let databaseStatus: DatabaseStatus = 'disconnected';

pool.on('error', (error) => {
  databaseStatus = 'disconnected';
  logger.error('database_pool_error', env.nodeEnv === 'development' ? { message: error.message } : {});
});

function logDatabaseError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown database error';
  logger.error('database_connection_error', env.nodeEnv === 'development' ? { message } : {});
}

export function getDatabaseStatus() {
  return databaseStatus;
}

export async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    databaseStatus = 'connected';
    logger.info('database_connected');
    return true;
  } catch (error) {
    databaseStatus = 'disconnected';
    logDatabaseError(error);
    return false;
  }
}

export async function queryDatabase<T extends QueryResultRow>(sql: string, params: unknown[] = []) {
  try {
    const result = await pool.query<T>(sql, params);
    databaseStatus = 'connected';
    return result;
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    const eventsQuery = /\b(campus_events|event_teams|event_team_members|event_team_messages|event_interests)\b/.test(sql);
    if (eventsQuery && ['42P01', '42703'].includes(code)) {
      logger.error('events_schema_required', { code });
      throw new AppError(503, 'Hackathons & Events needs a database update. Ask an administrator to apply the pending events migrations.', [], 'EVENTS_SCHEMA_REQUIRED');
    }
    const unavailable = code.startsWith('08') || ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'].includes(code);
    if (unavailable) {
      databaseStatus = 'disconnected';
      logDatabaseError(error);
      throw new AppError(503, 'Database is currently unavailable', [], 'DATABASE_UNAVAILABLE');
    }
    const message = error instanceof Error ? error.message : 'Unknown query error';
    logger.error('database_query_error', env.nodeEnv === 'development' ? { code, message } : { code });
    throw new AppError(500, 'Unable to complete database request', [], 'DATABASE_QUERY_FAILED', message);
  }
}
