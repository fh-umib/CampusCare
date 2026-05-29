import { helpRequestRepository } from '../repositories/helpRequest.repository.js';

export const helpRequestService = {
  list: () => helpRequestRepository.findAll(),
  create: (payload: unknown) => helpRequestRepository.createPlaceholder(payload)
};

