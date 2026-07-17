import type { PublicUser } from '../types/user.js';
import type { UserProfileInput } from '../types/profile.js';
import { profileRepository } from '../repositories/profile.repository.js';
import { requireCurrentUser, optionalString, requireObject } from '../utils/moduleValidation.js';

function readProfileInput(payload: unknown, completeOnboarding: boolean): UserProfileInput {
  const data = requireObject(payload);

  return {
    studyYear: optionalString(data.studyYear, 'studyYear', 50),
    department: optionalString(data.department, 'department', 150),
    reasonForJoining: optionalString(data.reasonForJoining, 'reasonForJoining', 1000),
    supportInterest: optionalString(data.supportInterest, 'supportInterest', 100),
    expertiseAreas: optionalString(data.expertiseAreas, 'expertiseAreas', 1000),
    canHelpWith: optionalString(data.canHelpWith, 'canHelpWith', 1000),
    availability: optionalString(data.availability, 'availability', 100),
    mentoringReason: optionalString(data.mentoringReason, 'mentoringReason', 1000),
    preferredSupportType: optionalString(data.preferredSupportType, 'preferredSupportType', 100),
    adminPosition: optionalString(data.adminPosition, 'adminPosition', 150),
    adminDepartmentUnit: optionalString(data.adminDepartmentUnit, 'adminDepartmentUnit', 150),
    adminAccessReason: optionalString(data.adminAccessReason, 'adminAccessReason', 1000),
    onboardingCompleted: completeOnboarding
  };
}

export const profileService = {
  getCurrentProfile: async (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return profileRepository.findByUserId(user.id);
  },

  updateCurrentProfile: async (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const input = readProfileInput(payload, Boolean((payload as { onboardingCompleted?: unknown })?.onboardingCompleted));
    return profileRepository.upsert(user.id, input);
  },

  completeOnboarding: async (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const input = readProfileInput(payload, true);
    return profileRepository.upsert(user.id, input);
  }
};
