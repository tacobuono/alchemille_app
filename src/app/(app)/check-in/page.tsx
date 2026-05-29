import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayLocalDate } from "@/lib/dates";
import { CheckInForm } from "./check-in-form";
import type { CheckInFormValues } from "@/lib/schemas/check-in";

/**
 * Daily check-in entry. If a check-in for today already exists,
 * pre-fill the form (edit mode). Otherwise start fresh.
 */
export default async function CheckInPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, timezone, display_name")
    .eq("clerk_user_id", userId)
    .single();
  if (!profile) redirect("/onboarding");

  const localDate = todayLocalDate(profile.timezone);

  // Load today's existing check-in + its children, if any.
  const { data: existing } = await supabase
    .from("check_ins")
    .select(
      "id, intention, pps_quality, texture_chips, journal_text, journaled_on_paper, hrv_value"
    )
    .eq("user_id", profile.id)
    .eq("local_date", localDate)
    .maybeSingle();

  let initialValues: CheckInFormValues = {
    intention: "open",
    routines: [],
    opened_into: [],
    pps_quality: 5,
    texture_chips: [],
    journaled_on_paper: false,
    journal_text: "",
    hrv_value: null,
    creations: [],
  };

  if (existing) {
    const [{ data: routines }, { data: opened }, { data: creations }] =
      await Promise.all([
        supabase
          .from("check_in_routines")
          .select("routine_type, preset_slug, duration_minutes")
          .eq("check_in_id", existing.id),
        supabase
          .from("check_in_opened_into")
          .select("category, activity_slug, free_text, is_primary")
          .eq("check_in_id", existing.id),
        supabase
          .from("creation_logs")
          .select("tag, body")
          .eq("check_in_id", existing.id),
      ]);

    initialValues = {
      intention: existing.intention ?? "open",
      routines: (routines ?? []).map((r) => ({
        routine_type: r.routine_type,
        preset_slug: r.preset_slug,
        duration_minutes: r.duration_minutes,
      })),
      opened_into: (opened ?? []).map((o) => ({
        category: o.category,
        activity_slug: o.activity_slug,
        free_text: o.free_text,
        is_primary: o.is_primary,
      })),
      pps_quality: existing.pps_quality ?? 5,
      texture_chips: existing.texture_chips ?? [],
      journaled_on_paper: existing.journaled_on_paper,
      journal_text: existing.journal_text ?? "",
      hrv_value: existing.hrv_value,
      creations: (creations ?? []).map((c) => ({
        tag: c.tag,
        body: c.body,
      })),
    };
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-sage-deep">
        {existing ? "Edit today" : "Today’s check-in"}
      </p>
      <h1 className="mt-1 font-display text-display text-forest">
        {existing ? "What changed?" : "How was the window?"}
      </h1>
      <p className="mt-2 text-small text-sage-deep">
        Under two minutes. Open, log, close.
      </p>

      <div className="mt-8">
        <CheckInForm initialValues={initialValues} isEdit={Boolean(existing)} />
      </div>
    </div>
  );
}
