import { moodRepository } from '../repositories/mood.repository.js';

export const moodService = {
  list: () => moodRepository.findAll(),
  create: (payload: unknown) => moodRepository.createPlaceholder(payload)
};

