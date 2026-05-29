export const tokenUtils = {
  sign: (_payload: unknown) => {
    throw new Error('JWT signing will be implemented in Phase 2');
  },

  verify: (_token: string) => {
    throw new Error('JWT verification will be implemented in Phase 2');
  }
};

