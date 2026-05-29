import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { todayLocalDate } from "@/lib/dates";
import { computeCurrentStreak } from "@/lib/streak";

/**
 * Today screen — the home tab.
 *
 *  - Streak card in Soft Gold (achievement only). Lapsed streak shows
 *    "Your garden is waiting." with no shame counter.
 *  - Terracotta CTA whose wording switches based on whether the Fast
 *    Path is already complete for today.
 */
export default async function TodayPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createSupabaseAdminClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, display_name, timezone")
    .eq("clerk_user_id", userId)
    .single();
  if (!profile) return null;

  const localDate = todayLocalDate(profile.timezone);

  const [{ data: completed }, { data: todayRow }] = await Promise.all([
    supabase
      .from("check_ins")
      .select("local_date")
      .eq("user_id", profile.id)
      .eq("fast_path_completed", true)
      .order("local_date", { ascending: false })
      .limit(400),
    supabase
      .from("check_ins")
      .select("fast_path_completed")
      .eq("user_id", profile.id)
      .eq("local_date", localDate)
      .maybeSingle(),
  ]);

  const completedDates = (completed ?? []).map((r) => r.local_date);
  const streak = computeCurrentStreak(completedDates, localDate);
  const todayCompleted = Boolean(todayRow?.fast_path_completed);
  const todayStartedButIncomplete = Boolean(todayRow) && !todayCompleted;

  const firstName =
    profile.display_name?.split(" ")[0] ?? "there";

  return (
    <div>
      <p className="text-small text-sage-deep mt-1">{todayLabel()}</p>
      <h1 className="font-display text-display text-forest mt-1 text-balance">
        Hello, {firstName}.
      </h1>

      {/* Streak card — Soft Gold; only color that signals achievement */}
      <section
        aria-label="Streak"
        className="mt-6 rounded-card bg-cream-deep border border-sage/30 shadow-card p-5 flex items-center gap-4"
      >
        <div
          aria-hidden
          className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="#C9A24B"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 3c-3 5-5 8.5-5 12a5 5 0 0 0 10 0c0-3.5-2-7-5-12z" />
          </svg>
        </div>
        <div>
          <p className="text-small text-sage-deep">
            {streak === 0
              ? completedDates.length === 0
                ? "Your first day."
                : "Your garden is waiting."
              : "Current streak"}
          </p>
          <p className="font-display text-headline text-gold-deep">
            {streak === 0
              ? completedDates.length === 0
                ? "Begin"
                : "Begin again"
              : `${streak} ${streak === 1 ? "day" : "days"}`}
          </p>
        </div>
      </section>

      {/* Today CTA — terracotta when there's work to do, sage tone when done */}
      {todayCompleted ? (
        <div className="mt-6 p-5 rounded-card bg-sage-tint border border-sage/30 text-center">
          <p className="font-display text-title text-forest">
            Today is logged.
          </p>
          <p className="text-small text-sage-deep mt-1">
            Go live your day.
          </p>
          <Link
            href="/check-in"
            className="inline-block mt-3 text-small text-forest underline-offset-4 hover:underline"
          >
            Edit today
          </Link>
        </div>
      ) : (
        <>
          <Link
            href="/check-in"
            className="mt-6 block w-full rounded-cta bg-terracotta text-cream py-4 text-center font-medium shadow-cta hover:bg-terracotta-deep transition-colors"
          >
            {todayStartedButIncomplete
              ? "Finish today’s check-in"
              : "Start today’s check-in"}
          </Link>
          <p className="text-small text-sage-deep mt-3 text-center">
            Under two minutes. Open, log, close.
          </p>
        </>
      )}
    </div>
  );
}

function todayLabel(): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return fmt.format(new Date());
}
