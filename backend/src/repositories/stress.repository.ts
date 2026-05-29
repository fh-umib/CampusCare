import { queryDatabase } from '../config/database.js';

type StressRow = {
  id: string;
  user_id: string;
  subject: string | null;
  stress_level: number;
  note: string | null;
  recorded_at: Date;
  student_name: string | null;
};

type StressSummaryRow = {
  subject: string | null;
  record_count: string;
  average_stress_level: string | null;
};

function mapStress(row: StressRow) {
  return {
    id: row.id,
    userId: row.user_id,
    studentName: row.student_name,
    subject: row.subject,
    stressLevel: row.stress_level,
    note: row.note,
    recordedAt: row.recorded_at
  };
}

export const stressRepository = {
  findRecords: async (scope: { userId?: string }) => {
    const params: unknown[] = [];
    const where = scope.userId ? 'WHERE sr.user_id = $1' : '';

    if (scope.userId) {
      params.push(scope.userId);
    }

    const result = await queryDatabase<StressRow>(
      `SELECT sr.*, u.full_name AS student_name
       FROM stress_records sr
       INNER JOIN users u ON u.id = sr.user_id
       ${where}
       ORDER BY sr.recorded_at DESC`,
      params
    );

    return result.rows.map(mapStress);
  },

  create: async (input: { userId: string; subject: string | null; stressLevel: number; note: string | null }) => {
    const result = await queryDatabase<StressRow>(
      `INSERT INTO stress_records (user_id, subject, stress_level, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *, NULL::text AS student_name`,
      [input.userId, input.subject, input.stressLevel, input.note]
    );

    return mapStress(result.rows[0]);
  },

  summary: async (scope: { userId?: string }) => {
    const params: unknown[] = [];
    const where = scope.userId ? 'WHERE user_id = $1' : '';

    if (scope.userId) {
      params.push(scope.userId);
    }

    const result = await queryDatabase<StressSummaryRow>(
      `SELECT COALESCE(subject, 'Overall') AS subject,
        COUNT(*) AS record_count,
        ROUND(AVG(stress_level)::numeric, 2) AS average_stress_level
       FROM stress_records
       ${where}
       GROUP BY COALESCE(subject, 'Overall')
       ORDER BY COALESCE(subject, 'Overall') ASC`,
      params
    );

    return result.rows.map((row) => ({
      subject: row.subject,
      count: Number(row.record_count),
      averageStressLevel: row.average_stress_level ? Number(row.average_stress_level) : 0
    }));
  }
};
