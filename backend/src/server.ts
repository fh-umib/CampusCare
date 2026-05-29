import { app } from './app.js';
import { testDatabaseConnection } from './config/database.js';
import { env } from './config/env.js';

async function startServer() {
  await testDatabaseConnection();

  app.listen(env.port, () => {
    console.log(`CampusCare API listening on port ${env.port}`);
  });
}

void startServer();
