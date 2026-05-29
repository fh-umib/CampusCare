export const lostFoundRepository = {
  findAll: async () => [],
  createPlaceholder: async (payload: unknown) => ({
    message: 'Lost and found repository placeholder',
    payload
  })
};

