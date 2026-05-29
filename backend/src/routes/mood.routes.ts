import { Router } from 'express';
import { moodController } from '../controllers/mood.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const moodRoutes = Router();

moodRoutes.use(authenticate);
moodRoutes.get('/', moodController.list);
moodRoutes.post('/', moodController.create);

