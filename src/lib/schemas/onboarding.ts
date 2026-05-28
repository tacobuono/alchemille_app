import { z } from "zod";

/**
 * Onboarding schema — shared by the React Hook Form client and the
 * server action that writes to Supabase. Single source of truth.
 *
 * Photos arrive as already-uploaded Supabase Storage URLs; the upload
 * step happens inline in the form before submit.
 */
export const onboardingSchema = z.object({
  name: z
    .string()
    .min(1, "Tell us what to call you.")
    .max(80, "Keep it under 80 characters.")
    .trim(),
  profilePhotoUrl: z
    .string()
    .url("Please upload a profile photo before continuing.")
    .min(1, "Please upload a profile photo before continuing."),
  practiceSpacePhotoUrl: z
    .string()
    .url()
    .or(z.literal(""))
    .optional()
    .nullable(),
  timezone: z.string().min(1).default("America/Chicago"),
  languagePreference: z.string().min(2).max(8).default("en"),
  journalVisibilityConsent: z.boolean().default(false),
  gardenVisibilityToCohort: z.boolean().default(false),
});

/** Form-side type (before Zod defaults apply). Use for useForm<…>(). */
export type OnboardingFormValues = z.input<typeof onboardingSchema>;

/** Parsed type after Zod validation (defaults filled in). Use server-side. */
export type OnboardingInput = z.output<typeof onboardingSchema>;
