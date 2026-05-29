import { lostFoundRepository } from '../repositories/lostFound.repository.js';

export const lostFoundService = {
  list: () => lostFoundRepository.findAll(),
  create: (payload: unknown) => lostFoundRepository.createPlaceholder(payload)
};

