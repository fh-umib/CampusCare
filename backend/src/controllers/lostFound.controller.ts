import type { Request, Response } from 'express';
import { lostFoundService } from '../services/lostFound.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const lostFoundController = {
  ready: async (_request: Request, response: Response) => {
    const data = await lostFoundService.ready();
    successResponse(response, 'Lost & Found module is ready', data);
  }
};
