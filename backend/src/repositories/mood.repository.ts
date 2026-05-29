import { queryDatabase } from '../config/database.js';
import type { MoodState } from '../types/mood.js';

type MoodRow = {
  id: string;
  user_id: string;
  mood: MoodState;
  note: string | null;
  recorded_at: Date;
  student_name: string | null;
};

type MoodSummaryRow = {
  mood: MoodState;
  mood_count: string;
};

function mapMood(row: MoodRow) {
  return {
    id: row.id,
    userId: row.user_id,
    studentName: row.student_name,
    mood: row.mood,
    note: row.note,
    recordedAt: row.recorded_at
  };
}

export const moodRepository = {
  findRecords: async (scope: { userId?: string }) => {
    const params: unknown[] = [];
    const where = scope.userId ? 'WHERE mr.user_id = $1' : '';

    if (scope.userId) {
      params.push(scope.userId);
    }

    const result = await queryDatabase<MoodRow>(
      `SELECT mr.*, u.full_name AS student_name
       FROM mood_records mr
       INNER JOIN users u ON u.id = mr.user_id
       ${where}
       ORDER BY mr.recorded_at DESC`,
      params
    );

    return result.rows.map(mapMood);
  },

  create: async (input: { userId: string; mood: MoodState; note: string | null }) => {
    const result = await queryDatabase<MoodRow>(
      `INSERT INTO mood_records (user_id, mood, note)
       VALUES ($1, $2, $3)
       RETURNING *, NULL::text AS student_name`,
      [input.userId, input.mood, input.note]
    );

    return mapMood(result.rows[0]);
  },

  summary: async (scope: { userId?: string }) => {
    const params: unknown[] = [];
    const where = scope.userId ? 'WHERE user_id = $1' : '';

    if (scope.userId) {
      params.push(scope.userId);
    }

    const result = await queryDatabase<MoodSummaryRow>(
      `SELECT mood, COUNT(*) AS mood_count
       FROM mood_records
       ${where}
       GROUP BY mood
       ORDER BY mood ASC`,
      params
    );

    return result.rows.map((row) => ({
      mood: row.mood,
      count: Number(row.mood_count)
    }));
  }
};
