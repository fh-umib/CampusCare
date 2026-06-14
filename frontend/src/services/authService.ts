import { apiClient, clearStoredToken, type ApiResponse } from './apiClient';
import type {
  AuthResult,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload
} from '../types/auth';

export const authService = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post<ApiResponse<AuthResult>>('/auth/login', payload);
    return response.data.data;
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient.post<ApiResponse<AuthResult>>('/auth/register', payload);
    return response.data.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const response = await apiClient.post<ApiResponse<{ prepared: boolean }>>('/auth/forgot-password', payload);
    return response.data.message;
  },

  async getCurrentUser() {
    const response = await apiClient.get<ApiResponse<{ user: AuthUser }>>('/auth/me');
    return response.data.data.user;
  },

  logout() {
    clearStoredToken();
  }
};
