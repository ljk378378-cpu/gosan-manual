create table if not exists public.work_program_tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  program_id text not null,
  category text not null default '운영',
  session_label text not null default '',
  title text not null default '',
  due_date date,
  status text not null default '미완료',
  owner text not null default '',
  evidence_required boolean not null default false,
  evidence_confirmed boolean not null default false,
  completed_at timestamptz,
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  constraint work_program_tasks_status_check
    check (status in ('미완료', '진행중', '완료', '보류'))
);

alter table public.work_program_tasks enable row level security;

create policy "work_program_tasks_select_own" on public.work_program_tasks
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "work_program_tasks_insert_own" on public.work_program_tasks
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "work_program_tasks_update_own" on public.work_program_tasks
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "work_program_tasks_delete_own" on public.work_program_tasks
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.work_program_tasks to authenticated;
