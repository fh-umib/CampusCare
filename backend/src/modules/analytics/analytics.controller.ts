import type { Request, Response } from 'express';
import type { AnalyticsRole } from './analytics.types.js';
import { resolveDateRange } from './analytics.validation.js';
import { analyticsService } from './analytics.service.js';
import { successResponse } from '../../utils/apiResponse.js';
import { auditService } from '../security/audit.service.js';

export const analyticsController = {
  overview: (role: AnalyticsRole) => async (request: Request, response: Response) => {
    const data = await analyticsService.overview(role, resolveDateRange(request.query), request.currentUser);
    if (role === 'admin') await auditService.record({ actor: request.currentUser, action: 'admin_viewed_platform_analytics', entityType: 'analytics' });
    successResponse(response, `${role} analytics retrieved`, data);
  }
};
