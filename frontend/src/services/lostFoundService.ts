import { apiClient, type ApiResponse } from './apiClient';
import type { LostFoundItem, LostFoundItemType, LostFoundStatus } from '../types/lostFound';

export const lostFoundService = {
  async list(filters?: { item_type?: LostFoundItemType | ''; status?: LostFoundStatus | '' }) {
    const response = await apiClient.get<ApiResponse<LostFoundItem[]>>('/lost-found', { params: filters });
    return response.data.data;
  },

  async create(payload: {
    title: string;
    description: string;
    location?: string;
    item_type: LostFoundItemType;
    item_date?: string;
  }) {
    const response = await apiClient.post<ApiResponse<LostFoundItem>>('/lost-found', payload);
    return response.data.data;
  },

  async updateStatus(id: string, status: LostFoundStatus) {
    const response = await apiClient.patch<ApiResponse<LostFoundItem>>(`/lost-found/${id}/status`, { status });
    return response.data.data;
  }
};

