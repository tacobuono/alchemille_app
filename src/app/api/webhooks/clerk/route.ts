import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Clerk → Supabase user sync.
 *
 * Configure in Clerk dashboard:
 *   Webhooks → add endpoint → URL: <APP_URL>/api/webhooks/clerk
 *   Events: user.created, user.updated, user.deleted
 *   Copy the signing secret into CLERK_WEBHOOK_SECRET.
 *
 * Uses service-role key — bypasses RLS to create the users row.
 */
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.text();
  const wh = new Webhook(secret);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const data = evt.data;
    const primaryEmail =
      data.email_addresses.find(
        (e) => e.id === data.primary_email_address_id
      )?.email_address ?? data.email_addresses[0]?.email_address;

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "no primary email on Clerk user" },
        { status: 400 }
      );
    }

    const fullName =
      [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

    const { error } = await supabase.from("users").upsert(
      {
        clerk_user_id: data.id,
        email: primaryEmail,
        name: fullName,
        profile_photo_url: data.image_url ?? null,
      },
      { onConflict: "clerk_user_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (evt.type === "user.deleted" && evt.data.id) {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("clerk_user_id", evt.data.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
