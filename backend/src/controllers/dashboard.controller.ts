import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';

export const dashboardController = {
  stats: async (_request: Request, response: Response) => {
    response.json(await dashboardService.stats());
  }
};

