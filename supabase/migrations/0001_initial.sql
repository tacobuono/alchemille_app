-- =====================================================================
--  The Alchemille — Student App, Initial Schema
--  Migration: 0001_initial
--
--  Tables: users, cohorts, practice_sessions, journal_entries,
--          modules, module_progress, voice_notes, community_letters
--
--  Auth: Clerk owns identity. Supabase row ownership is matched by
--        clerk_user_id stored on each users row. RLS policies use
--        auth.jwt() ->> 'sub' (Clerk session token's sub claim,
--        configured via the Clerk JWT template named 'supabase').
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type user_role as enum ('student', 'teacher');
exception when duplicate_object then null; end $$;

do $$ begin
  create type alchemical_stage as enum ('nigredo', 'albedo', 'rubedo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type voice_note_trigger as enum (
    'first_practice',
    'week_one_complete',
    'halfway',
    'last_day',
    'return_after_gap'
  );
exception when duplicate_object then null; end $$;

-- ---------- Herb catalog (reference data, not a table) ----------
-- Order matches Alison's curriculum progression. herb_planted on
-- practice_sessions stores the slug. UI looks up display data.
-- lady's_mantle, nettle, chamomile, oat_straw, rose, tulsi,
-- ashwagandha, lavender, calendula, lemon_balm, mugwort, yarrow

-- =====================================================================
--  Cohorts
-- =====================================================================
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  course_name text not null default 'The Post-Practice State',
  start_date date not null,
  end_date date not null,
  max_students integer not null default 10,
  created_at timestamptz not null default now()
);

-- =====================================================================
--  Users — extends Clerk identity with app-specific profile data
-- =====================================================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text not null unique,
  name text,
  profile_photo_url text,
  practice_space_photo_url text,
  timezone text not null default 'America/Chicago',
  language_preference text not null default 'en',
  enrollment_date date,
  cohort_id uuid references public.cohorts(id) on delete set null,
  role user_role not null default 'student',
  journal_visibility_consent boolean not null default false,
  garden_visibility_to_cohort boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists users_clerk_user_id_idx on public.users (clerk_user_id);
create index if not exists users_cohort_id_idx on public.users (cohort_id);

-- =====================================================================
--  Practice Sessions
-- =====================================================================
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer,
  practice_type text not null,
  ujjayi_completed boolean not null default false,
  drishti_completed boolean not null default false,
  tapas_duration_minutes integer,
  savasana_duration_minutes integer,
  window_opened_at timestamptz,
  window_closes_at timestamptz,
  herb_planted text,
  created_at timestamptz not null default now()
);

create index if not exists practice_sessions_user_id_idx on public.practice_sessions (user_id);
create index if not exists practice_sessions_started_at_idx on public.practice_sessions (started_at desc);

-- =====================================================================
--  Journal Entries — practice_session_id is nullable on purpose:
--  catching a post-practice thought later in the day is the habit
--  we want to encourage, not punish.
-- =====================================================================
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  practice_session_id uuid references public.practice_sessions(id) on delete set null,
  written_at timestamptz not null default now(),
  body text not null,
  written_inside_window boolean not null default false,
  shared_with_cohort boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists journal_entries_user_id_idx on public.journal_entries (user_id);
create index if not exists journal_entries_written_at_idx on public.journal_entries (written_at desc);

-- =====================================================================
--  Modules + per-user progress
-- =====================================================================
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  stage alchemical_stage not null,
  order_index integer not null,
  title text not null,
  description text,
  video_url text,
  workbook_content jsonb,
  unlocked_after_practices integer not null default 0,
  created_at timestamptz not null default now(),
  unique (stage, order_index)
);

create table if not exists public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  completed_at timestamptz,
  workbook_responses jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, module_id)
);

