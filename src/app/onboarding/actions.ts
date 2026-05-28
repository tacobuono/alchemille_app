"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { onboardingSchema, type OnboardingInput } from "@/lib/schemas/onboarding";

/**
 * Server action: save the student's onboarding answers.
 *
 * Uses the admin client because the users row may not yet have a
 * synced clerk_user_id at first sign-up (race against the Clerk
 * webhook). The action upserts on clerk_user_id to be idempotent.
 */
export async function completeOnboarding(input: OnboardingInput): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { ok: false, error: "Not signed in." };

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid input." };
  }

  const email =
    (sessionClaims?.email as string | undefined) ??
    (sessionClaims?.primary_email as string | undefined);

  if (!email) {
    return {
      ok: false,
      error:
        "Email missing from session. Sign out and back in, or contact Alison.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("users").upsert(
    {
      clerk_user_id: userId,
      email,
      name: parsed.data.name,
      profile_photo_url: parsed.data.profilePhotoUrl,
      practice_space_photo_url: parsed.data.practiceSpacePhotoUrl || null,
      timezone: parsed.data.timezone,
      language_preference: parsed.data.languagePreference,
      journal_visibility_consent: parsed.data.journalVisibilityConsent,
      garden_visibility_to_cohort: parsed.data.gardenVisibilityToCohort,
    },
    { onConflict: "clerk_user_id" }
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { ok: true };
}
