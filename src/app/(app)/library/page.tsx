/**
 * Library tab — course content (videos, audio, future course sequence).
 * The course_content + course_progress tables are already in the schema
 * (wired-but-empty slot). Real player + listings ship in step 6.
 */
export default function LibraryPage() {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-sage-deep">
        Library
      </p>
      <h1 className="mt-1 font-display text-display text-forest">
        Your school
      </h1>
      <p className="mt-4 text-body text-forest-soft text-pretty">
        The Post-Practice State methods — yoga flows, aerobic sequences,
        BLRM audio meditations — live here once Alison releases them.
      </p>

      <ul className="mt-8 space-y-3">
        {[
          { title: "PPS yoga flows", note: "Coming soon" },
          { title: "Aerobic sequences", note: "Coming soon" },
          { title: "BLRM audio meditations", note: "Coming soon" },
        ].map((item) => (
          <li
            key={item.title}
            className="rounded-card bg-cream-deep border border-sage/30 shadow-card p-5 flex items-baseline justify-between"
          >
            <span className="font-display text-title text-forest">
              {item.title}
            </span>
            <span className="text-xs uppercase tracking-[0.12em] text-sage-deep">
              {item.note}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
