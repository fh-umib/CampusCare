import { apiClient, type ApiResponse } from './apiClient';
import type { DashboardStats } from '../types/dashboard';

export const dashboardService = {
  async stats() {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data;
  }
};
