export type StressLevel = 1 | 2 | 3 | 4 | 5;

export type StressRecord = {
  id: string;
  userId: string;
  studentName: string | null;
  subject: string | null;
  stressLevel: StressLevel;
  note: string | null;
  recordedAt: string;
};

export type StressSummary = {
  subject: string | null;
  count: number;
  averageStressLevel: number;
};

