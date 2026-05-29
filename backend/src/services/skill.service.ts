import { skillRepository } from '../repositories/skill.repository.js';

export const skillService = {
  search: (skill: string) => skillRepository.search(skill),
  addSkill: (payload: unknown) => skillRepository.createPlaceholder(payload)
};

