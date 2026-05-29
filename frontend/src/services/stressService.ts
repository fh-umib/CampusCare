import { apiClient, type ApiResponse } from './apiClient';
import type { StressRecord, StressSummary } from '../types/stress';

export const stressService = {
  async list() {
    const response = await apiClient.get<ApiResponse<StressRecord[]>>('/stress');
    return response.data.data;
  },

  async create(payload: { subject?: string; stress_level: number; note?: string }) {
    const response = await apiClient.post<ApiResponse<StressRecord>>('/stress', payload);
    return response.data.data;
  },

  async summary() {
    const response = await apiClient.get<ApiResponse<StressSummary[]>>('/stress/summary');
    return response.data.data;
  }
};

