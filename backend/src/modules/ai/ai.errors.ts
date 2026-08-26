import { AppError } from '../../utils/httpError.js';
export const aiError = (status: number, code: string, message: string) => new AppError(status, message, [], code);
