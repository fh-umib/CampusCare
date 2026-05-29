import { authRepository } from './auth.repository.js';

export const userRepository = {
  findByEmail: authRepository.findByEmail,
  findById: authRepository.findById
};
