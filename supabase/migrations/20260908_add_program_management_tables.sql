create table if not exists public.work_programs (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  title text not null default '',
  team text not null default '',
  owner text not null default '',
  drive_url text not null default '',
  period text not null default '',
  status text not null default '진행중',
  priority text not null default '보통',
  risk text not null default '',
  next_action text not null default '',
  memo text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.work_program_documents (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  program_id text not null,
  stage text not null default '',
  title text not null default '',
  status text not null default '확인필요',
  drive_url text not null default '',
  file_type text not null default '',
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.work_program_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  program_id text not null,
  log_date date not null,
  log_type text not null default '진행',
  title text not null default '',
  content text not null default '',
  decision text not null default '',
  next_action text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.work_programs enable row level security;
alter table public.work_program_documents enable row level security;
alter table public.work_program_logs enable row level security;

create policy "work_programs_select_own" on public.work_programs
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "work_programs_insert_own" on public.work_programs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "work_programs_update_own" on public.work_programs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "work_programs_delete_own" on public.work_programs
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "work_program_documents_select_own" on public.work_program_documents
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "work_program_documents_insert_own" on public.work_program_documents
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "work_program_documents_update_own" on public.work_program_documents
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "work_program_documents_delete_own" on public.work_program_documents
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "work_program_logs_select_own" on public.work_program_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "work_program_logs_insert_own" on public.work_program_logs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "work_program_logs_update_own" on public.work_program_logs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "work_program_logs_delete_own" on public.work_program_logs
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.work_programs to authenticated;
grant select, insert, update, delete on public.work_program_documents to authenticated;
grant select, insert, update, delete on public.work_program_logs to authenticated;
