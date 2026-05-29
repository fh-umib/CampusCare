import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRoutes } from './routes/index.js';

export const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'campuscare-api' });
});

app.use('/api', apiRoutes);
app.use(errorHandler);

