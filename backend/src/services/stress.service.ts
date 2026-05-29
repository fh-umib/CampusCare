import { stressRepository } from '../repositories/stress.repository.js';

export const stressService = {
  ready: () => stressRepository.ready()
};
