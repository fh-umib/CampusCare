import { Router } from 'express';
import { skillController } from '../controllers/skill.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const skillRoutes = Router();

skillRoutes.use(authenticate);
skillRoutes.get('/', skillController.search);
skillRoutes.post('/', skillController.addSkill);

