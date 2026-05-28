-- =====================================================================
--  Alchemille — v1 schema
--  Migration: 0001_initial
--
--  Governing principle: every required field must be something the act
--  of practicing already produced. The Fast Path (intention + at-least-
--  one routine + at-least-one opened-into + pps_quality 1-10) is the
--  ONLY thing that drives the streak. Texture chips, journal text,
--  creation logs, and HRV are all optional and cannot make a complete
--  day feel incomplete.
--
--  Auth: Clerk owns identity. Each row is owned via clerk_user_id on
--  users; RLS uses auth.jwt() ->> 'sub' to match.
--
--  Phase-2 hooks: users.handle (nullable, unique) + users.display_name
--  reserve the namespace for the social layer.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- =====================================================================
--  ENUM-like constraints via CHECK on text columns
--  (Easier to extend than Postgres ENUM types; matches our TS catalogs.)
-- =====================================================================

-- =====================================================================
--  users — extends Clerk identity
-- =====================================================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email citext not null unique,
  display_name text,
  handle citext unique,                  -- Phase 2 social: @username slot
  avatar_url text,
  timezone text not null default 'America/Chicago',
  language_preference text not null default 'en',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_clerk_user_id_idx on public.users (clerk_user_id);

-- =====================================================================
--  check_ins — one row per user per local date.
--  local_date drives streak math; checked_in_at is the wall-clock stamp.
-- =====================================================================
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  local_date date not null,
  checked_in_at timestamptz not null default now(),

  intention text check (intention in ('creative','deep_learning','open')),

  pps_quality smallint check (pps_quality between 1 and 10),

  -- Texture words like 'spacious','electric','flowing'. Validated app-side
  -- against TEXTURE_CHIPS in src/lib/check-in-config.ts.
  texture_chips text[] not null default '{}',

  -- Layer 2
  journal_text text,
  -- If true, the student wrote on paper today and is just marking it done.
  journaled_on_paper boolean not null default false,

  -- Optional, peripheral; NOT part of the streak.
  hrv_value smallint check (hrv_value > 0 and hrv_value < 250),

  -- Convenience flag for the streak engine. Computed app-side at write.
  fast_path_completed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, local_date)
);

create index if not exists check_ins_user_date_idx
  on public.check_ins (user_id, local_date desc);

-- =====================================================================
--  check_in_routines — routines done within a check-in (multi)
--  routine_type ∈ blrm / aerobic / yoga / savasana10
--  preset_slug is nullable (blrm and savasana10 have no preset)
-- =====================================================================
create table if not exists public.check_in_routines (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references public.check_ins(id) on delete cascade,
  routine_type text not null
    check (routine_type in ('blrm','aerobic','yoga','savasana10')),
  preset_slug text,                       -- nullable; validated app-side
  duration_minutes integer check (duration_minutes between 1 and 600),
  created_at timestamptz not null default now()
);

create index if not exists check_in_routines_check_in_idx
  on public.check_in_routines (check_in_id);
create index if not exists check_in_routines_type_idx
  on public.check_in_routines (routine_type);

-- =====================================================================
--  check_in_opened_into — what the post-practice window opened into.
--  Multi-select with a gentle "is_primary" nudge so charts have a
--  single focus value when the student picks one.
-- =====================================================================
create table if not exists public.check_in_opened_into (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references public.check_ins(id) on delete cascade,
  category text not null
    check (category in ('creative','learning','reflective','engaged','other','rested')),
  activity_slug text not null,            -- matches OPENED_INTO_ACTIVITIES
  free_text text,                         -- used only when activity_slug='other'
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists check_in_opened_into_check_in_idx
  on public.check_in_opened_into (check_in_id);
create index if not exists check_in_opened_into_category_idx
  on public.check_in_opened_into (category);
create index if not exists check_in_opened_into_activity_idx
  on public.check_in_opened_into (activity_slug);

-- Only one primary opened-into per check-in (enforced when is_primary=true).
create unique index if not exists check_in_opened_into_one_primary
  on public.check_in_opened_into (check_in_id)
  where is_primary;

-- =====================================================================
--  creation_logs — Layer 2 artifact / output log, multi per check-in.
--  Tagged for chartability (music / language / garden / writing / other).
-- =====================================================================
create table if not exists public.creation_logs (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references public.check_ins(id) on delete cascade,
  tag text not null check (tag in ('music','language','garden','writing','other')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists creation_logs_check_in_idx
  on public.creation_logs (check_in_id);
create index if not exists creation_logs_tag_idx on public.creation_logs (tag);

-- =====================================================================
--  course_content — wired-but-empty slot for the videos/audio that
--  arrive in ~1 month. course_slug starts with 'pps' and is extensible
--  to the five-course sequence.
-- =====================================================================
create table if not exists public.course_content (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,              -- 'pps' to start
  content_type text not null check (content_type in ('video','audio')),
  title text not null,
  slug text not null,                     -- unique within course_slug
  order_index integer not null default 0,
  url text,                               -- nullable until content arrives
  duration_seconds integer,
  transcript text,
  description text,
  language text not null default 'en',    -- multilingual readiness
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_slug, slug, language)
);

create index if not exists course_content_course_idx
  on public.course_content (course_slug, order_index);

-- =====================================================================
--  course_progress — per-user resume + completion
-- =====================================================================
create table if not exists public.course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  content_id uuid not null references public.course_content(id) on delete cascade,
  last_position_seconds integer not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, content_id)
);

