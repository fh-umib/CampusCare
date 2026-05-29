import { Router } from 'express';
import { moodController } from '../controllers/mood.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const moodRoutes = Router();

moodRoutes.get('/', asyncHandler(moodController.ready));
