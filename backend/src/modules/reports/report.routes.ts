import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorizeRoles.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { reportController } from './report.controller.js';

export const reportRoutes = Router();
reportRoutes.use(authenticate);
for (const role of ['student', 'mentor', 'admin'] as const) {
  for (const cadence of ['weekly', 'monthly'] as const) {
    reportRoutes.get(`/${role}/${cadence}`, requireRole(role), asyncHandler(reportController.json(role, cadence)));
    reportRoutes.get(`/${role}/${cadence}/pdf`, requireRole(role), asyncHandler(reportController.pdf(role, cadence)));
  }
}
