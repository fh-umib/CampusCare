import { Router } from 'express';
import { lostFoundController } from '../controllers/lostFound.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const lostFoundRoutes = Router();

lostFoundRoutes.get('/', asyncHandler(lostFoundController.ready));
