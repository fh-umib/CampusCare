import { queryDatabase } from '../../config/database.js';
import type { DateRange } from './analytics.types.js';

type Row = Record<string, string | number | Date | null>;
const bounds = (range: DateRange) => [range.start, range.end, range.previousStart, range.previousEnd];

const activityUnion = `
  SELECT user_id, 'stress' module, recorded_at occurred_at FROM stress_records
  UNION ALL SELECT user_id, 'mood', recorded_at FROM mood_records
  UNION ALL SELECT user_id, 'help', created_at FROM help_requests
  UNION ALL SELECT user_id, 'skills', created_at FROM student_skills
  UNION ALL SELECT user_id, 'lost_found', created_at FROM lost_found_items`;

export const analyticsRepository = {
  student: async (userId: string, range: DateRange) => {
    const p = [userId, ...bounds(range)];
    const current = p.slice(0, 3);
    const [metrics, moods, help, daily, modules, heatmap] = await Promise.all([
      queryDatabase<Row>(`SELECT
        COUNT(*) FILTER (WHERE sr.recorded_at >= $2 AND sr.recorded_at < $3)::int stress_count,
        ROUND(AVG(sr.stress_level) FILTER (WHERE sr.recorded_at >= $2 AND sr.recorded_at < $3)::numeric,2) average_stress,
        ROUND(AVG(sr.stress_level) FILTER (WHERE sr.recorded_at >= $4 AND sr.recorded_at < $5)::numeric,2) previous_average_stress
        FROM stress_records sr WHERE sr.user_id=$1`, p),
      queryDatabase<Row>(`SELECT mood label, COUNT(*)::int value FROM mood_records WHERE user_id=$1 AND recorded_at >= $2 AND recorded_at < $3 GROUP BY mood ORDER BY value DESC`, current),
      queryDatabase<Row>(`SELECT status label, COUNT(*)::int value FROM help_requests WHERE user_id=$1 AND created_at >= $2 AND created_at < $3 GROUP BY status`, current),
      queryDatabase<Row>(`WITH activity AS (${activityUnion}) SELECT occurred_at::date::text date, COUNT(*)::int value FROM activity WHERE user_id=$1 AND occurred_at >= $2 AND occurred_at < $3 GROUP BY occurred_at::date ORDER BY occurred_at::date`, current),
      queryDatabase<Row>(`WITH activity AS (${activityUnion}) SELECT module label, COUNT(*)::int value FROM activity WHERE user_id=$1 AND occurred_at >= $2 AND occurred_at < $3 GROUP BY module ORDER BY value DESC`, current),
      queryDatabase<Row>(`WITH activity AS (${activityUnion}) SELECT TRIM(TO_CHAR(occurred_at AT TIME ZONE 'UTC','Day')) AS weekday_name, EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'UTC')::int AS hour, COUNT(*)::int AS value FROM activity WHERE user_id=$1 AND occurred_at >= $2 AND occurred_at < $3 GROUP BY 1,2 ORDER BY 1,2`, current)
    ]);
    const extras = await queryDatabase<Row>(`SELECT
      (SELECT COUNT(*) FROM student_skills WHERE user_id=$1 AND created_at >= $2 AND created_at < $3)::int skills_added,
      (SELECT COUNT(*) FROM help_requests WHERE user_id=$1 AND created_at >= $2 AND created_at < $3)::int help_created,
      (SELECT COUNT(*) FROM lost_found_items WHERE user_id=$1 AND created_at >= $2 AND created_at < $3)::int lost_found_created,
      (SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND created_at >= $2 AND created_at < $3)::int notifications,
      COALESCE((SELECT onboarding_completed FROM user_profiles WHERE user_id=$1),false) profile_complete,
      (SELECT COUNT(*) FROM (${activityUnion}) a WHERE user_id=$1 AND occurred_at >= $2 AND occurred_at < $3)::int current_activity,
      (SELECT COUNT(*) FROM (${activityUnion}) a WHERE user_id=$1 AND occurred_at >= $4 AND occurred_at < $5)::int previous_activity`, p);
    return { metrics: metrics.rows[0] ?? {}, extras: extras.rows[0] ?? {}, moods: moods.rows, help: help.rows, daily: daily.rows, modules: modules.rows, heatmap: heatmap.rows };
  },

  aggregate: async (range: DateRange, admin: boolean) => {
    const p = bounds(range);
    const current = p.slice(0, 2);
    const [help, categories, moods, stress, daily, heatmap, roles, modules] = await Promise.all([
      queryDatabase<Row>(`SELECT status label, COUNT(*)::int value FROM help_requests WHERE created_at >= $1 AND created_at < $2 GROUP BY status`, current),
      queryDatabase<Row>(`SELECT category label, COUNT(*)::int value FROM help_requests WHERE created_at >= $1 AND created_at < $2 GROUP BY category ORDER BY value DESC`, current),
      queryDatabase<Row>(`SELECT mood label, COUNT(*)::int value FROM mood_records WHERE recorded_at >= $1 AND recorded_at < $2 GROUP BY mood`, current),
      queryDatabase<Row>(`SELECT stress_level::text label, COUNT(*)::int value FROM stress_records WHERE recorded_at >= $1 AND recorded_at < $2 GROUP BY stress_level ORDER BY stress_level`, current),
      queryDatabase<Row>(`WITH activity AS (${activityUnion}) SELECT occurred_at::date::text date, COUNT(*)::int value FROM activity WHERE occurred_at >= $1 AND occurred_at < $2 GROUP BY occurred_at::date ORDER BY occurred_at::date`, current),
      queryDatabase<Row>(`WITH activity AS (${activityUnion}) SELECT TRIM(TO_CHAR(occurred_at AT TIME ZONE 'UTC','Day')) AS weekday_name, EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'UTC')::int AS hour, COUNT(*)::int AS value FROM activity WHERE occurred_at >= $1 AND occurred_at < $2 GROUP BY 1,2 ORDER BY 1,2`, current),
      admin ? queryDatabase<Row>(`SELECT role label, COUNT(*)::int value FROM users GROUP BY role`) : Promise.resolve({ rows: [] as Row[] }),
      queryDatabase<Row>(`WITH activity AS (${activityUnion}) SELECT module label, COUNT(*)::int value FROM activity WHERE occurred_at >= $1 AND occurred_at < $2 GROUP BY module ORDER BY value DESC`, current)
    ]);
    const metrics = await queryDatabase<Row>(`SELECT
      (SELECT COUNT(*) FROM help_requests WHERE created_at >= $1 AND created_at < $2 AND status='open')::int open_requests,
      (SELECT COUNT(*) FROM help_requests WHERE created_at >= $1 AND created_at < $2 AND status='answered')::int answered_requests,
      (SELECT ROUND(AVG(EXTRACT(EPOCH FROM (first_reply-created_at))/3600)::numeric,2) FROM (SELECT hr.created_at, MIN(hp.created_at) first_reply FROM help_requests hr JOIN help_replies hp ON hp.help_request_id=hr.id JOIN users u ON u.id=hp.user_id AND u.role IN ('mentor','admin') WHERE hr.created_at >= $1 AND hr.created_at < $2 GROUP BY hr.id) x) average_response_hours,
      (SELECT COUNT(*) FROM (${activityUnion}) a WHERE occurred_at >= $1 AND occurred_at < $2)::int current_activity,
      (SELECT COUNT(*) FROM (${activityUnion}) a WHERE occurred_at >= $3 AND occurred_at < $4)::int previous_activity,
      (SELECT COUNT(DISTINCT user_id) FROM (${activityUnion}) a WHERE occurred_at >= $1 AND occurred_at < $2)::int active_users,
      (SELECT COUNT(*) FROM users)::int total_users,
      (SELECT COUNT(*) FROM users WHERE created_at >= $1 AND created_at < $2)::int new_registrations,
      (SELECT COUNT(*) FROM lost_found_items WHERE created_at >= $1 AND created_at < $2)::int lost_found_activity,
      (SELECT COUNT(*) FROM notifications WHERE created_at >= $1 AND created_at < $2)::int notification_total`, p);
    return { metrics: metrics.rows[0] ?? {}, help: help.rows, categories: categories.rows, moods: moods.rows, stress: stress.rows, daily: daily.rows, heatmap: heatmap.rows, roles: roles.rows, modules: modules.rows };
  }
};
