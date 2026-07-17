import { app } from './app.js';
import { testDatabaseConnection } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function startServer() {
  await testDatabaseConnection();

  app.listen(env.port, () => {
    logger.info('server_started', { port: env.port, environment: env.nodeEnv });
  });
}

void startServer();
