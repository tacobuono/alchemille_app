import { z } from "zod";

/**
 * Profile-edit schema — used by the /you settings form.
 *
 * Same shape as onboarding minus name's required-ness on initial save.
 * The `handle` slot (Phase-2 social) is intentionally NOT exposed here
 * yet; we'll surface it when the social layer ships.
 */
export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Tell us what to call you.")
    .max(80, "Keep it under 80 characters.")
    .trim(),
  avatarUrl: z
    .string()
    .url()
    .or(z.literal(""))
    .optional()
    .nullable(),
  timezone: z.string().min(1),
  languagePreference: z
    .string()
    .min(2)
    .max(8),
});

export type ProfileFormValues = z.input<typeof profileSchema>;
export type ProfileInput = z.output<typeof profileSchema>;
