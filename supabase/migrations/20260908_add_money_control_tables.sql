create table if not exists public.money_months (
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  income numeric not null default 0,
  cash_on_hand numeric not null default 0,
  fixed_cost numeric not null default 0,
  card_hyundai_target numeric not null default 0,
  card_hyundai_actual numeric not null default 0,
  card_shinhan_actual numeric not null default 0,
  card_lotte_actual numeric not null default 0,
  card_kookmin_actual numeric not null default 0,
  coffee_target numeric not null default 0,
  coffee_actual numeric not null default 0,
  memo text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

create table if not exists public.money_spends (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  spend_date date not null,
  type text not null,
  method text not null,
  amount numeric not null default 0,
  title text not null default '',
  reason text not null default '',
  keep boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.money_subscriptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  title text not null default '',
  amount numeric not null default 0,
  method text not null default '',
  pay_day text not null default '',
  need text not null default '유지검토',
  memo text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.money_months enable row level security;
alter table public.money_spends enable row level security;
alter table public.money_subscriptions enable row level security;

create policy "money_months_select_own" on public.money_months
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "money_months_insert_own" on public.money_months
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "money_months_update_own" on public.money_months
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "money_months_delete_own" on public.money_months
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "money_spends_select_own" on public.money_spends
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "money_spends_insert_own" on public.money_spends
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "money_spends_update_own" on public.money_spends
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "money_spends_delete_own" on public.money_spends
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "money_subscriptions_select_own" on public.money_subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "money_subscriptions_insert_own" on public.money_subscriptions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "money_subscriptions_update_own" on public.money_subscriptions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "money_subscriptions_delete_own" on public.money_subscriptions
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.money_months to authenticated;
grant select, insert, update, delete on public.money_spends to authenticated;
grant select, insert, update, delete on public.money_subscriptions to authenticated;
