create table if not exists public.daily_priorities (
  user_id uuid not null references auth.users(id) on delete cascade,
  priority_date date not null,
  slot text not null check (slot in ('마감 위험', '팀을 움직이는 결정', '내 핵심업무')),
  title text not null,
  reason text not null default '',
  href text not null default '/',
  source_item_id text,
  status text not null check (status in ('확정', '완료', '제외')),
  outcome text not null default '',
  skip_count integer not null default 0 check (skip_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, priority_date, slot)
);

create index if not exists daily_priorities_user_date_idx
  on public.daily_priorities (user_id, priority_date desc);

alter table public.daily_priorities enable row level security;

create policy "daily_priorities_select_own" on public.daily_priorities
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "daily_priorities_insert_own" on public.daily_priorities
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "daily_priorities_update_own" on public.daily_priorities
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "daily_priorities_delete_own" on public.daily_priorities
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.daily_priorities from anon;
grant select, insert, update, delete on public.daily_priorities to authenticated;
