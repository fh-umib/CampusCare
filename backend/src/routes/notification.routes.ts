import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);
notificationRoutes.get('/', asyncHandler(notificationController.list));
notificationRoutes.patch('/read-all', asyncHandler(notificationController.markAllAsRead));
notificationRoutes.patch('/:id/read', asyncHandler(notificationController.markAsRead));

