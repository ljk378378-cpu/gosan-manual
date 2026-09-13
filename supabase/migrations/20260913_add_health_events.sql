create table if not exists public.health_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  event_type text not null check (event_type in (
    'health_a',
    'health_b',
    'water',
    'medicine_morning',
    'medicine_night',
    'sleep',
    'neck_pain',
    'back_pain',
    'weight',
    'exercise'
  )),
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  numeric_value double precision check (numeric_value is null or numeric_value >= 0),
  unit text,
  volume_ml integer check (volume_ml is null or (volume_ml > 0 and volume_ml <= 5000)),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists health_events_user_occurred_idx
  on public.health_events (user_id, occurred_at desc);

alter table public.health_events enable row level security;

create policy "health_events_select_own" on public.health_events
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "health_events_insert_own" on public.health_events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "health_events_update_own" on public.health_events
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "health_events_delete_own" on public.health_events
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.health_events from anon;
grant select, insert, update, delete on public.health_events to authenticated;
