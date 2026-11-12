import { apiClient, type ApiResponse } from "./apiClient";
import type { UserRole } from "../types/roles";
export type RegisteredUser = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  profile_completed: boolean;
  last_login_at: string | null;
};
export type RegisteredUserDetail = RegisteredUser & {
  department: string | null;
  study_year: string | null;
  admin_position: string | null;
  admin_department_unit: string | null;
};
export type UsersResult = {
  items: RegisteredUser[];
  page: number;
  limit: number;
  total: number;
  summary: {
    total_users: number;
    students: number;
    mentors: number;
    admins: number;
  };
};
export const adminUsersService = {
  async list(
    params: { search: string; role: string; page: number; sort: string },
    signal?: AbortSignal,
  ) {
    return (
      await apiClient.get<ApiResponse<UsersResult>>("/admin/users", {
        params,
        signal,
      })
    ).data.data;
  },
  async detail(id: string, signal?: AbortSignal) {
    return (
      await apiClient.get<ApiResponse<RegisteredUserDetail>>(
        `/admin/users/${id}`,
        { signal },
      )
    ).data.data;
  },
};
