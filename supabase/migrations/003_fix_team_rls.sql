-- Fix 1: profiles_read_team has infinite recursion — it queries profiles
-- inside a profiles SELECT policy. PostgreSQL returns 500 on every read.
-- Replace with authenticated-read. Profiles contain display_name only,
-- no sensitive data. Needed for leaderboards and team features.

drop policy if exists "profiles_read_team" on profiles;

create policy "profiles_read_authenticated" on profiles
  for select using (auth.uid() is not null);

-- Fix 2: teams_read_own blocks post-insert SELECT and join-code lookups
-- because the user's profile.team_id is still null at query time.
-- Replace with authenticated-read — teams are semi-public (join code is the secret).

drop policy if exists "teams_read_own" on teams;

create policy "teams_read_authenticated" on teams
  for select using (auth.uid() is not null);
