import type { Request, Response } from 'express';
import { lostFoundService } from '../services/lostFound.service.js';

export const lostFoundController = {
  list: async (_request: Request, response: Response) => {
    response.json(await lostFoundService.list());
  },

  create: async (request: Request, response: Response) => {
    response.status(201).json(await lostFoundService.create(request.body));
  }
};

