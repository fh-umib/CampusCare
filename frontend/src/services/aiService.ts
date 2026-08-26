import { apiClient, type ApiResponse } from './apiClient';
import type { AiConversation, AiMessage, AiMode } from '../types/ai';

export const aiService = {
  list: async () => (await apiClient.get<ApiResponse<AiConversation[]>>('/ai/conversations')).data.data,
  create: async (input: { title: string; mode: AiMode }) => (await apiClient.post<ApiResponse<AiConversation>>('/ai/conversations', input)).data.data,
  get: async (id: string) => (await apiClient.get<ApiResponse<{ conversation: AiConversation; messages: AiMessage[] }>>(`/ai/conversations/${id}`)).data.data,
  send: async (id: string, message: string, mode: AiMode, signal?: AbortSignal) => (await apiClient.post<ApiResponse<{ message: AiMessage['structured_content']; remainingToday: number }>>(`/ai/conversations/${id}/messages`, { message, mode }, { signal })).data.data,
  update: async (id: string, input: { title?: string; archived?: boolean }) => (await apiClient.patch<ApiResponse<AiConversation>>(`/ai/conversations/${id}`, input)).data.data,
  archive: async (id: string) => apiClient.delete(`/ai/conversations/${id}`)
};
