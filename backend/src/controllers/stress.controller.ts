import type { Request, Response } from 'express';
import { stressService } from '../services/stress.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const stressController = {
  ready: async (_request: Request, response: Response) => {
    const data = await stressService.ready();
    successResponse(response, 'Stress module is ready', data);
  }
};
