-- Run in Supabase SQL Editor (Dashboard → SQL → New query)
-- Enables Google + email auth session storage with row-level security.

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('mcq', 'interview')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  config jsonb not null,
  state jsonb not null,
  results jsonb,
  started_at timestamptz not null,
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists practice_sessions_user_status_idx
  on public.practice_sessions (user_id, status, updated_at desc);

alter table public.practice_sessions enable row level security;

create policy "Users read own sessions"
  on public.practice_sessions for select
  using (auth.uid() = user_id);

create policy "Users insert own sessions"
  on public.practice_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users update own sessions"
  on public.practice_sessions for update
  using (auth.uid() = user_id);

create policy "Users delete own sessions"
  on public.practice_sessions for delete
  using (auth.uid() = user_id);

-- Enable Google OAuth in Supabase Dashboard → Authentication → Providers → Google
-- Enable Email provider in Authentication → Providers → Email
