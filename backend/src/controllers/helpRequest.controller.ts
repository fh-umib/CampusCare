import type { Request, Response } from 'express';
import { helpRequestService } from '../services/helpRequest.service.js';

export const helpRequestController = {
  list: async (_request: Request, response: Response) => {
    response.json(await helpRequestService.list());
  },

  create: async (request: Request, response: Response) => {
    response.status(201).json(await helpRequestService.create(request.body));
  }
};

