import { apiClient } from './apiClient';

export const skillService = {
  search: (skill?: string) => apiClient.get('/skills', { params: { skill } })
};

