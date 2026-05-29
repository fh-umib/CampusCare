import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  response.status(500).json({
    message: 'Internal server error',
    detail: error instanceof Error ? error.message : 'Unknown error'
  });
};

