-- =====================================================================
--  Alchemille — Storage RLS policies
--  Migration: 0002_storage_policies
--
--  Two buckets:
--    avatars        public-readable, signed-in users can upload
--    course-media   admin-managed (no policies here — service-role only)
--
--  "Signed-in" here means a non-empty Clerk JWT sub claim. Requires
--  the Clerk → Supabase JWT integration:
--    1. Clerk dashboard → JWT Templates → New template → name: "supabase"
--       Default claims are fine; sub already equals the Clerk user id.
--    2. Browser Supabase client passes the Clerk token via accessToken
--       (see src/lib/supabase/client.ts).
--
--  See docs/BUILD_NOTES.md for the full Clerk-Supabase setup walkthrough.
-- =====================================================================

-- ---- avatars: public read ----
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'avatars');

-- ---- avatars: signed-in upload ----
drop policy if exists "avatars_signed_in_upload" on storage.objects;
create policy "avatars_signed_in_upload"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'avatars'
    and public.current_clerk_user_id() <> ''
  );

-- Note: deletes/updates are not policy-allowed in v1. Old avatars are
-- orphaned in the bucket; cleanup is a future cron concern.