-- =====================================================================
--  updated_at triggers
-- =====================================================================
create or replace function public.touch_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_touch on public.users;
create trigger users_touch before update on public.users
  for each row execute function public.touch_updated_at();

drop trigger if exists check_ins_touch on public.check_ins;
create trigger check_ins_touch before update on public.check_ins
  for each row execute function public.touch_updated_at();

drop trigger if exists course_content_touch on public.course_content;
create trigger course_content_touch before update on public.course_content
  for each row execute function public.touch_updated_at();

drop trigger if exists course_progress_touch on public.course_progress;
create trigger course_progress_touch before update on public.course_progress
  for each row execute function public.touch_updated_at();

-- =====================================================================
--  RLS — Clerk session sub claim drives ownership
--  Clerk JWT template named 'supabase' must include `sub` = clerk_user_id.
-- =====================================================================

create or replace function public.current_clerk_user_id() returns text
  language sql stable as $$
  select coalesce(auth.jwt() ->> 'sub', '')::text;
$$;

create or replace function public.current_user_id() returns uuid
  language sql stable as $$
  select id from public.users where clerk_user_id = public.current_clerk_user_id();
$$;

alter table public.users enable row level security;
alter table public.check_ins enable row level security;
alter table public.check_in_routines enable row level security;
alter table public.check_in_opened_into enable row level security;
alter table public.creation_logs enable row level security;
alter table public.course_content enable row level security;
alter table public.course_progress enable row level security;

-- users: self only (admin/service-role inserts via webhook)
drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users
  for select using (clerk_user_id = public.current_clerk_user_id());

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update using (clerk_user_id = public.current_clerk_user_id());

-- check_ins: owner full CRUD
drop policy if exists check_ins_owner_all on public.check_ins;
create policy check_ins_owner_all on public.check_ins
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

-- check_in_routines: owner via parent check-in
drop policy if exists check_in_routines_owner_all on public.check_in_routines;
create policy check_in_routines_owner_all on public.check_in_routines
  for all using (
    check_in_id in (select id from public.check_ins where user_id = public.current_user_id())
  )
  with check (
    check_in_id in (select id from public.check_ins where user_id = public.current_user_id())
  );

-- check_in_opened_into: owner via parent check-in
drop policy if exists check_in_opened_into_owner_all on public.check_in_opened_into;
create policy check_in_opened_into_owner_all on public.check_in_opened_into
  for all using (
    check_in_id in (select id from public.check_ins where user_id = public.current_user_id())
  )
  with check (
    check_in_id in (select id from public.check_ins where user_id = public.current_user_id())
  );

-- creation_logs: owner via parent check-in
drop policy if exists creation_logs_owner_all on public.creation_logs;
create policy creation_logs_owner_all on public.creation_logs
  for all using (
    check_in_id in (select id from public.check_ins where user_id = public.current_user_id())
  )
  with check (
    check_in_id in (select id from public.check_ins where user_id = public.current_user_id())
  );

-- course_content: everyone signed-in can read published rows; writes admin-only
drop policy if exists course_content_published_read on public.course_content;
create policy course_content_published_read on public.course_content
  for select using (
    is_published = true and public.current_clerk_user_id() <> ''
  );

-- course_progress: owner only
drop policy if exists course_progress_owner_all on public.course_progress;
create policy course_progress_owner_all on public.course_progress
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

-- =====================================================================
--  Storage buckets (create via Supabase Studio after migration):
--    avatars        (public read; owner write)
--    course-media   (signed-url read; admin write)
-- =====================================================================
