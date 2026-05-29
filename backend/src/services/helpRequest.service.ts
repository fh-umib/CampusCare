import { helpRequestRepository } from '../repositories/helpRequest.repository.js';

export const helpRequestService = {
  ready: () => helpRequestRepository.ready()
};
