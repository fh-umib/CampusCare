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
  createdAt: string;
  updatedAt: string;
};

export type ProfilePayload = Partial<
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
>;
