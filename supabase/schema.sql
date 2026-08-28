-- Run this once in Supabase Dashboard > SQL Editor.
-- One JSON snapshot per signed-in user makes every finance entity update atomically.

create table if not exists public.finance_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  version bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.finance_snapshots enable row level security;

drop policy if exists "Users can read their own finance data" on public.finance_snapshots;
create policy "Users can read their own finance data"
on public.finance_snapshots for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own finance data" on public.finance_snapshots;
create policy "Users can create their own finance data"
on public.finance_snapshots for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own finance data" on public.finance_snapshots;
create policy "Users can update their own finance data"
on public.finance_snapshots for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.save_finance_snapshot(
  p_data jsonb,
  p_expected_version bigint
)
returns public.finance_snapshots
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_snapshot public.finance_snapshots;
  saved_snapshot public.finance_snapshots;
begin
  select * into current_snapshot
  from public.finance_snapshots
  where user_id = auth.uid()
  for update;

  if not found then
    if p_expected_version <> 0 then
      raise exception 'Finance data changed on another device. Reload and try again.' using errcode = '40001';
    end if;

    insert into public.finance_snapshots (user_id, data, version)
    values (auth.uid(), p_data, 1)
    returning * into saved_snapshot;
    return saved_snapshot;
  end if;

  if current_snapshot.version <> p_expected_version then
    raise exception 'Finance data changed on another device. Reload and try again.' using errcode = '40001';
  end if;

  update public.finance_snapshots
  set data = p_data,
      version = current_snapshot.version + 1,
      updated_at = now()
  where user_id = auth.uid()
  returning * into saved_snapshot;

  return saved_snapshot;
end;
$$;

grant execute on function public.save_finance_snapshot(jsonb, bigint) to authenticated;

-- Enables near-instant changes from another signed-in device.
do $$
begin
  alter publication supabase_realtime add table public.finance_snapshots;
exception
  when duplicate_object then null;
end $$;
