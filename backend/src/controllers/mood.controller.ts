import type { Request, Response } from 'express';
import { moodService } from '../services/mood.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const moodController = {
  list: async (request: Request, response: Response) => {
    const data = await moodService.list(request.currentUser);
    successResponse(response, 'Mood records retrieved', data);
  },

  create: async (request: Request, response: Response) => {
    const data = await moodService.create(request.body, request.currentUser);
    successResponse(response, 'Mood record created', data, 201);
  },

  summary: async (request: Request, response: Response) => {
    const data = await moodService.summary(request.currentUser);
    successResponse(response, 'Mood summary retrieved', data);
  }
};
