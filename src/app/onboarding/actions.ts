"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/schemas/onboarding";

export async function completeOnboarding(
  input: OnboardingInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, error: "Not signed in." };
  }

  const parsed = onboardingSchema.safeParse(input);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid input." };
  }

  const clerkUser = await currentUser();

  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    return {
      ok: false,
      error: "Email missing from Clerk user. Please sign out and back in.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("users").upsert(
    {
      clerk_user_id: userId,
      email,
      display_name: parsed.data.displayName,
      avatar_url: parsed.data.avatarUrl || null,
      timezone: parsed.data.timezone,
      language_preference: parsed.data.languagePreference,
      onboarding_completed_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");

  return { ok: true };
}
