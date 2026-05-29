import { z } from "zod";
import {
  INTENTION_SLUGS,
  ROUTINE_TYPE_SLUGS,
  OPENED_INTO_CATEGORIES,
  OPENED_INTO_ACTIVITY_SLUGS,
  TEXTURE_CHIP_SLUGS,
  CREATION_TAG_SLUGS,
} from "@/lib/check-in-config";

/**
 * The full daily check-in payload — shared by the client form and the
 * server action that writes it. Mirrors the v1 brief exactly.
 *
 * Layer 1 (Fast Path) keeps the streak alive:
 *   intention, at-least-one routine, at-least-one opened_into,
 *   pps_quality 1–10
 *
 * Layer 2 (optional, cannot break the streak):
 *   texture_chips, journal_text (REMOVED FROM DOM when journaled_on_paper),
 *   creations, hrv_value
 */

export const checkInRoutineSchema = z.object({
  routine_type: z.enum(ROUTINE_TYPE_SLUGS as [string, ...string[]]),
  preset_slug: z.string().nullable().optional(),
  duration_minutes: z
    .number()
    .int()
    .min(1)
    .max(600)
    .nullable()
    .optional(),
});

export const checkInOpenedIntoSchema = z.object({
  category: z.enum(OPENED_INTO_CATEGORIES as readonly string[] as [string, ...string[]]),
  activity_slug: z.enum(OPENED_INTO_ACTIVITY_SLUGS as [string, ...string[]]),
  free_text: z.string().max(500).nullable().optional(),
  is_primary: z.boolean(),
});

export const checkInCreationSchema = z.object({
  tag: z.enum(CREATION_TAG_SLUGS as [string, ...string[]]),
  body: z.string().min(1, "Add a few words.").max(2000),
});

export const checkInSchema = z.object({
  intention: z.enum(INTENTION_SLUGS as [string, ...string[]]),

  routines: z
    .array(checkInRoutineSchema)
    .min(1, "Pick at least one routine."),

  opened_into: z
    .array(checkInOpenedIntoSchema)
    .min(1, "Pick at least one."),

  pps_quality: z
    .number()
    .int()
    .min(1, "Pick a quality 1–10.")
    .max(10),

  texture_chips: z
    .array(z.enum(TEXTURE_CHIP_SLUGS as [string, ...string[]]))
    .default([]),

  journaled_on_paper: z.boolean().default(false),
  journal_text: z.string().max(20_000).nullable().optional(),

  hrv_value: z
    .number()
    .int()
    .positive()
    .max(249)
    .nullable()
    .optional(),

  creations: z.array(checkInCreationSchema).default([]),
});

export type CheckInFormValues = z.input<typeof checkInSchema>;
export type CheckInInput = z.output<typeof checkInSchema>;

/**
 * Enforce the paper-toggle invariant defensively at the schema layer.
 * If the toggle is on, journal_text MUST be empty/null — the UI is
 * required to remove the field from the DOM, but we also strip any
 * stray value here so the database never stores conflicting data.
 */
export function normalizeJournalAgainstPaperToggle(
  input: CheckInInput
): CheckInInput {
  if (input.journaled_on_paper) {
    return { ...input, journal_text: null };
  }
  return input;
}
