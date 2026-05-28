import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

/**
 * Onboarding — collects profile photo, practice space photo, timezone,
 * language preference, and the two visibility consents (journal-to-teacher,
 * garden-to-cohort). Lives at /onboarding outside the (app) layout so
 * the alchemical spine doesn't crowd a fresh student.
 */
export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("users")
    .select("name, profile_photo_url, practice_space_photo_url, timezone, language_preference, journal_visibility_consent, garden_visibility_to_cohort")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  // Already onboarded — bounce to dashboard.
  if (profile?.profile_photo_url) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-sage-grey">
          Setting up
        </p>
        <h1 className="mt-3 font-serif text-display-2 text-forest text-balance">
          Make yourself at home.
        </h1>
        <p className="mt-4 text-sage-grey max-w-md text-pretty">
          Two photos and a few quiet choices. Everything is editable later.
        </p>

        <div className="mt-12">
          <OnboardingForm
            initialName={profile?.name ?? ""}
            initialProfilePhoto={profile?.profile_photo_url ?? ""}
            initialPracticeSpace={profile?.practice_space_photo_url ?? ""}
            initialTimezone={
              profile?.timezone ??
              Intl.DateTimeFormat().resolvedOptions().timeZone ??
              "America/Chicago"
            }
            initialLang={profile?.language_preference ?? "en"}
          />
        </div>
      </div>
    </div>
  );
}
