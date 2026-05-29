export type MoodState = 'motivated' | 'tired' | 'stressed' | 'calm' | 'overwhelmed';

export type MoodRecord = {
  id: string;
  studentId: string;
  mood: MoodState;
  weekStartDate: string;
};

