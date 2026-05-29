export const dashboardService = {
  ready: async () => ({
    modules: ['helpRequests', 'skills', 'stress', 'mood', 'lostFound'],
    statisticsReady: false
  })
};
