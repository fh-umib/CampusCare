export const userRepository = {
  createPlaceholder: async (payload: unknown) => ({
    message: 'User repository placeholder',
    payload
  }),

  findByEmail: async (_email: string) => null
};

