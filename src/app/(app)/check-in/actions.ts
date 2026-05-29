"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  checkInSchema,
  type CheckInInput,
  normalizeJournalAgainstPaperToggle,
} from "@/lib/schemas/check-in";
import { isFastPathComplete } from "@/lib/check-in-config";
import { todayLocalDate } from "@/lib/dates";

/**
 * Save today's check-in.
 *
 * Strategy:
 *   1. Upsert the parent check_ins row by (user_id, local_date).
 *   2. Delete prior child rows (routines, opened_into, creations).
 *   3. Insert the new child rows.
 *
 * Sequential rather than RPC-wrapped for v1 simplicity. The user is
 * editing their own day's data; collisions are virtually impossible
 * in practice (one phone, one form).
 */
export async function saveCheckIn(input: CheckInInput): Promise<
  { ok: true; checkInId: string; fastPathCompleted: boolean }
  | { ok: false; error: string }
> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Not signed in." };

  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid input." };
  }
  const data = normalizeJournalAgainstPaperToggle(parsed.data);

  const supabase = createSupabaseAdminClient();

  // Resolve the internal user_id + the student's tz (drives local_date).
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, timezone")
    .eq("clerk_user_id", userId)
    .single();
  if (profileError || !profile) {
    return { ok: false, error: "Account not found. Re-sign in." };
  }

  const localDate = todayLocalDate(profile.timezone);

  const fastPathCompleted = isFastPathComplete({
    intention: data.intention as "creative" | "deep_learning" | "open",
    hasAtLeastOneRoutine: data.routines.length > 0,
    hasAtLeastOneOpenedInto: data.opened_into.length > 0,
    pps_quality: data.pps_quality,
  });

  // 1. Upsert the parent row.
  const { data: upserted, error: upsertError } = await supabase
    .from("check_ins")
    .upsert(
      {
        user_id: profile.id,
        local_date: localDate,
        intention: data.intention as "creative" | "deep_learning" | "open",
        pps_quality: data.pps_quality,
        texture_chips: data.texture_chips,
        journal_text: data.journal_text ?? null,
        journaled_on_paper: data.journaled_on_paper,
        hrv_value: data.hrv_value ?? null,
        fast_path_completed: fastPathCompleted,
      },
      { onConflict: "user_id,local_date" }
    )
    .select("id")
    .single();

  if (upsertError || !upserted) {
    return { ok: false, error: upsertError?.message ?? "Save failed." };
  }
  const checkInId = upserted.id;

  // 2. Clear prior children. (Cascades aren't enough — we need to
  //    replace the whole set, not append to it.)
  const [delRoutines, delOpened, delCreations] = await Promise.all([
    supabase.from("check_in_routines").delete().eq("check_in_id", checkInId),
    supabase.from("check_in_opened_into").delete().eq("check_in_id", checkInId),
    supabase.from("creation_logs").delete().eq("check_in_id", checkInId),
  ]);
  if (delRoutines.error || delOpened.error || delCreations.error) {
    return {
      ok: false,
      error:
        delRoutines.error?.message ||
        delOpened.error?.message ||
        delCreations.error?.message ||
        "Save failed.",
    };
  }

  // 3. Insert children (only if non-empty — Supabase rejects insert([])).
  const childResults = await Promise.all([
    data.routines.length > 0
      ? supabase.from("check_in_routines").insert(
          data.routines.map((r) => ({
            check_in_id: checkInId,
            routine_type: r.routine_type as
              | "blrm"
              | "aerobic"
              | "yoga"
              | "savasana10",
            preset_slug: r.preset_slug ?? null,
            duration_minutes: r.duration_minutes ?? null,
          }))
        )
      : null,
    data.opened_into.length > 0
      ? supabase.from("check_in_opened_into").insert(
          data.opened_into.map((o) => ({
            check_in_id: checkInId,
            category: o.category as
              | "creative"
              | "learning"
              | "reflective"
              | "engaged"
              | "other"
              | "rested",
            activity_slug: o.activity_slug,
            free_text: o.free_text ?? null,
            is_primary: o.is_primary,
          }))
        )
      : null,
    data.creations.length > 0
      ? supabase.from("creation_logs").insert(
          data.creations.map((c) => ({
            check_in_id: checkInId,
            tag: c.tag as "music" | "language" | "garden" | "writing" | "other",
            body: c.body,
          }))
        )
      : null,
  ]);

  for (const r of childResults) {
    if (r && r.error) return { ok: false, error: r.error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/check-in");
  revalidatePath("/reflect");

  return { ok: true, checkInId, fastPathCompleted };
}
