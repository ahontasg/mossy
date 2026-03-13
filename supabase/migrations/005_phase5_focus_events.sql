-- Phase 5: Replace care button event types with focus/game/challenge events
-- Old types (feed/water/pet/sunlight) kept for historical data compatibility

-- 1. Replace submit_care_event RPC with updated event type validation
create or replace function submit_care_event(
  p_event_type text,
  p_xp_earned integer,
  p_client_timestamp timestamptz,
  p_metadata jsonb default '{}',
  p_client_id uuid default gen_random_uuid()
) returns uuid as $$
declare
  v_user_id uuid := auth.uid();
  v_last_event timestamptz;
  v_valid_xp integer;
  v_event_id uuid;
begin
  -- Timestamp validation
  if abs(extract(epoch from (now() - p_client_timestamp))) > 86400 then
    raise exception 'Client timestamp too far from server time';
  end if;

  -- Rate limiting
  select max(server_timestamp) into v_last_event
  from care_events
  where user_id = v_user_id and event_type = p_event_type;
  if v_last_event is not null and (now() - v_last_event) < interval '5 seconds' then
    raise exception 'Rate limited: too many % events', p_event_type;
  end if;

  -- XP validation — new event types + legacy types for historical data
  v_valid_xp := case p_event_type
    when 'focus_complete' then 30
    when 'game_score' then greatest(5, least(50, p_xp_earned))
    when 'challenge_complete' then greatest(15, least(100, p_xp_earned))
    when 'chat' then 10
    when 'quest_complete' then greatest(10, least(100, p_xp_earned))
    when 'level_up' then 0
    -- Legacy types (no longer sent, but valid in historical data)
    when 'feed' then 10
    when 'water' then 10
    when 'pet' then 5
    when 'sunlight' then 15
    else null
  end;

  if v_valid_xp is null then
    raise exception 'Unknown event type: %', p_event_type;
  end if;

  -- Deduplication
  select id into v_event_id from care_events
  where id = p_client_id and user_id = v_user_id;
  if v_event_id is not null then
    return v_event_id;
  end if;

  -- Insert
  insert into care_events (id, user_id, event_type, xp_earned, metadata, client_timestamp)
  values (p_client_id, v_user_id, p_event_type, v_valid_xp, p_metadata, p_client_timestamp);

  return p_client_id;
end;
$$ language plpgsql security definer;

-- 2. Replace leaderboard views with focus/game columns
drop view if exists leaderboard_weekly;
create view leaderboard_weekly as
select
  p.id as user_id,
  p.display_name,
  p.team_id,
  coalesce(sum(ce.xp_earned), 0)::integer as weekly_xp,
  count(distinct date(ce.client_timestamp))::integer as active_days,
  coalesce(sum(case when ce.event_type = 'focus_complete' then 1 else 0 end), 0)::integer as focus_sessions,
  coalesce(sum(case when ce.event_type = 'focus_complete' then 25 else 0 end), 0)::integer as focus_minutes,
  coalesce(max(case when ce.event_type = 'game_score' then (ce.metadata->>'score')::integer end), 0)::integer as top_game_score,
  (select count(*)::integer from discovered_specimens ds where ds.user_id = p.id) as specimens
from profiles p
left join care_events ce on ce.user_id = p.id
  and ce.client_timestamp > now() - interval '7 days'
group by p.id, p.display_name, p.team_id;

drop view if exists leaderboard_monthly;
create view leaderboard_monthly as
select
  p.id as user_id,
  p.display_name,
  p.team_id,
  coalesce(sum(ce.xp_earned), 0)::integer as monthly_xp,
  count(distinct date(ce.client_timestamp))::integer as active_days,
  coalesce(sum(case when ce.event_type = 'focus_complete' then 1 else 0 end), 0)::integer as focus_sessions,
  coalesce(sum(case when ce.event_type = 'focus_complete' then 25 else 0 end), 0)::integer as focus_minutes,
  coalesce(max(case when ce.event_type = 'game_score' then (ce.metadata->>'score')::integer end), 0)::integer as top_game_score,
  (select count(*)::integer from discovered_specimens ds where ds.user_id = p.id) as specimens
from profiles p
left join care_events ce on ce.user_id = p.id
  and ce.client_timestamp > now() - interval '30 days'
group by p.id, p.display_name, p.team_id;
