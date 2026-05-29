import type { Request, Response } from 'express';
import { moodService } from '../services/mood.service.js';

export const moodController = {
  list: async (_request: Request, response: Response) => {
    response.json(await moodService.list());
  },

  create: async (request: Request, response: Response) => {
    response.status(201).json(await moodService.create(request.body));
  }
};

