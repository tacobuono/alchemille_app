import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AlchemicalSpine } from "@/components/layout/alchemical-spine";
import { AppHeader } from "@/components/layout/app-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeStage } from "@/lib/stage";

/**
 * Authenticated-app shell.
 *
 * Wraps every signed-in page with:
 *  - data-stage on a wrapper so CSS vars resolve to the student's stage
 *  - the alchemical spine nav
 *  - the quiet stage header
 *
 * If the student hasn't completed onboarding (no users row, or no
 * profile_photo_url yet), bounce them to /onboarding.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, profile_photo_url, cohort_id, role")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  // First-visit case: webhook may not have run yet, or onboarding incomplete.
  if (!profile) redirect("/onboarding");
  if (!profile.profile_photo_url && profile.role === "student") {
    redirect("/onboarding");
  }

  const { count: practicesCompleted } = await supabase
    .from("practice_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id);

  const completed = practicesCompleted ?? 0;
  const stageMeta = describeStage(completed);

  return (
    <div
      data-stage={stageMeta.stage}
      className="min-h-screen bg-background text-foreground flex"
    >
      <AlchemicalSpine
        currentStage={stageMeta.stage}
        practicesCompleted={completed}
      />
      <div className="flex-1 flex flex-col">
        <AppHeader
          stageLabel={stageMeta.label}
          stageDescription={stageMeta.description}
          currentStage={stageMeta.stage}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
