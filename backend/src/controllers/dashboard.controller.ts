import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const dashboardController = {
  ready: async (_request: Request, response: Response) => {
    const data = await dashboardService.ready();
    successResponse(response, 'Dashboard module is ready', data);
  }
};
