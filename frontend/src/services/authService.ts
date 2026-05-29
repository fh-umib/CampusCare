import { apiClient } from './apiClient';
import type { LoginPayload, RegisterPayload } from '../types/auth';

export const authService = {
  login: (payload: LoginPayload) => apiClient.post('/auth/login', payload),
  register: (payload: RegisterPayload) => apiClient.post('/auth/register', payload)
};

