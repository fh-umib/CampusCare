import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';

export const authController = {
  register: async (request: Request, response: Response) => {
    const result = await authService.register(request.body);
    response.status(201).json(result);
  },

  login: async (request: Request, response: Response) => {
    const result = await authService.login(request.body);
    response.json(result);
  }
};

