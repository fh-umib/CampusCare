import { Router } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const profileRoutes = Router();

profileRoutes.get('/', authenticate, asyncHandler(profileController.getCurrentProfile));
profileRoutes.patch('/', authenticate, asyncHandler(profileController.updateCurrentProfile));
profileRoutes.post('/onboarding', authenticate, asyncHandler(profileController.completeOnboarding));
