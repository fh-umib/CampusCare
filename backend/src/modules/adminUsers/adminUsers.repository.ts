import { queryDatabase } from "../../config/database.js";

export type UsersFilter = {
  search: string;
  role: string | null;
  page: number;
  limit: number;
  sort: "newest" | "oldest";
};
const safeColumns = `u.id,u.full_name,u.email,u.role,u.created_at,
 COALESCE(p.onboarding_completed,FALSE) AS profile_completed,
 (SELECT MAX(a.created_at) FROM audit_logs a WHERE a.actor_user_id=u.id AND a.action='login_success') AS last_login_at`;
const searchPattern = (value: string) =>
  `%${value.replace(/[\\%_]/g, "\\$&")}%`;

export const adminUsersRepository = {
  async list(filter: UsersFilter) {
    const pattern = searchPattern(filter.search);
    const predicate = `($1::text IS NULL OR u.role=$1) AND (u.full_name ILIKE $2 OR u.email ILIKE $2)`;
    const summary = await queryDatabase(
      `SELECT COUNT(*)::int AS total_users,
      COUNT(*) FILTER(WHERE u.role='student')::int AS students,
      COUNT(*) FILTER(WHERE u.role='mentor')::int AS mentors,
      COUNT(*) FILTER(WHERE u.role='admin')::int AS admins,
      COUNT(*) FILTER(WHERE ${predicate})::int AS filtered_total FROM users u`,
      [filter.role, pattern],
    );
    const direction = filter.sort === "oldest" ? "ASC" : "DESC";
    const items = await queryDatabase(
      `SELECT ${safeColumns} FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id
      WHERE ${predicate} ORDER BY u.created_at ${direction},u.id ${direction} LIMIT $3 OFFSET $4`,
      [filter.role, pattern, filter.limit, (filter.page - 1) * filter.limit],
    );
    return { items: items.rows, counts: summary.rows[0] };
  },
  async detail(id: string): Promise<Record<string, unknown> | null> {
    const result = await queryDatabase(
      `SELECT ${safeColumns},p.department,p.study_year,p.admin_position,p.admin_department_unit
      FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id WHERE u.id=$1`,
      [id],
    );
    return result.rows[0] ?? null;
  },
};
