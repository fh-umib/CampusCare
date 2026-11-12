import type { PublicUser } from "../../types/user.js";
import {
  requireCurrentUser,
  requireUuid,
} from "../../utils/moduleValidation.js";
import { AppError } from "../../utils/httpError.js";
import {
  adminUsersRepository,
  type UsersFilter,
} from "./adminUsers.repository.js";

function requireAdmin(current: PublicUser | undefined) {
  const user = requireCurrentUser(current);
  if (user.role !== "admin")
    throw new AppError(
      403,
      "Only Admin can view registered users.",
      [],
      "ADMIN_USERS_FORBIDDEN",
    );
  return user;
}
export function usersFilter(query: Record<string, unknown>): UsersFilter {
  const integer = (value: unknown, fallback: number, max: number) => {
    if (value === undefined) return fallback;
    if (
      typeof value !== "string" ||
      !/^\d+$/.test(value) ||
      !Number.isSafeInteger(Number(value)) ||
      Number(value) < 1 ||
      Number(value) > max
    )
      throw new AppError(400, "Invalid pagination parameters.");
    return Number(value);
  };
  if (
    query.search !== undefined &&
    (typeof query.search !== "string" || query.search.trim().length > 150)
  )
    throw new AppError(400, "Search must be at most 150 characters.");
  const role =
    query.role === undefined || query.role === "" ? null : query.role;
  if (
    role !== null &&
    (typeof role !== "string" || !["student", "mentor", "admin"].includes(role))
  )
    throw new AppError(400, "Invalid role filter.");
  const sort = query.sort ?? "newest";
  if (sort !== "newest" && sort !== "oldest")
    throw new AppError(400, "Invalid sort order.");
  return {
    search: typeof query.search === "string" ? query.search.trim() : "",
    role: role as string | null,
    page: integer(query.page, 1, 1000000),
    limit: integer(query.limit, 20, 100),
    sort,
  };
}

// Defense in depth: never spread repository rows into responses.
function safeUser(row: Record<string, unknown>) {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
    profile_completed: row.profile_completed === true,
    last_login_at: row.last_login_at ?? null,
  };
}
export const adminUsersService = {
  async list(query: Record<string, unknown>, current?: PublicUser) {
    requireAdmin(current);
    const filter = usersFilter(query),
      result = await adminUsersRepository.list(filter);
    return {
      items: result.items.map(safeUser),
      page: filter.page,
      limit: filter.limit,
      total: Number(result.counts?.filtered_total ?? 0),
      summary: {
        total_users: Number(result.counts?.total_users ?? 0),
        students: Number(result.counts?.students ?? 0),
        mentors: Number(result.counts?.mentors ?? 0),
        admins: Number(result.counts?.admins ?? 0),
      },
    };
  },
  async detail(id: string, current?: PublicUser) {
    requireAdmin(current);
    requireUuid(id);
    const row = await adminUsersRepository.detail(id);
    if (!row) throw new AppError(404, "Registered user not found.");
    return {
      ...safeUser(row),
      department: row.department ?? null,
      study_year: row.study_year ?? null,
      admin_position:
        row.role === "admin" ? (row.admin_position ?? null) : null,
      admin_department_unit:
        row.role === "admin" ? (row.admin_department_unit ?? null) : null,
    };
  },
};
