export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors: unknown[] = [],
    public readonly code = statusCode === 400 ? 'VALIDATION_ERROR' : `HTTP_${statusCode}`
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const HttpError = AppError;
