-- Fix: teams_read_authenticated exposes join_code to all authenticated users.
-- The join code is the sole secret protecting team membership.
-- Replace with a narrow policy + SECURITY DEFINER RPC for join-code lookups.

-- Helper: get the current user's team_id without triggering profiles RLS recursion
create or replace function get_my_team_id()
returns uuid
language sql
security definer
stable
as $$
  select team_id from profiles where id = auth.uid()
$$;

-- Narrow teams SELECT: only own team or teams you created
drop policy if exists "teams_read_authenticated" on teams;

create policy "teams_read_own" on teams
  for select using (
    created_by = auth.uid()
    or id = get_my_team_id()
  );

-- RPC for join-code lookups: returns team id, name, created_by — never the join_code
create or replace function lookup_team_by_code(p_join_code text)
returns table(id uuid, name text, created_by uuid)
language plpgsql
security definer
as $$
begin
  return query
    select t.id, t.name, t.created_by
    from teams t
    where t.join_code = upper(trim(p_join_code));
end;
$$;
