import { UserButton } from "@clerk/nextjs";
import type { AlchemicalStage } from "@/lib/supabase/types";

interface AppHeaderProps {
  stageLabel: string;
  stageDescription: string;
  currentStage: AlchemicalStage;
}

/**
 * Quiet header on authenticated pages. Carries the stage label and the
 * Clerk UserButton. Editorial tone — no app-store noise.
 */
export function AppHeader({
  stageLabel,
  stageDescription,
  currentStage,
}: AppHeaderProps) {
  return (
    <header className="flex items-start justify-between px-6 sm:px-10 py-6 border-b border-sage/20">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-sage-grey">
          {stageLabel}
          <span className="sr-only"> — current alchemical stage: {currentStage}</span>
        </p>
        <p className="mt-1 font-serif text-lg text-forest">
          {stageDescription}
        </p>
      </div>
      <UserButton
        appearance={{
          variables: {
            colorPrimary: "#2F4F3A",
            borderRadius: "0.5rem",
          },
        }}
      />
    </header>
  );
}
