import { Router } from 'express';
import { skillController } from '../controllers/skill.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const skillRoutes = Router();

skillRoutes.get('/', asyncHandler(skillController.ready));
