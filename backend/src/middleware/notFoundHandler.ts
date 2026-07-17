import type { RequestHandler } from 'express';
import { AppError } from '../utils/httpError.js';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new AppError(404, 'API route not found', [], 'ROUTE_NOT_FOUND'));
};
