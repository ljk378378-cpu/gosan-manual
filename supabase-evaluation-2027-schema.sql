-- 27년 사회복지관 평가 대비 특별반 입력값 저장 테이블
-- 로그인한 본인 계정의 점검 데이터만 조회·수정 가능하도록 RLS 적용.
-- Supabase SQL Editor에서 1회 실행.

create table if not exists evaluation_2027_items (
  user_id uuid not null default auth.uid(),
  code text primary key,
  status_by_year jsonb not null default '{}'::jsonb,
  evidence_checks jsonb not null default '{}'::jsonb,
  note text not null default '',
  owner text not null default '',
  due date,
  location text not null default '',
  rationale text not null default '',
  missing text not null default '',
  updated_at timestamptz not null default now()
);

alter table evaluation_2027_items drop constraint if exists evaluation_2027_items_pkey;
alter table evaluation_2027_items add primary key (user_id, code);

alter table evaluation_2027_items replica identity full;

alter table evaluation_2027_items enable row level security;

drop policy if exists "evaluation_2027_items_select_own" on evaluation_2027_items;
drop policy if exists "evaluation_2027_items_insert_own" on evaluation_2027_items;
drop policy if exists "evaluation_2027_items_update_own" on evaluation_2027_items;
drop policy if exists "evaluation_2027_items_delete_own" on evaluation_2027_items;

create policy "evaluation_2027_items_select_own"
on evaluation_2027_items
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "evaluation_2027_items_insert_own"
on evaluation_2027_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "evaluation_2027_items_update_own"
on evaluation_2027_items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "evaluation_2027_items_delete_own"
on evaluation_2027_items
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on evaluation_2027_items to authenticated;
