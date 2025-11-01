// Predefined tags for file categorization
// You can modify this list as needed

export const PREDEFINED_TAGS = [
  "Event Photo",
  "Class Banner",
  "Marketing",
] as const;

export type FileTag = (typeof PREDEFINED_TAGS)[number];

// Helper to validate if a tag is valid
export function isValidTag(tag: string): tag is FileTag {
  return PREDEFINED_TAGS.includes(tag as FileTag);
}

// Helper to get all tags
export function getAllTags(): readonly FileTag[] {
  return PREDEFINED_TAGS;
}
