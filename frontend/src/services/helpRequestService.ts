import { apiClient } from './apiClient';

export const helpRequestService = {
  list: () => apiClient.get('/help-requests')
};

