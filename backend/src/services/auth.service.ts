import { userRepository } from '../repositories/user.repository.js';

export const authService = {
  register: async (payload: unknown) => {
    return userRepository.createPlaceholder(payload);
  },

  login: async (payload: unknown) => {
    return { message: 'Login service placeholder', payload };
  }
};

