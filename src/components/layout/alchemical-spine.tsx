"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AlchemicalStage } from "@/lib/supabase/types";

interface AlchemicalSpineProps {
  currentStage: AlchemicalStage;
  /** practices completed — drives the saturation fill of each stage marker */
  practicesCompleted: number;
}

interface SpineNode {
  stage: AlchemicalStage;
  label: string;
  threshold: number;
}

const NODES: readonly SpineNode[] = [
  { stage: "nigredo", label: "Nigredo", threshold: 0 },
  { stage: "albedo", label: "Albedo", threshold: 5 },
  { stage: "rubedo", label: "Rubedo", threshold: 11 },
];

/**
 * The alchemical spine — the navigation rail along the left/top of every
 * authenticated page. Three stages. As the student progresses, each node
 * fills from desaturated bone to saturated forest, then gold, then coral.
 *
 * This is the visual signature of the app. Treat with care.
 */
export function AlchemicalSpine({
  currentStage,
  practicesCompleted,
}: AlchemicalSpineProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="The alchemical spine"
      className="hidden lg:flex flex-col items-center gap-10 px-6 py-12 border-r border-sage/30 min-h-screen w-44"
    >
      <Link
        href="/dashboard"
        className="font-serif text-base tracking-tight text-forest writing-vertical"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        The Alchemille
      </Link>

      <ol className="flex flex-col items-center gap-12 mt-4 flex-1">
        {NODES.map((node) => {
          const isCurrent = node.stage === currentStage;
          const isUnlocked = practicesCompleted >= node.threshold;
          return (
            <li key={node.stage} className="flex flex-col items-center gap-3">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={[
                  "w-3 h-3 rounded-full transition-colors duration-700",
                  isCurrent
                    ? "bg-gold ring-4 ring-gold/20"
                    : isUnlocked
                      ? "bg-forest"
                      : "bg-sage/40",
                ].join(" ")}
              />
              <span
                className={[
                  "font-serif text-sm tracking-wide",
                  isCurrent
                    ? "text-forest"
                    : isUnlocked
                      ? "text-sage-grey"
                      : "text-sage/60",
                ].join(" ")}
              >
                {node.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-auto flex flex-col gap-3 text-xs text-sage-grey">
        <SpineLink href="/dashboard" active={pathname === "/dashboard"}>
          Garden
        </SpineLink>
        <SpineLink href="/practice" active={pathname?.startsWith("/practice")}>
          Practice
        </SpineLink>
        <SpineLink href="/journal" active={pathname?.startsWith("/journal")}>
          Journal
        </SpineLink>
        <SpineLink href="/modules" active={pathname?.startsWith("/modules")}>
          Modules
        </SpineLink>
        <SpineLink
          href="/community"
          active={pathname?.startsWith("/community")}
        >
          Community
        </SpineLink>
      </div>
    </nav>
  );
}

function SpineLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "transition-colors text-left",
        active ? "text-forest" : "text-sage-grey hover:text-forest",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
