import { Router } from 'express';
import { stressController } from '../controllers/stress.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const stressRoutes = Router();

stressRoutes.use(authenticate);
stressRoutes.get('/', stressController.list);
stressRoutes.post('/', stressController.create);

