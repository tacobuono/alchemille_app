import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser-side Supabase client.
 *
 * If `getClerkToken` is provided, every request carries the Clerk JWT
 * as the Authorization header so Postgres sees the Clerk session and
 * RLS policies that use `current_clerk_user_id()` resolve correctly.
 *
 * The Clerk "supabase" JWT template must exist in the Clerk dashboard
 * (Settings → JWT Templates → New → name: "supabase"). The default
 * claims are sufficient — we only read the `sub` claim.
 *
 * See docs/BUILD_NOTES.md for the full Clerk-Supabase setup walkthrough.
 */
export function createSupabaseBrowserClient(
  getClerkToken?: () => Promise<string | null>
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  if (!getClerkToken) {
    return createBrowserClient<Database>(url, anonKey);
  }

  return createBrowserClient<Database>(url, anonKey, {
    global: {
      fetch: async (input, init = {}) => {
        const token = await getClerkToken();
        const headers = new Headers(init.headers);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        return fetch(input, { ...init, headers });
      },
    },
  });
}
