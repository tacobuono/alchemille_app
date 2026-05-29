import { subDaysIso } from "@/lib/dates";

/**
 * Current streak — consecutive days, anchored to today (in the user's tz).
 *
 * Rules:
 *  - Only fast-path-completed days count (the streak is the motivation
 *    engine the brief calls out; optional fields cannot make a day count).
 *  - "Current" means the chain has to reach today OR yesterday. If the
 *    last completed day is older than yesterday, the streak has lapsed
 *    and the function returns 0.
 *  - Today not-yet-done is fine: the streak is whatever yesterday-and-
 *    back gives, so the student doesn't lose their count just for
 *    not having checked in by 9am.
 *
 * The "rested" / "didn't open" path is honored upstream via the Fast
 * Path rule (an opened-into row with the `rested` activity is still a
 * complete day). This function only cares about fast_path_completed.
 */
export function computeCurrentStreak(
  completedDatesDesc: readonly string[],
  todayLocal: string
): number {
  if (completedDatesDesc.length === 0) return 0;

  const yesterday = subDaysIso(todayLocal, 1);
  const head = completedDatesDesc[0];

  // The chain must reach today or yesterday — otherwise it's lapsed.
  if (head !== todayLocal && head !== yesterday) return 0;

  // Walk backwards consecutively from `head`.
  let streak = 1;
  let expected = subDaysIso(head, 1);
  for (let i = 1; i < completedDatesDesc.length; i++) {
    if (completedDatesDesc[i] === expected) {
      streak++;
      expected = subDaysIso(expected, 1);
    } else if (completedDatesDesc[i] < expected) {
      // Gap detected.
      break;
    }
    // Duplicates of the same date are tolerated and skipped silently.
  }
  return streak;
}
