import { Router } from 'express';
import { stressController } from '../controllers/stress.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const stressRoutes = Router();

stressRoutes.use(authenticate);
stressRoutes.get('/', asyncHandler(stressController.list));
stressRoutes.post('/', asyncHandler(stressController.create));
stressRoutes.get('/summary', asyncHandler(stressController.summary));
