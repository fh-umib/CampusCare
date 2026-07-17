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
    databaseStatus = 'disconnected';
    logDatabaseError(error);
    throw new AppError(503, 'Database is currently unavailable');
  }
}
