export type DashboardStats = {
  totalUsers: number;
  totalHelpRequests: number;
  openHelpRequests: number;
  totalSkills: number;
  totalStressRecords: number;
  averageStressLevel: number;
  moodCounts: Record<string, number>;
  lostFoundOpen: number;
  lostFoundResolved: number;
  recentActivity: Array<{
    type: string;
    title: string;
    createdAt: string;
  }>;
};

