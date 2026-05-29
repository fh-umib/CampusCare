import { Router } from 'express';
import { skillController } from '../controllers/skill.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const skillRoutes = Router();

skillRoutes.get('/', asyncHandler(skillController.list));
skillRoutes.post('/', authenticate, asyncHandler(skillController.create));
skillRoutes.get('/students', asyncHandler(skillController.students));
skillRoutes.post('/my-skills', authenticate, asyncHandler(skillController.attachMySkill));
skillRoutes.get('/my-skills', authenticate, asyncHandler(skillController.getMySkills));
skillRoutes.delete('/my-skills/:skillId', authenticate, asyncHandler(skillController.removeMySkill));
