import { z } from "zod";

/**
 * Onboarding — slimmed for v1.
 *
 * Just: display_name, optional avatar URL, timezone, language. Visibility
 * consents and practice-space photo are gone with the Phase-2 social
 * features. handle (the @username slot) is reserved at sign-up time but
 * collected later, when the social layer ships.
 */
export const onboardingSchema = z.object({
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
  timezone: z.string().min(1).default("America/Chicago"),
  languagePreference: z.string().min(2).max(8).default("en"),
});

export type OnboardingFormValues = z.input<typeof onboardingSchema>;
export type OnboardingInput = z.output<typeof onboardingSchema>;
