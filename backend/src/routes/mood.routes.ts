import { Router } from 'express';
import { moodController } from '../controllers/mood.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const moodRoutes = Router();

moodRoutes.use(authenticate);
moodRoutes.get('/', asyncHandler(moodController.list));
moodRoutes.post('/', asyncHandler(moodController.create));
moodRoutes.get('/summary', asyncHandler(moodController.summary));
