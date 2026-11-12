import { apiClient, type ApiResponse } from "./apiClient";
export const eventTypes = [
  "Hackathon",
  "Innovation Challenge",
  "Workshop",
  "Competition",
  "Conference",
  "Training",
  "Student Event",
  "Career / Tech Event",
];
export type CampusEvent = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  organizer: string;
  location: string;
  start_date: string;
  end_date: string | null;
  registration_deadline: string | null;
  external_link: string | null;
  max_team_size: number | null;
  participation_type: string;
  status: string;
  effective_status: string;
  tags: string[];
  requirements: string;
  interested: boolean;
  interested_count: number;
  team_count: number;
  recruiting_count: number;
  my_team_id: string | null;
  featured?: boolean;
  archived?: boolean;
  is_demo?: boolean;
  source_metadata?: string[];
};
export const supportsTeams = (event: Pick<CampusEvent, "participation_type">) =>
  event.participation_type === "team" || event.participation_type === "both";
export const eventStatusLabel = (status: string) =>
  (
    ({
      registration_open: "Registration Open",
      upcoming: "Upcoming",
      closed: "Closed",
      completed: "Completed",
    }) as Record<string, string>
  )[status] ?? status;
export const participationLabel = (mode: string) =>
  (
    ({
      individual: "Individual",
      team: "Team Opportunity",
      both: "Team / Individual",
    }) as Record<string, string>
  )[mode] ?? mode;
export type Team = {
  id: string;
  event_id: string;
  name: string;
  description: string;
  goal: string;
  note: string;
  leader_user_id: string;
  max_members: number;
  status: string;
  needed_skills: string[];
  available_skills: string[];
  member_count: number;
  my_status: string | null;
  match: { skills: string[]; label: string };
};
export type Member = {
  user_id: string;
  display_name: string;
  status: string;
  contribution_skills: string[];
};
export type Workspace = Team & {
  members: Member[];
  event: CampusEvent;
  discord_invite_url: string | null;
};
export type TeamMessage = {
  id: string;
  team_id: string;
  sender_user_id: string;
  display_name: string;
  message: string;
  created_at: string;
};
export async function eventApi<T>(
  path = "",
  method = "get",
  data?: unknown,
): Promise<T> {
  return (
    await apiClient.request<ApiResponse<T>>({
      url: `/opportunities${path}`,
      method,
      data,
    })
  ).data.data;
}
