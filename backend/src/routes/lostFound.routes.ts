import { Router } from 'express';
import { lostFoundController } from '../controllers/lostFound.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const lostFoundRoutes = Router();

lostFoundRoutes.use(authenticate);
lostFoundRoutes.get('/', lostFoundController.list);
lostFoundRoutes.post('/', lostFoundController.create);

