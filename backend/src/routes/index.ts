import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { helpRequestRoutes } from './helpRequest.routes.js';
import { lostFoundRoutes } from './lostFound.routes.js';
import { moodRoutes } from './mood.routes.js';
import { skillRoutes } from './skill.routes.js';
import { stressRoutes } from './stress.routes.js';
import { getDatabaseStatus } from '../config/database.js';

export const apiRoutes = Router();

apiRoutes.get('/health', (_request, response) => {
  response.json({
    success: true,
    message: 'CampusCare API is running',
    database: getDatabaseStatus()
  });
});

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/dashboard', dashboardRoutes);
apiRoutes.use('/help-requests', helpRequestRoutes);
apiRoutes.use('/skills', skillRoutes);
apiRoutes.use('/stress', stressRoutes);
apiRoutes.use('/mood', moodRoutes);
apiRoutes.use('/lost-found', lostFoundRoutes);
