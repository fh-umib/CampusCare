import { Router } from 'express';
import { lostFoundController } from '../controllers/lostFound.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const lostFoundRoutes = Router();

lostFoundRoutes.get('/', asyncHandler(lostFoundController.list));
lostFoundRoutes.get('/:id', asyncHandler(lostFoundController.getById));
lostFoundRoutes.post('/', authenticate, asyncHandler(lostFoundController.create));
lostFoundRoutes.patch('/:id/status', authenticate, asyncHandler(lostFoundController.updateStatus));
