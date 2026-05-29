export type MoodState = 'motivated' | 'tired' | 'stressed' | 'calm' | 'overwhelmed';

export type MoodRecord = {
  id: string;
  userId: string;
  studentName: string | null;
  mood: MoodState;
  note: string | null;
  recordedAt: string;
};

export type MoodSummary = {
  mood: MoodState;
  count: number;
};

