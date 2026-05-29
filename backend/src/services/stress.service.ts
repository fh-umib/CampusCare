import { stressRepository } from '../repositories/stress.repository.js';

export const stressService = {
  list: () => stressRepository.findAll(),
  create: (payload: unknown) => stressRepository.createPlaceholder(payload)
};

