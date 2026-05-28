import type { AlchemicalStage } from "@/lib/supabase/types";

/**
 * The alchemical spine: Nigredo → Albedo → Rubedo.
 *
 * Stage drives UI saturation (see globals.css [data-stage="…"]) and module
 * unlock gates. Thresholds are tuned for a ~5-week cohort with ~3 practices/week
 * (≈15 total). Adjust here in one place if the cohort length changes.
 */

export const STAGE_THRESHOLDS = {
  nigredo: 0, // entry — desaturated forest + bone
  albedo: 5, // brightens into cream + pale gold
  rubedo: 11, // full bloom; coral unlocks
} as const;

export function resolveStage(practicesCompleted: number): AlchemicalStage {
  if (practicesCompleted >= STAGE_THRESHOLDS.rubedo) return "rubedo";
  if (practicesCompleted >= STAGE_THRESHOLDS.albedo) return "albedo";
  return "nigredo";
}

export interface StageMeta {
  stage: AlchemicalStage;
  label: string;
  description: string;
  /** Approximate completion within this stage (0–1). */
  progress: number;
}

export function describeStage(practicesCompleted: number): StageMeta {
  const stage = resolveStage(practicesCompleted);
  const labels: Record<AlchemicalStage, { label: string; description: string }> =
    {
      nigredo: {
        label: "Nigredo",
        description: "The dissolution. You are arriving.",
      },
      albedo: {
        label: "Albedo",
        description: "The clarification. The window is forming.",
      },
      rubedo: {
        label: "Rubedo",
        description: "The reddening. The practice is yours.",
      },
    };

  let progress = 0;
  if (stage === "nigredo") {
    progress = practicesCompleted / STAGE_THRESHOLDS.albedo;
  } else if (stage === "albedo") {
    progress =
      (practicesCompleted - STAGE_THRESHOLDS.albedo) /
      (STAGE_THRESHOLDS.rubedo - STAGE_THRESHOLDS.albedo);
  } else {
    progress = 1;
  }

  return {
    stage,
    ...labels[stage],
    progress: Math.max(0, Math.min(1, progress)),
  };
}

/**
 * The post-practice window — Alison's measurable 1–3 hour neurological
 * window. App opens a 90-minute (configurable) window on practice end.
 */
export const POST_PRACTICE_WINDOW_MINUTES = 90;

export function computeWindowClose(endedAt: Date): Date {
  return new Date(endedAt.getTime() + POST_PRACTICE_WINDOW_MINUTES * 60_000);
}

export function isInsideWindow(
  now: Date,
  windowOpenedAt: Date | null,
  windowClosesAt: Date | null
): boolean {
  if (!windowOpenedAt || !windowClosesAt) return false;
  return now >= windowOpenedAt && now <= windowClosesAt;
}
