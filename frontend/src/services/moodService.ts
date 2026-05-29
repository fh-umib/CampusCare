import { apiClient, type ApiResponse } from './apiClient';
import type { MoodRecord, MoodState, MoodSummary } from '../types/mood';

export const moodService = {
  async list() {
    const response = await apiClient.get<ApiResponse<MoodRecord[]>>('/mood');
    return response.data.data;
  },

  async create(payload: { mood: MoodState; note?: string }) {
    const response = await apiClient.post<ApiResponse<MoodRecord>>('/mood', payload);
    return response.data.data;
  },

  async summary() {
    const response = await apiClient.get<ApiResponse<MoodSummary[]>>('/mood/summary');
    return response.data.data;
  }
};

