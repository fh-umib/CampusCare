import { Router } from 'express';
import { helpRequestController } from '../controllers/helpRequest.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const helpRequestRoutes = Router();

helpRequestRoutes.use(authenticate);
helpRequestRoutes.get('/', helpRequestController.list);
helpRequestRoutes.post('/', helpRequestController.create);

