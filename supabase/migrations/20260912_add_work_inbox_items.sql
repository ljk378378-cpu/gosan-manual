create table if not exists public.work_inbox_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  category text not null,
  content text not null default '',
  team text not null default '공통',
  due_kind text not null default '날짜 없음',
  due_date date,
  status text not null default '미확인',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists work_inbox_items_user_status_updated_idx
  on public.work_inbox_items (user_id, status, updated_at desc);

alter table public.work_inbox_items enable row level security;

create policy "work_inbox_items_select_own" on public.work_inbox_items
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "work_inbox_items_insert_own" on public.work_inbox_items
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "work_inbox_items_update_own" on public.work_inbox_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "work_inbox_items_delete_own" on public.work_inbox_items
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.work_inbox_items to authenticated;
