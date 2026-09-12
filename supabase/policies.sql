-- ============================================================================
-- CopyCoach AI — Row Level Security (RLS) policies
-- ----------------------------------------------------------------------------
-- HOW TO APPLY: open your Supabase project dashboard → SQL Editor → paste this
-- file → Run. It is idempotent (rerunnable) and never fails if a table is
-- missing: each table section is guarded by an existence check, and it
-- bootstraps the `feedback` table if it does not exist yet.
--
-- WHY: The dashboard reads/writes Supabase directly through the client using
-- the public anon key + the user's session. RLS is the ONLY boundary that
-- stops one user from reading or modifying another user's rows. Server-side
-- service-role code (supabaseAdmin) bypasses RLS and is used for enforcement
-- (credit counters, profile sync, feedback triage) — that is unchanged.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- profiles: users can read/update ONLY their own profile.
-- Inserts are done via the service role at signup/profile-sync.
-- ────────────────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'profiles') then
    alter table public.profiles enable row level security;

    drop policy if exists "profiles select own" on public.profiles;
    create policy "profiles select own"
      on public.profiles
      for select
      using (auth.uid() = id);

    drop policy if exists "profiles update own" on public.profiles;
    create policy "profiles update own"
      on public.profiles
      for update
      using (auth.uid() = id);

    raise notice 'profiles: RLS enabled';
  else
    raise notice 'profiles: table missing, skipped';
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- user_usage: clients may SELECT their own row and INSERT their own row (the
-- dashboard's first-visit fallback). Clients must NOT update or delete it —
-- credit enforcement is server-side (service role), so counters cannot be
-- tampered with from the browser.
-- ────────────────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'user_usage') then
    alter table public.user_usage enable row level security;

    drop policy if exists "user_usage select own" on public.user_usage;
    create policy "user_usage select own"
      on public.user_usage
      for select
      using (auth.uid() = user_id);

    drop policy if exists "user_usage insert own" on public.user_usage;
    create policy "user_usage insert own"
      on public.user_usage
      for insert
      with check (auth.uid() = user_id);

    raise notice 'user_usage: RLS enabled';
  else
    raise notice 'user_usage: table missing, skipped';
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- projects: full CRUD restricted to the owner (user_id = auth.uid()).
-- ────────────────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'projects') then
    alter table public.projects enable row level security;

    drop policy if exists "projects owner all" on public.projects;
    create policy "projects owner all"
      on public.projects
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);

    raise notice 'projects: RLS enabled';
  else
    raise notice 'projects: table missing, skipped';
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- history: full CRUD restricted to the owner (user_id = auth.uid()).
-- ────────────────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'history') then
    alter table public.history enable row level security;

    drop policy if exists "history owner all" on public.history;
    create policy "history owner all"
      on public.history
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);

    raise notice 'history: RLS enabled';
  else
    raise notice 'history: table missing, skipped';
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- feedback: accessible ONLY through the service role (anonymous submissions
-- POST via the server, admins GET/PATCH via the server). No RLS policies are
-- created, so anon/authenticated keys are denied every operation.
--
-- NOTE: This also bootstraps the table if it does not exist yet. If your DB
-- was missing it, feedback/bug-report submissions were silently falling back
-- to a per-instance in-memory store — creating it makes them persist.
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.feedback (
  id text primary key,
  user_id text not null,
  drill_id text,
  category text,
  comment text,
  rating text,
  user_copy_input text,
  ai_output_string text,
  user_tier text,
  priority text,
  status text default 'open',
  created_at timestamptz default now()
);

do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'feedback') then
    alter table public.feedback enable row level security;

    raise notice 'feedback: RLS enabled (no client policies — service role only)';
  else
    raise notice 'feedback: table missing, skipped';
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- Cleanup: remove legacy dashboard-generated policies.
-- These were created when RLS was enabled from the Supabase Table/Storage UI
-- and duplicate (or conflict with) the explicitly named policies above. In
-- particular, "Users can update their own usage" let any logged-in user reset
-- their own credits / self-grant Pro from the browser — that defeats the
-- server-side spend caps in /api/improve, so it MUST be removed.
-- ────────────────────────────────────────────────────────────────────────────
drop policy if exists "Users can update their own usage" on public.user_usage; -- security fix
drop policy if exists "Users can view their own usage" on public.user_usage;
drop policy if exists "Users can insert their own usage" on public.user_usage;

drop policy if exists "Users can delete their own history" on public.history;
drop policy if exists "Users can insert their own history" on public.history;
drop policy if exists "Users can update their own history" on public.history;
drop policy if exists "Users can view their own history" on public.history;

drop policy if exists "Users can delete own projects" on public.projects;
drop policy if exists "Users can insert own projects" on public.projects;
drop policy if exists "Users can update own projects" on public.projects;
drop policy if exists "Users can view own projects" on public.projects;

drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Allow users to update their own profile" on public.profiles;
drop policy if exists "users to update their own profile" on public.profiles;

drop policy if exists "Give anon users access to JPG images in folder 1oj01fe_0" on storage.objects;
drop policy if exists "Users can upload avatars" on storage.objects;
drop policy if exists "Anyone can view avatars" on storage.objects;

do $$
begin
  raise notice 'cleanup: legacy dashboard policies removed';
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- Storage: avatars bucket.
-- Avatars are public-read (they are shown on the dashboard), but uploads,
-- updates, and deletes are restricted to the authenticated owner's own folder
-- (<user-id>/...). This matches the client path: `avatars/<uid>/avatar.<ext>`.
-- ────────────────────────────────────────────────────────────────────────────
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars owner insert" on storage.objects;
create policy "avatars owner insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

do $$
begin
  raise notice 'storage: avatars policies applied';
end $$;