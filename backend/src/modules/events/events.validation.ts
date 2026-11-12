import { AppError } from "../../utils/httpError.js";

export function discordInvite(value: unknown): string | null {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && !value.trim())
  )
    return null;
  const raw = text(value, 500);
  if (!raw) return null;
  // Match the raw URL as well as the parsed URL: reject credentials, ports,
  // path normalization tricks, query strings, fragments and lookalike domains.
  if (
    !/^https:\/\/(?:discord\.gg\/[A-Za-z0-9_-]+|discord\.com\/invite\/[A-Za-z0-9_-]+)\/?$/.test(
      raw,
    )
  ) {
    throw new AppError(
      400,
      "Use an HTTPS Discord invite: discord.gg/code or discord.com/invite/code.",
    );
  }
  const url = new URL(raw);
  return url.href;
}
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
export function text(value: unknown, max = 200, required = true): string {
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  )
    throw new AppError(
      400,
      "Please complete the required fields within their length limits.",
    );
  return value.trim();
}
export function strings(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 30)
    throw new AppError(400, "Provide up to 30 skills or tags.");
  return [...new Set(value.map((v) => text(v, 60)))];
}
export function capacity(value: unknown) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 2 || n > 50)
    throw new AppError(400, "Team capacity must be between 2 and 50.");
  return n;
}
export function eventInput(b: Record<string, unknown>) {
  const date = (v: unknown, required = false) => {
    if (!v && !required) return null;
    if (typeof v !== "string" || !Number.isFinite(Date.parse(v)))
      throw new AppError(400, "Provide a valid event date.");
    return new Date(v as string).toISOString();
  };
  const start = date(b.start_date, true)!;
  const end = date(b.end_date);
  const deadline = date(b.registration_deadline);
  if ((end && end < start) || (deadline && deadline > start))
    throw new AppError(
      400,
      "End date must follow start; registration deadline must be on or before start.",
    );
  const participation = text(b.participation_type, 20);
  const status = text(b.status, 30);
  const type = text(b.event_type, 60);
  if (
    !["individual", "team", "both"].includes(participation) ||
    !["upcoming", "registration_open", "closed", "completed"].includes(
      status,
    ) ||
    !eventTypes.includes(type)
  )
    throw new AppError(400, "Invalid event format, type or status.");
  const link = b.external_link ? text(b.external_link, 2000) : null;
  if (link) {
    try {
      if (!["http:", "https:"].includes(new URL(link).protocol)) throw Error();
    } catch {
      throw new AppError(400, "External link must use HTTP or HTTPS.");
    }
  }
  return {
    title: text(b.title, 180),
    description: text(b.description, 10000),
    event_type: type,
    organizer: text(b.organizer, 180),
    location: text(b.location, 200),
    start_date: start,
    end_date: end,
    registration_deadline: deadline,
    external_link: link,
    max_team_size:
      participation === "individual"
        ? null
        : b.max_team_size
          ? capacity(b.max_team_size)
          : null,
    participation_type: participation,
    status,
    tags: strings(b.tags ?? []),
    requirements: text(b.requirements ?? "", 2000, false),
  };
}
export function matching(needed: string[], available: string[]) {
  const names = new Set(available.map((s) => s.toLowerCase()));
  const skills = needed.filter((s) => names.has(s.toLowerCase()));
  const ratio = needed.length ? skills.length / needed.length : 0;
  return {
    skills,
    label:
      ratio >= 0.75
        ? "Strong skill match"
        : ratio >= 0.5
          ? "Good match"
          : ratio > 0
            ? "Some matching skills"
            : "Explore this team",
  };
}
