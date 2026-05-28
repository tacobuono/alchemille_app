import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeStage, isInsideWindow } from "@/lib/stage";
import { HERB_CATALOG, nextHerbForPracticeCount } from "@/lib/herbs";

/**
 * Dashboard — the centerpiece.
 *
 *  - Window-light hero (gold light pouring through forest) when the student
 *    is inside an active post-practice window.
 *  - Garden visualization: planted herbs vs. upcoming.
 *  - "Begin practice" call to action.
 *
 * Garden grows silently. No streaks. No counters in the spotlight.
 */
export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, name")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) return null;

  const [{ data: sessions }, { count: practicesCount }] = await Promise.all([
    supabase
      .from("practice_sessions")
      .select("herb_planted, ended_at, window_opened_at, window_closes_at")
      .eq("user_id", profile.id)
      .order("started_at", { ascending: false })
      .limit(20),
    supabase
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id),
  ]);

  const completedCount = practicesCount ?? 0;
  const stage = describeStage(completedCount);

  // The window: open if the most-recent session's window hasn't closed yet.
  const latest = sessions?.[0];
  const now = new Date();
  const windowOpen =
    latest?.window_opened_at && latest.window_closes_at
      ? isInsideWindow(
          now,
          new Date(latest.window_opened_at),
          new Date(latest.window_closes_at)
        )
      : false;

  const plantedSlugs = new Set(
    (sessions ?? [])
      .map((s) => s.herb_planted)
      .filter((slug): slug is string => Boolean(slug))
  );
  const nextHerb = nextHerbForPracticeCount(completedCount);

  return (
    <div className="px-6 sm:px-10 py-10 max-w-5xl">
      {/* Window light — only when an active window is open */}
      <section
        aria-label="The post-practice window"
        className="relative h-44 -mx-6 sm:-mx-10 mb-12 overflow-hidden"
      >
        <div
          className="absolute inset-0 window-light animate-window-open"
          style={
            {
              "--window-intensity": windowOpen ? 1 : 0,
            } as React.CSSProperties
          }
        />
        <div className="relative h-full flex items-end px-6 sm:px-10 pb-6">
          <p className="font-serif text-sm text-sage-grey">
            {windowOpen
              ? "You're in the window now."
              : "The window is quiet."}
          </p>
        </div>
      </section>

      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.18em] text-sage-grey">
          {stage.label} · {Math.round(stage.progress * 100)}%
        </p>
        <h1 className="mt-3 font-serif text-display-2 text-forest">
          {profile.name ? `Hello, ${profile.name.split(" ")[0]}.` : "Welcome back."}
        </h1>
      </header>

      <section aria-labelledby="garden-heading" className="mb-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 id="garden-heading" className="font-serif text-headline text-forest">
            Your garden
          </h2>
          <span className="text-sm text-sage-grey">
            {plantedSlugs.size} of {HERB_CATALOG.length} planted
          </span>
        </div>

        <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {HERB_CATALOG.map((herb) => {
            const planted = plantedSlugs.has(herb.slug);
            const isNext = !planted && herb.slug === nextHerb.slug;
            return (
              <li
                key={herb.slug}
                className={[
                  "aspect-square rounded-lg border p-3 flex flex-col justify-end transition-colors",
                  planted
                    ? "bg-cream border-gold/40"
                    : isNext
                      ? "bg-cream/50 border-sage/50 border-dashed"
                      : "bg-transparent border-sage/20",
                ].join(" ")}
              >
                <p
                  className={[
                    "font-serif text-sm",
                    planted ? "text-forest" : "text-sage-grey",
                  ].join(" ")}
                >
                  {herb.name}
                </p>
                <p className="text-[10px] italic text-sage-grey/80 mt-0.5">
                  {herb.latin}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t border-sage/30 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="font-serif text-headline text-forest">
              Begin practice
            </h2>
            <p className="mt-2 text-sm text-sage-grey max-w-md">
              Next plant: <span className="text-forest">{nextHerb.name}</span>.
              The window will open when you finish.
            </p>
          </div>
          <Link
            href="/practice/new"
            className="inline-flex items-center justify-center h-11 px-7 bg-forest text-cream rounded text-sm tracking-wide hover:bg-forest-deep transition-colors self-start"
          >
            Open the mat
          </Link>
        </div>
      </section>
    </div>
  );
}
