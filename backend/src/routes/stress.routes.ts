import { Router } from 'express';
import { stressController } from '../controllers/stress.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const stressRoutes = Router();

stressRoutes.get('/', asyncHandler(stressController.ready));
