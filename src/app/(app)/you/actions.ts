"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { profileSchema, type ProfileInput } from "@/lib/schemas/profile";

/**
 * Update the signed-in student's profile (display_name, avatar,
 * timezone, language). Uses admin client to bypass RLS — owner check
 * is done explicitly via clerk_user_id on the where clause.
 */
export async function updateProfile(input: ProfileInput): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Not signed in." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid input." };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("users")
    .update({
      display_name: parsed.data.displayName,
      avatar_url: parsed.data.avatarUrl || null,
      timezone: parsed.data.timezone,
      language_preference: parsed.data.languagePreference,
    })
    .eq("clerk_user_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/you");
  revalidatePath("/dashboard");
  return { ok: true };
}
