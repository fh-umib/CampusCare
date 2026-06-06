import { apiClient, type ApiResponse } from './apiClient';
import type { ProfilePayload, UserProfile } from '../types/profile';

export const profileService = {
  async getCurrentProfile() {
    const response = await apiClient.get<ApiResponse<UserProfile | null>>('/profile');
    return response.data.data;
  },

  async update(payload: ProfilePayload & { onboardingCompleted?: boolean }) {
    const response = await apiClient.patch<ApiResponse<UserProfile>>('/profile', payload);
    return response.data.data;
  },

  async completeOnboarding(payload: ProfilePayload) {
    const response = await apiClient.post<ApiResponse<UserProfile>>('/profile/onboarding', payload);
    return response.data.data;
  },

  async completeOnboardingWithToken(payload: ProfilePayload, token: string) {
    const response = await apiClient.post<ApiResponse<UserProfile>>('/profile/onboarding', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }
};
