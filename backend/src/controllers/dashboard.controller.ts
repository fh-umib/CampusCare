import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const dashboardController = {
  stats: async (request: Request, response: Response) => {
    const data = await dashboardService.stats(request.currentUser);
    successResponse(response, 'Dashboard statistics retrieved', data);
  }
};
