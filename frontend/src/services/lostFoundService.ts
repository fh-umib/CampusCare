import { apiClient } from './apiClient';

export const lostFoundService = {
  list: () => apiClient.get('/lost-found')
};

