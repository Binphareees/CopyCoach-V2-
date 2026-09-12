-- ============================================================================
-- CopyCoach AI — Row Level Security (RLS) policies
-- ----------------------------------------------------------------------------
-- HOW TO APPLY: open your Supabase project dashboard → SQL Editor → paste this
-- file → Run. It is idempotent (rerunnable).
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

-- ────────────────────────────────────────────────────────────────────────────
-- user_usage: clients may SELECT their own row and INSERT their own row (the
-- dashboard's first-visit fallback). Clients must NOT update or delete it —
-- credit enforcement is server-side (service role), so counters cannot be
-- tampered with from the browser.
-- ────────────────────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────────────────────
-- projects: full CRUD restricted to the owner (user_id = auth.uid()).
-- ────────────────────────────────────────────────────────────────────────────
alter table public.projects enable row level security;

drop policy if exists "projects owner all" on public.projects;
create policy "projects owner all"
  on public.projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- history: full CRUD restricted to the owner (user_id = auth.uid()).
-- ────────────────────────────────────────────────────────────────────────────
alter table public.history enable row level security;

drop policy if exists "history owner all" on public.history;
create policy "history owner all"
  on public.history
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- feedback: accessible ONLY through the service role (anonymous submissions
-- POST via the server, admins GET/PATCH via the server). No RLS policies are
-- created, so anon/authenticated keys are denied every operation.
-- ────────────────────────────────────────────────────────────────────────────
alter table public.feedback enable row level security;

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