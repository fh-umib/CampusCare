import { skillRepository } from '../repositories/skill.repository.js';

export const skillService = {
  ready: () => skillRepository.ready()
};
