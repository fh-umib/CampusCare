import { AppError } from "../../utils/httpError.js";

// Reserved source metadata lives in existing tags; it is never a display tag.
export const metadataPrefix = "campuscare:";
export const seedTag = (key: string) => `${metadataPrefix}seed:${key}`;
export const featuredTag = `${metadataPrefix}featured`;
export const archivedTag = `${metadataPrefix}archived`;
export const demoTag = `${metadataPrefix}demo`;
export function eventMetadata(tags: string[] = []) {
  return {
    featured: tags.includes(featuredTag),
    archived: tags.includes(archivedTag),
    is_demo: tags.includes(demoTag),
  };
}
export function eventTags(
  display: string[],
  existing: string[],
  input: Record<string, unknown>,
) {
  if (display.some((tag) => tag.toLowerCase().startsWith(metadataPrefix)))
    throw new AppError(
      400,
      "Reserved event metadata cannot be used as display tags.",
    );
  const flags = eventMetadata(existing);
  for (const key of ["featured", "archived", "is_demo"] as const) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== "boolean")
        throw new AppError(400, "Event flags must be boolean values.");
      flags[key] = input[key];
    }
  }
  if (flags.archived) flags.featured = false;
  const internal = existing.filter(
    (tag) =>
      tag.startsWith(metadataPrefix) &&
      ![featuredTag, archivedTag, demoTag].includes(tag),
  );
  return [
    ...display,
    ...internal,
    ...(flags.featured ? [featuredTag] : []),
    ...(flags.archived ? [archivedTag] : []),
    ...(flags.is_demo ? [demoTag] : []),
  ];
}
export function presentEvent<T extends { tags?: string[] }>(
  event: T,
  admin: boolean,
) {
  const tags = event.tags ?? [];
  const metadata = eventMetadata(tags);
  return {
    ...event,
    tags: tags.filter((tag) => !tag.startsWith(metadataPrefix)),
    featured: metadata.featured,
    archived: metadata.archived,
    ...(admin
      ? {
          is_demo: metadata.is_demo,
          source_metadata: tags.filter((tag) => tag.startsWith(metadataPrefix)),
        }
      : {}),
  };
}
