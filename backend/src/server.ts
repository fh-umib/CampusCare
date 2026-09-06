import { app } from './app.js';
import { testDatabaseConnection } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { createServer } from 'node:http';
import { attachRealtimeServer } from './realtime/realtime.server.js';

async function startServer() {
  await testDatabaseConnection();

  const httpServer=createServer(app);
  attachRealtimeServer(httpServer);
  httpServer.listen(env.port, () => {
    logger.info('server_started', { port: env.port, environment: env.nodeEnv });
  });
}

void startServer();
