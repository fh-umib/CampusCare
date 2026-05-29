import { apiClient } from './apiClient';

export const moodService = {
  list: () => apiClient.get('/moods')
};

