import type { Response } from 'express';

export function successResponse<TData>(
  response: Response,
  message: string,
  data?: TData,
  statusCode = 200
) {
  const body: {
    success: true;
    message: string;
    data?: TData;
  } = {
    success: true,
    message
  };

  if (data !== undefined) {
    body.data = data;
  }

  return response.status(statusCode).json(body);
}

export function errorResponse(
  response: Response,
  message: string,
  errors: unknown[] = [],
  statusCode = 500,
  code = 'INTERNAL_ERROR'
) {
  return response.status(statusCode).json({
    success: false,
    message,
    code,
    errors
  });
}
