import type { Request, Response } from 'express';
import { moodService } from '../services/mood.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const moodController = {
  ready: async (_request: Request, response: Response) => {
    const data = await moodService.ready();
    successResponse(response, 'Mood module is ready', data);
  }
};
