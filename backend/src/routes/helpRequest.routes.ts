import { Router } from 'express';
import { helpRequestController } from '../controllers/helpRequest.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const helpRequestRoutes = Router();

helpRequestRoutes.get('/', asyncHandler(helpRequestController.ready));
