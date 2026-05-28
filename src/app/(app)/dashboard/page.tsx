import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Today screen — the home tab.
 *
 * Stub for step 1. Step 3 of the build order replaces this with:
 *  - streak counter in Soft Gold
 *  - "Today's check-in" CTA in Terracotta
 *  - a quick reflective line of yesterday's PPS quality
 */
export default async function TodayPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("clerk_user_id", userId)
    .single();

  const firstName = profile?.display_name?.split(" ")[0] ?? "there";

  return (
    <div>
      <p className="text-small text-sage-deep mt-1">
        {todayLabel()}
      </p>
      <h1 className="font-display text-display text-forest mt-1 text-balance">
        Hello, {firstName}.
      </h1>

      {/* Streak card — placeholder until step 4 */}
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
          <p className="text-small text-sage-deep">Current streak</p>
          <p className="font-display text-headline text-gold-deep">— days</p>
        </div>
      </section>

      {/* Daily check-in CTA — terracotta, primary action */}
      <Link
        href="/check-in"
        className="mt-6 block w-full rounded-cta bg-terracotta text-cream py-4 text-center font-medium shadow-cta hover:bg-terracotta-deep active:bg-terracotta-deep transition-colors"
      >
        Start today’s check-in
      </Link>

      <p className="text-small text-sage-deep mt-3 text-center">
        Under two minutes. Open, log, close.
      </p>
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
