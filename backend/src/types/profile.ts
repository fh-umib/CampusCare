export type UserProfile = {
  id: string;
  userId: string;
  studyYear: string | null;
  department: string | null;
  reasonForJoining: string | null;
  supportInterest: string | null;
  expertiseAreas: string | null;
  canHelpWith: string | null;
  availability: string | null;
  mentoringReason: string | null;
  preferredSupportType: string | null;
  adminPosition: string | null;
  adminDepartmentUnit: string | null;
  adminAccessReason: string | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserProfileRow = {
  id: string;
  user_id: string;
  study_year: string | null;
  department: string | null;
  reason_for_joining: string | null;
  support_interest: string | null;
  expertise_areas: string | null;
  can_help_with: string | null;
  availability: string | null;
  mentoring_reason: string | null;
  preferred_support_type: string | null;
  admin_position: string | null;
  admin_department_unit: string | null;
  admin_access_reason: string | null;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
};

export type UserProfileInput = Partial<
  Pick<
    UserProfile,
    | 'studyYear'
    | 'department'
    | 'reasonForJoining'
    | 'supportInterest'
    | 'expertiseAreas'
    | 'canHelpWith'
    | 'availability'
    | 'mentoringReason'
    | 'preferredSupportType'
    | 'adminPosition'
    | 'adminDepartmentUnit'
    | 'adminAccessReason'
  >
> & {
  onboardingCompleted?: boolean;
};
