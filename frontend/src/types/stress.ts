export type StressRecord = {
  id: string;
  studentId: string;
  subject?: string;
  level: 1 | 2 | 3 | 4 | 5;
  recordedAt: string;
};

