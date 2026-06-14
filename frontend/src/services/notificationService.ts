import { apiClient, type ApiResponse } from './apiClient';
import type { Notification } from '../types/notification';

export const notificationService = {
  async list() {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
    return response.data.data;
  },

  async markAsRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await apiClient.patch('/notifications/read-all');
  }
};

