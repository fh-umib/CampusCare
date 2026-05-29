import { apiClient } from './apiClient';

export const stressService = {
  list: () => apiClient.get('/stress-records')
};

