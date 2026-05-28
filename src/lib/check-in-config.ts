/**
 * Alchemille — daily check-in catalogs (single source of truth).
 *
 * These are the menus the student taps through in the Fast Path.
 * Stored as TypeScript so adding/reordering an item is a one-line edit
 * and there's no DB migration. The user-facing tables store these as
 * text slugs (no FKs), so charts can group on the slug and a future
 * move to a DB-managed catalog is a clean lift-and-shift.
 *
 * Brand rule: every choice must be something the practice itself
 * produced. "Didn't open / rested" is honored, not penalized.
 */

// =====================================================================
//  Intention for the window (toggle at the start of the day)
// =====================================================================

export const INTENTIONS = [
  {
    slug: "creative",
    label: "Creative window",
    description: "Channel into making.",
  },
  {
    slug: "deep_learning",
    label: "Deep learning window",
    description: "Channel into study.",
  },
  {
    slug: "open",
    label: "Open practice",
    description: "Let the window be whatever it wants.",
  },
] as const;

export type IntentionSlug = (typeof INTENTIONS)[number]["slug"];
export const INTENTION_SLUGS = INTENTIONS.map((i) => i.slug);

// =====================================================================
//  Routines done in the practice
// =====================================================================

export const ROUTINE_TYPES = [
  { slug: "blrm", label: "BLRM" },
  { slug: "aerobic", label: "Aerobic sequence" },
  { slug: "yoga", label: "Yoga flow" },
  { slug: "savasana10", label: "Full 10-min savasana" },
] as const;

export type RoutineType = (typeof ROUTINE_TYPES)[number]["slug"];
export const ROUTINE_TYPE_SLUGS = ROUTINE_TYPES.map((r) => r.slug);

/** Yoga flow presets (expandable). */
export const YOGA_PRESETS = [
  { slug: "pps_morning", label: "PPS morning flow" },
  { slug: "pps_evening", label: "PPS evening flow" },
  { slug: "primary_short", label: "Short primary series" },
  { slug: "restorative", label: "Restorative" },
] as const;

/** Aerobic sequence presets (expandable). */
export const AEROBIC_PRESETS = [
  { slug: "walk_20", label: "Walk · 20 min" },
  { slug: "walk_45", label: "Walk · 45 min" },
  { slug: "run_easy", label: "Easy run" },
  { slug: "cycle", label: "Cycle" },
  { slug: "swim", label: "Swim" },
] as const;

export type YogaPreset = (typeof YOGA_PRESETS)[number]["slug"];
export type AerobicPreset = (typeof AEROBIC_PRESETS)[number]["slug"];

/** Map routine type → its presets (BLRM and savasana10 have none). */
export function presetsForRoutine(
  type: RoutineType
): readonly { slug: string; label: string }[] {
  if (type === "yoga") return YOGA_PRESETS;
  if (type === "aerobic") return AEROBIC_PRESETS;
  return [];
}

// =====================================================================
//  What I opened into (multi-select with categories)
//
//  Grouped visually in the UI. Single tap within a group. "Didn't open
//  / rested" lives in its own grouping and must not break the streak.
// =====================================================================

export const OPENED_INTO_CATEGORIES = [
  "creative",
  "learning",
  "reflective",
  "engaged",
  "other",
  "rested",
] as const;

export type OpenedIntoCategory = (typeof OPENED_INTO_CATEGORIES)[number];

export interface OpenedIntoActivity {
  slug: string;
  label: string;
  category: OpenedIntoCategory;
}

export const OPENED_INTO_ACTIVITIES: readonly OpenedIntoActivity[] = [
  // Creative
  { slug: "songwriting_music", label: "Songwriting / music", category: "creative" },
  { slug: "creative_writing", label: "Creative writing (poetry, prose)", category: "creative" },
  { slug: "visual_art", label: "Visual art (painting, drawing, sculpting)", category: "creative" },
  { slug: "tactile_making", label: "Tactile making (woodworking, craft)", category: "creative" },
  // Learning
  { slug: "language_learning", label: "Language learning", category: "learning" },
  { slug: "reading", label: "Reading", category: "learning" },
  { slug: "deep_study", label: "Study / deep learning", category: "learning" },
  // Reflective
  { slug: "journaling", label: "Journaling", category: "reflective" },
  { slug: "seated_reflection", label: "Seated self-reflection", category: "reflective" },
  { slug: "meditation", label: "Meditation", category: "reflective" },
  // Engaged
  { slug: "project_dev", label: "Project development / planning", category: "engaged" },
  { slug: "work_focused", label: "Work, career, or focused tasks", category: "engaged" },
  { slug: "gardening", label: "Gardening", category: "engaged" },
  { slug: "connection", label: "Sharing ideas with someone", category: "engaged" },
  // Other / Rested
  { slug: "other", label: "Other", category: "other" },
  { slug: "rested", label: "Didn’t open / rested", category: "rested" },
] as const;

export const OPENED_INTO_ACTIVITY_SLUGS = OPENED_INTO_ACTIVITIES.map((a) => a.slug);

export function activitiesByCategory(
  category: OpenedIntoCategory
): readonly OpenedIntoActivity[] {
  return OPENED_INTO_ACTIVITIES.filter((a) => a.category === category);
}

// =====================================================================
//  Texture-word chips (sage; tappable; easy to extend)
// =====================================================================

export const TEXTURE_CHIPS = [
  { slug: "spacious", label: "spacious" },
  { slug: "electric", label: "electric" },
  { slug: "foggy", label: "foggy" },
  { slug: "flowing", label: "flowing" },
  { slug: "still", label: "still" },
  { slug: "expansive", label: "expansive" },
] as const;

export type TextureChipSlug = (typeof TEXTURE_CHIPS)[number]["slug"];
export const TEXTURE_CHIP_SLUGS = TEXTURE_CHIPS.map((c) => c.slug);

// =====================================================================
//  Creation-log tags (Layer 2, chartable)
// =====================================================================

export const CREATION_TAGS = [
  { slug: "music", label: "Music" },
  { slug: "language", label: "Language" },
  { slug: "garden", label: "Garden" },
  { slug: "writing", label: "Writing" },
  { slug: "other", label: "Other" },
] as const;

export type CreationTag = (typeof CREATION_TAGS)[number]["slug"];
export const CREATION_TAG_SLUGS = CREATION_TAGS.map((c) => c.slug);

// =====================================================================
//  Fast Path completeness — the rule the streak depends on.
//  texture chips, journal, creation log, HRV are all OPTIONAL and
//  CANNOT make a Fast Path feel incomplete.
// =====================================================================

export interface FastPathFields {
  intention: IntentionSlug | null;
  hasAtLeastOneRoutine: boolean;
  hasAtLeastOneOpenedInto: boolean;
  pps_quality: number | null;
}

export function isFastPathComplete(f: FastPathFields): boolean {
  return Boolean(
    f.intention &&
      f.hasAtLeastOneRoutine &&
      f.hasAtLeastOneOpenedInto &&
      typeof f.pps_quality === "number" &&
      f.pps_quality >= 1 &&
      f.pps_quality <= 10
  );
}
