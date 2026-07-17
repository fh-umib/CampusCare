import type { Request, Response } from 'express';
import type { AnalyticsRole } from './analytics.types.js';
import { resolveDateRange } from './analytics.validation.js';
import { analyticsService } from './analytics.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const analyticsController = {
  overview: (role: AnalyticsRole) => async (request: Request, response: Response) => {
    const data = await analyticsService.overview(role, resolveDateRange(request.query), request.currentUser);
    successResponse(response, `${role} analytics retrieved`, data);
  }
};
