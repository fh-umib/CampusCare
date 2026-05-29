import cors from 'cors';
import express from 'express';
import { getDatabaseStatus } from './config/database.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { apiRoutes } from './routes/index.js';

export const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({
    success: true,
    message: 'CampusCare API is running',
    database: getDatabaseStatus()
  });
});

app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
