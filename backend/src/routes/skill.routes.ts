import { Router } from 'express';
import { skillController } from '../controllers/skill.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const skillRoutes = Router();
skillRoutes.use(authenticate);

skillRoutes.get('/', asyncHandler(skillController.list));
skillRoutes.post('/', asyncHandler(skillController.create));
skillRoutes.get('/students', asyncHandler(skillController.students));
skillRoutes.post('/my-skills', asyncHandler(skillController.attachMySkill));
skillRoutes.get('/my-skills', asyncHandler(skillController.getMySkills));
skillRoutes.delete('/my-skills/:skillId', asyncHandler(skillController.removeMySkill));
