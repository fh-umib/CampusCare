import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const authController = {
  register: async (request: Request, response: Response) => {
    const result = await authService.register(request.body);
    successResponse(response, 'Registration successful', result, 201);
  },

  login: async (request: Request, response: Response) => {
    const result = await authService.login(request.body);
    successResponse(response, 'Login successful', result);
  },

  forgotPassword: async (request: Request, response: Response) => {
    await authService.forgotPassword(request.body);
    successResponse(response, 'If this account exists, password recovery has been prepared.');
  },

  me: async (request: Request, response: Response) => {
    const user = request.currentUser;
    successResponse(response, 'Current user retrieved', { user });
  }
};
