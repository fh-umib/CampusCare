import { queryDatabase } from '../config/database.js';

type CountRow = {
  count: string;
};

type AverageRow = {
  average: string | null;
};

type MoodCountRow = {
  mood: string;
  count: string;
};

type ActivityRow = {
  type: string;
  title: string;
  created_at: Date;
};

async function count(sql: string, params: unknown[] = []) {
  const result = await queryDatabase<CountRow>(sql, params);
  return Number(result.rows[0]?.count ?? 0);
}

export const dashboardRepository = {
  stats: async (scope: { userId?: string }) => {
    const userFilter = scope.userId ? 'WHERE user_id = $1' : '';
    const params = scope.userId ? [scope.userId] : [];

    const [
      totalUsers,
      totalHelpRequests,
      openHelpRequests,
      totalSkills,
      totalStressRecords,
      averageStressResult,
      moodCountsResult,
      lostFoundOpen,
      lostFoundResolved,
      recentActivityResult
    ] = await Promise.all([
      count('SELECT COUNT(*) FROM users'),
      count(`SELECT COUNT(*) FROM help_requests ${userFilter}`, params),
      count(`SELECT COUNT(*) FROM help_requests ${scope.userId ? `${userFilter} AND` : 'WHERE'} status = 'open'`, params),
      count('SELECT COUNT(*) FROM skills'),
      count(`SELECT COUNT(*) FROM stress_records ${userFilter}`, params),
      queryDatabase<AverageRow>(
        `SELECT ROUND(AVG(stress_level)::numeric, 2) AS average
         FROM stress_records
         ${userFilter}`,
        params
      ),
      queryDatabase<MoodCountRow>(
        `SELECT mood, COUNT(*) AS count
         FROM mood_records
         ${userFilter}
         GROUP BY mood
         ORDER BY mood ASC`,
        params
      ),
      count(
        `SELECT COUNT(*) FROM lost_found_items ${scope.userId ? `${userFilter} AND` : 'WHERE'} status = 'open'`,
        params
      ),
      count(
        `SELECT COUNT(*) FROM lost_found_items ${scope.userId ? `${userFilter} AND` : 'WHERE'} status = 'resolved'`,
        params
      ),
      queryDatabase<ActivityRow>(
        `SELECT 'help_request' AS type, title, created_at FROM help_requests ${userFilter}
         UNION ALL
         SELECT 'lost_found' AS type, title, created_at FROM lost_found_items ${userFilter}
         ORDER BY created_at DESC
         LIMIT 8`,
        params
      )
    ]);

    return {
      totalUsers,
      totalHelpRequests,
      openHelpRequests,
      totalSkills,
      totalStressRecords,
      averageStressLevel: averageStressResult.rows[0]?.average ? Number(averageStressResult.rows[0].average) : 0,
      moodCounts: moodCountsResult.rows.reduce<Record<string, number>>((counts, row) => {
        counts[row.mood] = Number(row.count);
        return counts;
      }, {}),
      lostFoundOpen,
      lostFoundResolved,
      recentActivity: recentActivityResult.rows.map((row) => ({
        type: row.type,
        title: row.title,
        createdAt: row.created_at
      }))
    };
  }
};
