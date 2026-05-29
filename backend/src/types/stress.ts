export type StressLevel = 1 | 2 | 3 | 4 | 5;

export type StressRecord = {
  id: string;
  userId: string;
  subject?: string;
  stressLevel: StressLevel;
  note?: string;
  recordedAt: Date;
};
