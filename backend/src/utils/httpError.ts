export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors: unknown[] = []
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const HttpError = AppError;
