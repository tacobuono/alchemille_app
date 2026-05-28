import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MobileNav } from "@/components/layout/mobile-nav";

/**
 * Authenticated app shell.
 * Mobile-first: a narrow centered content column with a fixed bottom
 * tab nav. Effortless one-handed.
 *
 * If the user hasn't completed onboarding (no users row OR
 * onboarding_completed_at is null), bounce to /onboarding.
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
    .select("id, onboarding_completed_at")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile || !profile.onboarding_completed_at) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-md px-5 pt-5 pb-shell">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
