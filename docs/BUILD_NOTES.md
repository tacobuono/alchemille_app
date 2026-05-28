# Build notes — Alchemille

Single source of truth for non-obvious invariants that aren't otherwise
discoverable from the schema or component tree. Read before building
or reviewing the daily check-in flow.

---

## Paper-toggle UI invariant

When `check_ins.journaled_on_paper === true`, the **journal-text input
must be removed from the DOM**, not merely disabled or hidden.

| Pattern                                                                | OK?  |
| ---------------------------------------------------------------------- | ---- |
| `{journaledOnPaper ? null : <textarea …/>}`                            | ✅   |
| `<textarea disabled={journaledOnPaper} />`                             | ❌   |
| `<div hidden={journaledOnPaper}><textarea/></div>`                     | ❌   |
| `<textarea style={{display:'none'}} />`                                | ❌   |

**Reason:** the brand value is no-screen morning pages. Offering a
typing surface while the toggle is on undermines the whole reason the
toggle exists. The toggle has to *remove* the temptation.

Encoded in `src/lib/check-in-config.ts` as
`PAPER_TOGGLE_HIDES_JOURNAL_FIELD`. Enforced by the check-in form in
step 3.

---

## Streak rule (the governing principle)

A day counts toward the streak if and only if the Fast Path is complete:

- `intention` is set (creative / deep_learning / open)
- at least one row in `check_in_routines`
- at least one row in `check_in_opened_into`
  (including the explicit "Didn't open / rested" activity_slug)
- `pps_quality` is an integer 1–10

`texture_chips`, `journal_text`, `creation_logs`, and `hrv_value` are
optional and **cannot** make a complete day feel incomplete.

Encoded once in `src/lib/check-in-config.ts` as
`isFastPathComplete()`. The DB column `check_ins.fast_path_completed`
is set by the app on write — never derived after the fact.

---

## Out of scope for v1

- Social: friends, messaging, forums. Phase 2. (`users.handle` slot is
  reserved nullable-unique so it drops in cleanly.)
- Sleep / nutrition tracking.
- Camera-based HRV (cut).
- Wearable HRV sync. Phase-2 wearable integration is on the roadmap;
  v1 is manual single-number entry only.
- Course delivery itself. The app supplements the course; it does not
  replace pen-and-paper morning pages or the desktop course.

---

## Holding-state assets

- PWA PNG icons in `/public` are **holding-state** generated from the
  master SVG in `scripts/generate-pwa-icons.mjs`. Acceptable for
  testing. A real wordmark/symbol pass happens before launch.
- Re-render with `node scripts/generate-pwa-icons.mjs` after editing
  the master SVG.
