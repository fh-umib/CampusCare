import bcrypt from 'bcrypt';

const saltRounds = 12;

export const passwordUtils = {
  hash: async (plainTextPassword: string) => {
    return bcrypt.hash(plainTextPassword, saltRounds);
  },

  compare: async (plainTextPassword: string, passwordHash: string) => {
    return bcrypt.compare(plainTextPassword, passwordHash);
  }
};
