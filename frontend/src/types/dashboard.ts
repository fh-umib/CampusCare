export type DashboardStats = {
  totalUsers: number;
  totalHelpRequests: number;
  openHelpRequests: number;
  totalSkills: number;
  totalStudentSkills?: number;
  totalStressRecords: number;
  averageStressLevel: number;
  moodCounts: Record<string, number>;
  totalMoodRecords?: number;
  totalLostFoundItems?: number;
  lostFoundOpen: number;
  lostFoundResolved: number;
  recentActivity: Array<{
    type: string;
    title: string;
    createdAt: string;
  }>;
};
