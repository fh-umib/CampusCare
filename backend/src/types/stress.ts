export type StressLevel = 1 | 2 | 3 | 4 | 5;

export type StressRecord = {
  id: string;
  studentId: string;
  subject?: string;
  level: StressLevel;
  recordedAt: Date;
};

