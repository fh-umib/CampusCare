import type { Request, Response } from 'express';
import { stressService } from '../services/stress.service.js';

export const stressController = {
  list: async (_request: Request, response: Response) => {
    response.json(await stressService.list());
  },

  create: async (request: Request, response: Response) => {
    response.status(201).json(await stressService.create(request.body));
  }
};

