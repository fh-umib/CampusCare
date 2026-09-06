import { apiClient, type ApiResponse } from './apiClient';
import type { CreateHelpRequestPayload, HelpRequest, HelpRequestCategory, HelpRequestStatus } from '../types/helpRequest';

export const helpRequestService = {
  async list(filters?: { status?: HelpRequestStatus | ''; category?: HelpRequestCategory | '' }) {
    const response = await apiClient.get<ApiResponse<HelpRequest[]>>('/help-requests', { params: filters });
    return response.data.data;
  },

  async create(payload: CreateHelpRequestPayload) {
    const response = await apiClient.post<ApiResponse<HelpRequest>>('/help-requests', payload);
    return response.data.data;
  },

  async get(id: string) {
    const response = await apiClient.get<ApiResponse<HelpRequest>>(`/help-requests/${id}`);
    return response.data.data;
  },

  async reply(id: string, message: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(`/help-requests/${id}/replies`, { message });
    return response.data.data;
  },

  async updateStatus(id: string, status: HelpRequestStatus) {
    const response = await apiClient.patch<ApiResponse<HelpRequest>>(`/help-requests/${id}/status`, { status });
    return response.data.data;
  }
};
