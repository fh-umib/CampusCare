import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/httpError.js';
import { errorResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  void _next;

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error('request_error', {
        requestId: request.requestId,
        route: request.originalUrl.split('?')[0],
        code: error.code,
        message: env.nodeEnv === 'development' ? (error.internalMessage ?? error.message) : error.message
      });
    }
    errorResponse(response, error.message, error.errors, error.statusCode, error.code);
    return;
  }

  logger.error('unhandled_error', {
    requestId: request.requestId,
    message: error instanceof Error ? error.message : 'Unknown error',
    ...(env.nodeEnv === 'development' && error instanceof Error ? { stack: error.stack } : {})
  });
  errorResponse(response, 'Internal server error', [], 500, 'INTERNAL_ERROR');
};
