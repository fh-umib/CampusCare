import type { Request, Response } from 'express';
import { notificationService } from '../services/notification.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const notificationController = {
  list: async (request: Request, response: Response) => {
    const data = await notificationService.list(request.currentUser);
    successResponse(response, 'Notifications retrieved', data);
  },

  markAsRead: async (request: Request, response: Response) => {
    await notificationService.markAsRead(request.params.id, request.currentUser);
    successResponse(response, 'Notification marked as read');
  },

  markAllAsRead: async (request: Request, response: Response) => {
    await notificationService.markAllAsRead(request.currentUser);
    successResponse(response, 'Notifications marked as read');
  }
};

