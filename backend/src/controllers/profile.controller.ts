import type { Request, Response } from 'express';
import { profileService } from '../services/profile.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const profileController = {
  getCurrentProfile: async (request: Request, response: Response) => {
    const data = await profileService.getCurrentProfile(request.currentUser);
    successResponse(response, 'Profile retrieved', data);
  },

  updateCurrentProfile: async (request: Request, response: Response) => {
    const data = await profileService.updateCurrentProfile(request.body, request.currentUser);
    successResponse(response, 'Profile updated', data);
  },

  completeOnboarding: async (request: Request, response: Response) => {
    const data = await profileService.completeOnboarding(request.body, request.currentUser);
    successResponse(response, 'Onboarding saved', data, 201);
  }
};
