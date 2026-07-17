import dotenv from 'dotenv';

dotenv.config();

type NodeEnvironment = 'development' | 'test' | 'production';

function readNodeEnvironment(): NodeEnvironment {
  const value = process.env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'production'].includes(value)) {
    throw new Error('Invalid NODE_ENV. Expected development, test, or production.');
  }
  return value as NodeEnvironment;
}

function readPort() {
  const value = Number(process.env.PORT ?? 5000);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error('Invalid PORT. Expected an integer between 1 and 65535.');
  }
  return value;
}

const nodeEnv = readNodeEnvironment();

function requiredInProduction(name: 'DATABASE_URL' | 'JWT_SECRET' | 'FRONTEND_URL', fallback = '') {
  const value = process.env[name]?.trim() || fallback;
  if (nodeEnv === 'production' && !value) {
    throw new Error(`Missing required production environment variable: ${name}`);
  }
  return value;
}

const jwtSecret = requiredInProduction('JWT_SECRET');
if (nodeEnv === 'production' && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters in production.');
}

export const env = Object.freeze({
  port: readPort(),
  nodeEnv,
  databaseUrl: requiredInProduction('DATABASE_URL'),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '7d',
  frontendUrl: requiredInProduction(
    'FRONTEND_URL',
    process.env.CLIENT_URL?.trim() || (nodeEnv === 'production' ? '' : 'http://localhost:5173')
  ),
  openAiApiKey: process.env.OPENAI_API_KEY?.trim(),
  redisUrl: process.env.REDIS_URL?.trim(),
  sentryDsn: process.env.SENTRY_DSN?.trim()
});
