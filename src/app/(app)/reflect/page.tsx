/**
 * Reflect tab — weekly/monthly variance charts.
 * Lands in step 5 (charts + reflection view). Stubbed here so the
 * bottom-nav tab doesn't 404 during step-2 testing.
 */
export default function ReflectPage() {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-sage-deep">
        Reflect
      </p>
      <h1 className="mt-1 font-display text-display text-forest">
        Weekly &amp; monthly views
      </h1>
      <p className="mt-4 text-body text-forest-soft text-pretty">
        After a few days of check-ins, you&rsquo;ll see this fill in with
        what your practice produced — the routines that preceded the best
        windows, the things your window opened into, the texture of it.
      </p>

      <section
        aria-label="Coming next"
        className="mt-8 rounded-card bg-cream-deep border border-sage/30 shadow-card p-5"
      >
        <p className="text-small text-sage-deep">Coming in step 5.</p>
        <p className="mt-1 font-display text-title text-forest">
          Streak · PPS quality · what you opened into
        </p>
      </section>
    </div>
  );
}
