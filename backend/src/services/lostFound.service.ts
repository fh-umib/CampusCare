import { lostFoundRepository } from '../repositories/lostFound.repository.js';

export const lostFoundService = {
  ready: () => lostFoundRepository.ready()
};
