import cors, { type CorsOptions } from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { apiRoutes } from './routes/index.js';
import { AppError } from './utils/httpError.js';
import { requestContext } from './middleware/requestContext.js';
import { successResponse } from './utils/apiResponse.js';

export const app = express();

const allowedOrigins = new Set(
  [
    env.frontendUrl,
    ...(env.nodeEnv === 'development' ? ['http://localhost:5173'] : [])
  ]
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean)
);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
      callback(null, true);
      return;
    }

    callback(new AppError(403, 'Origin is not allowed by CampusCare CORS policy.'));
  }
};

app.use(cors(corsOptions));
app.use(requestContext);
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_request, response) => successResponse(response, 'CampusCare API is running', { status: 'ok' }));

app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
