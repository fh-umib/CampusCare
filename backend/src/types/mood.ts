export type MoodState = 'motivated' | 'tired' | 'stressed' | 'calm' | 'overwhelmed';

export type MoodRecord = {
  id: string;
  userId: string;
  mood: MoodState;
  note?: string;
  recordedAt: Date;
};
