import { Router } from 'express';
import { helpRequestController } from '../controllers/helpRequest.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorizeRoles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const helpRequestRoutes = Router();
helpRequestRoutes.use(authenticate);

helpRequestRoutes.get('/', asyncHandler(helpRequestController.list));
helpRequestRoutes.get('/:id', asyncHandler(helpRequestController.getById));
helpRequestRoutes.post('/', asyncHandler(helpRequestController.create));
helpRequestRoutes.post('/:id/replies', asyncHandler(helpRequestController.reply));
helpRequestRoutes.patch(
  '/:id/status',
  requireRole('mentor', 'admin'),
  asyncHandler(helpRequestController.updateStatus)
);
