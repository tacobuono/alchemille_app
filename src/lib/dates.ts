/**
 * Time-zone-aware date helpers for Alchemille.
 *
 * The streak engine pivots on `check_ins.local_date`. "Today" must
 * mean today in the student's wall-clock time, not in UTC and not on
 * the server. So every place that asks "what day is it for this user?"
 * must go through todayLocalDate(timezone).
 */

/**
 * The student's local YYYY-MM-DD given an IANA tz name (e.g. 'America/Chicago').
 * Falls back to UTC if the tz is unrecognized.
 */
export function todayLocalDate(timezone: string, now: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const y = parts.find((p) => p.type === "year")?.value ?? "1970";
    const m = parts.find((p) => p.type === "month")?.value ?? "01";
    const d = parts.find((p) => p.type === "day")?.value ?? "01";
    return `${y}-${m}-${d}`;
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

/** Step a YYYY-MM-DD back N days (in UTC; safe for date-only math). */
export function subDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - days);
  return dt.toISOString().slice(0, 10);
}

/** Compare two YYYY-MM-DD strings; returns -1 / 0 / 1. */
export function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
