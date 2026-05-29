import { Router } from 'express';
import { helpRequestController } from '../controllers/helpRequest.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorizeRoles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const helpRequestRoutes = Router();

helpRequestRoutes.get('/', asyncHandler(helpRequestController.list));
helpRequestRoutes.get('/:id', asyncHandler(helpRequestController.getById));
helpRequestRoutes.post('/', authenticate, asyncHandler(helpRequestController.create));
helpRequestRoutes.post('/:id/replies', authenticate, asyncHandler(helpRequestController.reply));
helpRequestRoutes.patch(
  '/:id/status',
  authenticate,
  requireRole('mentor', 'admin'),
  asyncHandler(helpRequestController.updateStatus)
);
