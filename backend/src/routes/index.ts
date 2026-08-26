import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { helpRequestRoutes } from './helpRequest.routes.js';
import { lostFoundRoutes } from './lostFound.routes.js';
import { moodRoutes } from './mood.routes.js';
import { notificationRoutes } from './notification.routes.js';
import { profileRoutes } from './profile.routes.js';
import { skillRoutes } from './skill.routes.js';
import { stressRoutes } from './stress.routes.js';
import { getDatabaseStatus } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { analyticsRoutes } from '../modules/analytics/analytics.routes.js';
import { reportRoutes } from '../modules/reports/report.routes.js';
import { aiRoutes } from '../modules/ai/ai.routes.js';

export const apiRoutes = Router();

apiRoutes.get('/health', (_request, response) => {
  successResponse(response, 'CampusCare API is running', { status: 'ok' });
});

apiRoutes.get('/ready', (_request, response) => {
  if (getDatabaseStatus() !== 'connected') {
    errorResponse(response, 'CampusCare API is not ready', [], 503, 'SERVICE_NOT_READY');
    return;
  }
  successResponse(response, 'CampusCare API is ready', { status: 'ready' });
});

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/dashboard', dashboardRoutes);
apiRoutes.use('/help-requests', helpRequestRoutes);
apiRoutes.use('/skills', skillRoutes);
apiRoutes.use('/stress', stressRoutes);
apiRoutes.use('/mood', moodRoutes);
apiRoutes.use('/notifications', notificationRoutes);
apiRoutes.use('/lost-found', lostFoundRoutes);
apiRoutes.use('/profile', profileRoutes);
apiRoutes.use('/analytics', analyticsRoutes);
apiRoutes.use('/reports', reportRoutes);
apiRoutes.use('/ai', aiRoutes);