-- =====================================================================
--  Voice Notes — Alison's pre-recorded encouragement
-- =====================================================================
create table if not exists public.voice_notes (
  id uuid primary key default gen_random_uuid(),
  trigger_event voice_note_trigger not null,
  audio_url text not null,
  transcript text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- =====================================================================
--  Community Letters — explicit per-entry shares to cohort
-- =====================================================================
create table if not exists public.community_letters (
  id uuid primary key default gen_random_uuid(),
  sender_user_id uuid not null references public.users(id) on delete cascade,
  recipient_cohort_id uuid not null references public.cohorts(id) on delete cascade,
  journal_entry_id uuid not null references public.journal_entries(id) on delete cascade,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists community_letters_cohort_idx on public.community_letters (recipient_cohort_id, sent_at desc);

-- =====================================================================
--  RLS — Clerk session sub claim drives ownership
--
--  Clerk JWT template named 'supabase' must include `sub` = clerk_user_id.
--  See: https://clerk.com/docs/integrations/databases/supabase
-- =====================================================================

-- Helper: current Clerk user id from JWT
create or replace function public.current_clerk_user_id() returns text
  language sql stable as $$
  select coalesce(auth.jwt() ->> 'sub', '')::text;
$$;

-- Helper: current internal user uuid
create or replace function public.current_user_id() returns uuid
  language sql stable as $$
  select id from public.users where clerk_user_id = public.current_clerk_user_id();
$$;

-- Helper: is current user a teacher?
create or replace function public.current_user_is_teacher() returns boolean
  language sql stable as $$
  select exists (
    select 1 from public.users
    where clerk_user_id = public.current_clerk_user_id()
      and role = 'teacher'
  );
$$;

alter table public.users enable row level security;
alter table public.cohorts enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.journal_entries enable row level security;
alter table public.modules enable row level security;
alter table public.module_progress enable row level security;
alter table public.voice_notes enable row level security;
alter table public.community_letters enable row level security;

-- ---- users ----
drop policy if exists users_self_read on public.users;
create policy users_self_read on public.users
  for select using (
    clerk_user_id = public.current_clerk_user_id()
    or public.current_user_is_teacher()
  );

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update using (clerk_user_id = public.current_clerk_user_id());

-- Insert is done by the Clerk webhook with service-role key, which bypasses RLS.

-- ---- cohorts ----
drop policy if exists cohorts_read_all_signed_in on public.cohorts;
create policy cohorts_read_all_signed_in on public.cohorts
  for select using (public.current_clerk_user_id() <> '');

-- ---- practice_sessions ----
drop policy if exists practice_sessions_owner_all on public.practice_sessions;
create policy practice_sessions_owner_all on public.practice_sessions
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

drop policy if exists practice_sessions_teacher_read on public.practice_sessions;
create policy practice_sessions_teacher_read on public.practice_sessions
  for select using (public.current_user_is_teacher());

-- ---- journal_entries ----
drop policy if exists journal_entries_owner_all on public.journal_entries;
create policy journal_entries_owner_all on public.journal_entries
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

-- Teachers can read journal entries ONLY for students who opted in.
drop policy if exists journal_entries_teacher_read_consented on public.journal_entries;
create policy journal_entries_teacher_read_consented on public.journal_entries
  for select using (
    public.current_user_is_teacher()
    and exists (
      select 1 from public.users u
      where u.id = journal_entries.user_id
        and u.journal_visibility_consent = true
    )
  );

-- Cohort-mates can read entries explicitly shared via community_letters.
drop policy if exists journal_entries_cohort_read_shared on public.journal_entries;
create policy journal_entries_cohort_read_shared on public.journal_entries
  for select using (
    shared_with_cohort = true
    and exists (
      select 1
      from public.community_letters cl
      join public.users me on me.id = public.current_user_id()
      where cl.journal_entry_id = journal_entries.id
        and cl.recipient_cohort_id = me.cohort_id
    )
  );

-- ---- modules ----
drop policy if exists modules_read_all_signed_in on public.modules;
create policy modules_read_all_signed_in on public.modules
  for select using (public.current_clerk_user_id() <> '');

-- ---- module_progress ----
drop policy if exists module_progress_owner_all on public.module_progress;
create policy module_progress_owner_all on public.module_progress
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

drop policy if exists module_progress_teacher_read on public.module_progress;
create policy module_progress_teacher_read on public.module_progress
  for select using (public.current_user_is_teacher());

-- ---- voice_notes ----
drop policy if exists voice_notes_read_all_signed_in on public.voice_notes;
create policy voice_notes_read_all_signed_in on public.voice_notes
  for select using (public.current_clerk_user_id() <> '');

drop policy if exists voice_notes_teacher_write on public.voice_notes;
create policy voice_notes_teacher_write on public.voice_notes
  for all using (public.current_user_is_teacher())
  with check (public.current_user_is_teacher());

-- ---- community_letters ----
drop policy if exists community_letters_sender_insert on public.community_letters;
create policy community_letters_sender_insert on public.community_letters
  for insert with check (sender_user_id = public.current_user_id());

drop policy if exists community_letters_cohort_read on public.community_letters;
create policy community_letters_cohort_read on public.community_letters
  for select using (
    exists (
      select 1 from public.users me
      where me.id = public.current_user_id()
        and me.cohort_id = community_letters.recipient_cohort_id
    )
  );

-- =====================================================================
--  Storage buckets (created via Supabase Studio after migration runs):
--    - profile-photos    (public read; owner write)
--    - practice-spaces   (public read; owner write)
--    - voice-notes       (signed-url read; teacher write)
--    - module-videos     (signed-url read; teacher write)
-- =====================================================================
