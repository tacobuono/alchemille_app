import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProfileForm } from "./profile-form";
import { SignOutButton } from "./sign-out-button";

/**
 * "You" tab — account settings.
 *
 * Phase 2 will add: handle (@username), connected accounts, social
 * preferences. The handle slot is already in the users table.
 */
export default async function YouPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createSupabaseAdminClient();
  const { data: profile } = await supabase
    .from("users")
    .select("display_name, avatar_url, timezone, language_preference, email")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-sage-deep">
        You
      </p>
      <h1 className="mt-1 font-display text-display text-forest">
        Your account
      </h1>

      <section className="mt-8">
        <h2 className="font-display text-title text-forest mb-4">
          Profile
        </h2>
        <ProfileForm
          initialName={profile.display_name ?? ""}
          initialAvatar={profile.avatar_url ?? ""}
          initialTimezone={profile.timezone}
          initialLang={profile.language_preference}
        />
      </section>

      <section className="mt-12 pt-8 border-t border-sage/30">
        <h2 className="font-display text-title text-forest mb-2">
          Account
        </h2>
        <p className="text-small text-sage-deep mb-4">
          Signed in as <span className="text-forest">{profile.email}</span>
        </p>
        <SignOutButton />
      </section>

      <p className="mt-12 text-xs text-sage-deep">
        Coming in Phase 2: a quiet, opt-in social layer with @-handles
        and gentle ways to share what your window opened into.
      </p>
    </div>
  );
}
