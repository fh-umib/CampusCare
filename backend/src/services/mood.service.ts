import { moodRepository } from '../repositories/mood.repository.js';

export const moodService = {
  ready: () => moodRepository.ready()
};
