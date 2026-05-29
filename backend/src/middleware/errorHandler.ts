import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/httpError.js';
import { errorResponse } from '../utils/apiResponse.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;

  if (error instanceof AppError) {
    errorResponse(response, error.message, error.errors, error.statusCode);
    return;
  }

  const message = error instanceof Error ? error.message : 'Internal server error';
  errorResponse(response, message, [], 500);
};
