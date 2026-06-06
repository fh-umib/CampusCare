import { queryDatabase } from '../config/database.js';
import type { UserProfileInput, UserProfileRow } from '../types/profile.js';

function mapProfile(row: UserProfileRow) {
  return {
    id: row.id,
    userId: row.user_id,
    studyYear: row.study_year,
    department: row.department,
    reasonForJoining: row.reason_for_joining,
    supportInterest: row.support_interest,
    expertiseAreas: row.expertise_areas,
    canHelpWith: row.can_help_with,
    availability: row.availability,
    mentoringReason: row.mentoring_reason,
    preferredSupportType: row.preferred_support_type,
    adminPosition: row.admin_position,
    adminDepartmentUnit: row.admin_department_unit,
    adminAccessReason: row.admin_access_reason,
    onboardingCompleted: row.onboarding_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const selectProfileColumns = `
  id, user_id, study_year, department, reason_for_joining, support_interest,
  expertise_areas, can_help_with, availability, mentoring_reason, preferred_support_type,
  admin_position, admin_department_unit, admin_access_reason, onboarding_completed,
  created_at, updated_at
`;

export const profileRepository = {
  findByUserId: async (userId: string) => {
    const result = await queryDatabase<UserProfileRow>(
      `SELECT ${selectProfileColumns}
       FROM user_profiles
       WHERE user_id = $1`,
      [userId]
    );

    return result.rows[0] ? mapProfile(result.rows[0]) : null;
  },

  upsert: async (userId: string, input: UserProfileInput) => {
    const result = await queryDatabase<UserProfileRow>(
      `INSERT INTO user_profiles (
        user_id, study_year, department, reason_for_joining, support_interest,
        expertise_areas, can_help_with, availability, mentoring_reason, preferred_support_type,
        admin_position, admin_department_unit, admin_access_reason, onboarding_completed
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (user_id)
       DO UPDATE SET
        study_year = COALESCE(EXCLUDED.study_year, user_profiles.study_year),
        department = COALESCE(EXCLUDED.department, user_profiles.department),
        reason_for_joining = COALESCE(EXCLUDED.reason_for_joining, user_profiles.reason_for_joining),
        support_interest = COALESCE(EXCLUDED.support_interest, user_profiles.support_interest),
        expertise_areas = COALESCE(EXCLUDED.expertise_areas, user_profiles.expertise_areas),
        can_help_with = COALESCE(EXCLUDED.can_help_with, user_profiles.can_help_with),
        availability = COALESCE(EXCLUDED.availability, user_profiles.availability),
        mentoring_reason = COALESCE(EXCLUDED.mentoring_reason, user_profiles.mentoring_reason),
        preferred_support_type = COALESCE(EXCLUDED.preferred_support_type, user_profiles.preferred_support_type),
        admin_position = COALESCE(EXCLUDED.admin_position, user_profiles.admin_position),
        admin_department_unit = COALESCE(EXCLUDED.admin_department_unit, user_profiles.admin_department_unit),
        admin_access_reason = COALESCE(EXCLUDED.admin_access_reason, user_profiles.admin_access_reason),
        onboarding_completed = EXCLUDED.onboarding_completed
       RETURNING ${selectProfileColumns}`,
      [
        userId,
        input.studyYear ?? null,
        input.department ?? null,
        input.reasonForJoining ?? null,
        input.supportInterest ?? null,
        input.expertiseAreas ?? null,
        input.canHelpWith ?? null,
        input.availability ?? null,
        input.mentoringReason ?? null,
        input.preferredSupportType ?? null,
        input.adminPosition ?? null,
        input.adminDepartmentUnit ?? null,
        input.adminAccessReason ?? null,
        input.onboardingCompleted ?? false
      ]
    );

    return mapProfile(result.rows[0]);
  }
};
