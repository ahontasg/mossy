-- Phase 4: Competitive & Social schema
-- Run this in the Supabase dashboard SQL editor or via `supabase db push`

-- ── Teams ──
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text unique not null,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

-- ── Profiles (extends auth.users) ──
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  team_id uuid references teams,
  referred_by uuid references auth.users,
  created_at timestamptz default now()
);

-- ── Care events (append-only, source of truth for scores) ──
create table care_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  event_type text not null,
  xp_earned integer not null default 0,
  metadata jsonb default '{}',
  client_timestamp timestamptz not null,
  server_timestamp timestamptz default now()
);

-- ── Discovered specimens ──
create table discovered_specimens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  specimen_id text not null,
  discovered_at timestamptz default now(),
  unique(user_id, specimen_id)
);

-- ── RLS ──
alter table teams enable row level security;
alter table profiles enable row level security;
alter table care_events enable row level security;
alter table discovered_specimens enable row level security;

-- Profiles: read all in same team, update own only
create policy "profiles_read_team" on profiles
  for select using (
    team_id is null
    or team_id in (select team_id from profiles where id = auth.uid())
  );

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

-- Teams: read own team, creator can update
create policy "teams_read_own" on teams
  for select using (
    id in (select team_id from profiles where id = auth.uid())
  );

create policy "teams_insert" on teams
  for insert with check (created_by = auth.uid());

create policy "teams_update_creator" on teams
  for update using (created_by = auth.uid());

-- Care events: read own team's events (no direct insert — use RPC)
create policy "care_events_read_team" on care_events
  for select using (
    user_id in (
      select p2.id from profiles p1
      join profiles p2 on p1.team_id = p2.team_id
      where p1.id = auth.uid()
    )
  );

-- Discovered specimens: insert own, read own team's
create policy "specimens_insert_own" on discovered_specimens
  for insert with check (user_id = auth.uid());

create policy "specimens_read_team" on discovered_specimens
  for select using (
    user_id in (
      select p2.id from profiles p1
      join profiles p2 on p1.team_id = p2.team_id
      where p1.id = auth.uid()
    )
  );

-- ── Anti-cheat RPC: submit_care_event ──
create or replace function submit_care_event(
  p_event_type text,
  p_xp_earned integer,
  p_metadata jsonb default '{}',
  p_client_timestamp timestamptz default now(),
  p_client_id uuid default gen_random_uuid()
) returns uuid
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_valid_xp integer;
  v_last_event timestamptz;
  v_event_id uuid;
begin
  -- Validate client_timestamp within 24h window
  if abs(extract(epoch from (now() - p_client_timestamp))) > 86400 then
    raise exception 'Client timestamp too far from server time';
  end if;

  -- Rate limit: max 1 event per type per 5 seconds
  select max(server_timestamp) into v_last_event
  from care_events
  where user_id = v_user_id and event_type = p_event_type;

  if v_last_event is not null and (now() - v_last_event) < interval '5 seconds' then
    raise exception 'Rate limited: too many % events', p_event_type;
  end if;

  -- Validate XP per event type
  v_valid_xp := case p_event_type
    when 'feed' then 10
    when 'water' then 10
    when 'pet' then 5
    when 'sunlight' then 15
    when 'chat' then 5
    when 'quest_complete' then greatest(10, least(100, p_xp_earned))
    when 'level_up' then 0
    else null
  end;

  if v_valid_xp is null then
    raise exception 'Unknown event type: %', p_event_type;
  end if;

  -- For non-variable types, enforce exact XP
  if p_event_type not in ('quest_complete') and p_xp_earned != v_valid_xp then
    v_valid_xp := v_valid_xp; -- override client XP
  end if;

  -- Dedup by client_id
  select id into v_event_id from care_events
  where id = p_client_id and user_id = v_user_id;
  if v_event_id is not null then
    return v_event_id;
  end if;

  insert into care_events (id, user_id, event_type, xp_earned, metadata, client_timestamp)
  values (p_client_id, v_user_id, p_event_type, v_valid_xp, p_metadata, p_client_timestamp)
  returning id into v_event_id;

  return v_event_id;
end;
$$;

-- ── Leaderboard views ──
create or replace view leaderboard_weekly as
select
  p.id as user_id,
  p.display_name,
  p.team_id,
  coalesce(sum(ce.xp_earned), 0)::integer as weekly_xp,
  count(distinct date(ce.client_timestamp))::integer as active_days,
  (select count(*)::integer from discovered_specimens ds where ds.user_id = p.id) as specimens
from profiles p
left join care_events ce on ce.user_id = p.id
  and ce.client_timestamp > now() - interval '7 days'
group by p.id, p.display_name, p.team_id;

create or replace view leaderboard_monthly as
select
  p.id as user_id,
  p.display_name,
  p.team_id,
  coalesce(sum(ce.xp_earned), 0)::integer as monthly_xp,
  count(distinct date(ce.client_timestamp))::integer as active_days,
  (select count(*)::integer from discovered_specimens ds where ds.user_id = p.id) as specimens
from profiles p
left join care_events ce on ce.user_id = p.id
  and ce.client_timestamp > now() - interval '30 days'
group by p.id, p.display_name, p.team_id;

-- ── Referral bonus RPC ──
create or replace function claim_referral_bonus(p_referrer_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_specimen text;
  v_specimens text[] := array[
    'turkey_tail', 'puffball', 'ghost_pipe', 'reindeer_lichen',
    'bracket_fungus', 'coral_mushroom'
  ];
begin
  -- Check not self-referral
  if v_user_id = p_referrer_id then
    raise exception 'Cannot refer yourself';
  end if;

  -- Check not already referred
  if exists (select 1 from profiles where id = v_user_id and referred_by is not null) then
    raise exception 'Already claimed referral bonus';
  end if;

  -- Pick a random uncommon+ specimen
  v_specimen := v_specimens[1 + floor(random() * array_length(v_specimens, 1))::integer];

  -- Set referred_by
  update profiles set referred_by = p_referrer_id where id = v_user_id;

  -- Award specimen to invitee (ignore if already discovered)
  insert into discovered_specimens (user_id, specimen_id)
  values (v_user_id, v_specimen)
  on conflict (user_id, specimen_id) do nothing;

  -- Award specimen to inviter
  insert into discovered_specimens (user_id, specimen_id)
  values (p_referrer_id, v_specimen)
  on conflict (user_id, specimen_id) do nothing;

  return v_specimen;
end;
$$;

-- ── Enable Realtime on care_events for activity feed ──
alter publication supabase_realtime add table care_events;
