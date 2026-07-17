import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { logger } from '../utils/logger.js';

export const requestContext: RequestHandler = (request, response, next) => {
  const incomingId = request.header('x-request-id');
  const requestId = incomingId && /^[A-Za-z0-9._-]{1,100}$/.test(incomingId) ? incomingId : randomUUID();
  const startedAt = performance.now();
  request.requestId = requestId;
  response.setHeader('x-request-id', requestId);

  response.on('finish', () => {
    logger.info('http_request', {
      requestId,
      method: request.method,
      route: request.originalUrl.split('?')[0],
      status: response.statusCode,
      durationMs: Math.round(performance.now() - startedAt)
    });
  });
  next();
};
