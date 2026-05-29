import { skillRepository } from '../repositories/skill.repository.js';
import type { SkillAvailability, SkillLevel } from '../types/skill.js';
import type { PublicUser } from '../types/user.js';
import { AppError } from '../utils/httpError.js';
import {
  optionalEnum,
  optionalString,
  requireCurrentUser,
  requireString
} from '../utils/moduleValidation.js';

const skillLevels = ['beginner', 'intermediate', 'advanced'] as const satisfies readonly SkillLevel[];
const availabilityValues = [
  'available',
  'busy',
  'open_to_projects'
] as const satisfies readonly SkillAvailability[];

export const skillService = {
  list: () => skillRepository.findAll(),

  create: (payload: unknown, currentUser: PublicUser | undefined) => {
    requireCurrentUser(currentUser);
    const data = payload as Record<string, unknown>;

    return skillRepository.create({
      name: requireString(data.name, 'name', 80),
      category: optionalString(data.category, 'category', 80)
    });
  },

  getStudentCards: (query: Record<string, unknown>) => {
    const skill = typeof query.skill === 'string' && query.skill.trim() ? query.skill.trim() : undefined;
    return skillRepository.findStudentCards(skill);
  },

  attachMySkill: async (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const data = payload as Record<string, unknown>;
    const skillId = requireString(data.skillId, 'skillId');
    const skill = await skillRepository.findById(skillId);

    if (!skill) {
      throw new AppError(404, 'Skill not found');
    }

    return skillRepository.attachToUser({
      userId: user.id,
      skillId,
      level: optionalEnum(data.level, skillLevels, 'level') ?? 'beginner',
      availability: optionalEnum(data.availability, availabilityValues, 'availability') ?? 'available'
    });
  },

  getMySkills: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return skillRepository.findUserSkills(user.id);
  },

  removeMySkill: async (skillId: string, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const removed = await skillRepository.removeFromUser(user.id, skillId);

    if (!removed) {
      throw new AppError(404, 'Skill is not attached to current user');
    }

    return { skillId };
  }
};
