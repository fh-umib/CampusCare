export const skillRepository = {
  search: async (skill: string) => ({
    message: 'Skill search repository placeholder',
    skill,
    results: []
  }),

  createPlaceholder: async (payload: unknown) => ({
    message: 'Skill repository placeholder',
    payload
  })
};

