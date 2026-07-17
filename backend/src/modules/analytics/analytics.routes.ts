import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorizeRoles.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { analyticsController } from './analytics.controller.js';

export const analyticsRoutes = Router();
analyticsRoutes.use(authenticate);
for (const role of ['student', 'mentor', 'admin'] as const) {
  analyticsRoutes.get(`/${role}/overview`, requireRole(role), asyncHandler(analyticsController.overview(role)));
}
