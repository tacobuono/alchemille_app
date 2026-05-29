import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { OnboardingForm } from "./onboarding-form";

/**
 * Onboarding — slim v1 fields: display_name, avatar, timezone, language.
 * Lives outside the (app) group so the bottom-nav shell doesn't crowd
 * a brand-new student. Sets users.onboarding_completed_at on finish.
 */
export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdminClient();
  const { data: profile } = await supabase
    .from("users")
    .select(
      "display_name, avatar_url, timezone, language_preference, onboarding_completed_at"
    )
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (profile?.onboarding_completed_at) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto px-5 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">
          Welcome
        </p>
        <h1 className="mt-2 font-display text-display text-forest text-balance">
          Let&rsquo;s set up your check-in.
        </h1>
        <p className="mt-3 text-small text-sage-deep max-w-sm text-pretty">
          Four quick fields. Everything is editable later.
        </p>

        <div className="mt-10">
          <OnboardingForm
            initialName={profile?.display_name ?? ""}
            initialAvatar={profile?.avatar_url ?? ""}
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
