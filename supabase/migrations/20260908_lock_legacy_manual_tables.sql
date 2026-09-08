alter table public.annual_tasks enable row level security;
alter table public.manager_logs enable row level security;
alter table public.program_cards enable row level security;
alter table public.parts enable row level security;
alter table public.daily_updates enable row level security;
alter table public.comments enable row level security;

revoke all on public.annual_tasks from anon, authenticated;
revoke all on public.manager_logs from anon, authenticated;
revoke all on public.program_cards from anon, authenticated;
revoke all on public.parts from anon, authenticated;
revoke all on public.daily_updates from anon, authenticated;
revoke all on public.comments from anon, authenticated;
