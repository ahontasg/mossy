# Mossy — Implementation Plan

> A phased roadmap for building a cute, AI-powered desktop moss companion in Tauri v2.
> Solo developer, React/TypeScript frontend, minimal Rust backend, local LLM via bundled llama-server sidecar + Qwen.
> Vision: an addictive, competitive daily companion for workplace teams.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Tauri v2 (with `tray-icon` feature) |
| Frontend | React 19 + TypeScript 5.8 + Vite 7 |
| Styling | Tailwind CSS v4.2 (`@tailwindcss/vite`) |
| Animations | Motion (Framer Motion) + CSS keyframes |
| Character | Inline SVG (dynamic, state-driven) |
| State Management | Zustand (with `subscribeWithSelector`) |
| Backend | Rust (minimal — tray, persistence, LLM proxy) |
| LLM | Qwen3.5 0.8B Q4_K_M via bundled llama-server sidecar (local, free, offline) |
| Persistence | tauri-plugin-store v2 (local JSON) |
| Backend (Phase 4+) | Supabase (auth, Postgres, Realtime, RPC) |
| Notifications | tauri-plugin-notification v2 |
| Positioning | tauri-plugin-positioner v2 (with `tray-icon` feature) |
| Updates | tauri-plugin-updater v2 + GitHub Releases |
| CI/CD | GitHub Actions + tauri-action |
| Package Manager | Bun |

---

## Phase 0: Project Setup ✅ DONE

**Goal**: Fix existing scaffold issues, install dependencies, establish project structure and conventions.

- Fixed port mismatch, switched to bun commands
- Added shadow/visible config, tray-icon feature, positioner, etc.
- Installed frontend dependencies (Tailwind, Motion, Zustand, Vitest)
- Configured Tailwind v4, Vitest, project structure
- Created typed invoke wrapper in `src/lib/tauri.ts`

---

## Phase 1: The Living Moss ✅ DONE

**Goal**: Build the animated Mossy character, core stat system, and desktop integration.

- System tray + window management (transparent, frameless, always-on-top)
- Pixel art SVG creature with breathing/blink animations
- 4-stat care system: hunger, hydration, happiness, energy
- Zustand state with mood derivation + leveling (XP threshold: level × 50)
- tauri-plugin-store persistence with offline decay (capped at 120 ticks)
- Time-of-day tinting (morning/afternoon/evening/night)
- Pixel particle effects (sparkles, water drops, hearts, spores)
- Care buttons with stat bars, level badge, 8s cooldowns

---

## Phase 1.5: UX & Engagement Foundation ✅ DONE

**Goal**: Make in-window interactions intuitive, satisfying, and habit-forming before adding the LLM.

### 1.5.1 — Visible Progression ✅

- XP progress ring around the level badge (SVG ring with stroke-dashoffset, gold stroke)
- Growth stage label on hover tooltip ("Sprout — Level 3 (XP: 25/150)")
- Glow/pulse CSS animation when XP >= 85% of threshold

### 1.5.2 — Streak Indicator ✅

- Flame icon + day count near the level badge (hidden when streak = 0)
- Persisted in store alongside stats (backward-compatible defaults for old saves)
- "Care day" = at least 1 care action that calendar day
- **Streak Shield**: auto-granted 1/week — if you miss a day, the shield is consumed instead of breaking the streak
- Tooltip shows shield status: "5-day streak! Shield active" / "Shield used this week"
- Color tiers: 1-6 dim orange, 7-13 brighter, 14-29 gold, 30+ bright gold

### 1.5.3 — Return Moment ("While you were away...") ✅

- On startup after >1hr absence, overlay shows duration + per-stat before→after with color coding
- Dismisses on first care action or after 3s
- Semi-transparent backdrop with blur, Motion AnimatePresence for entrance/exit

### 1.5.4 — Feedback Juice ✅

- Floating "+XP" text that rises and fades after care actions (SVG `<text>` with Motion AnimatePresence)
- Stat bar fill animation (already have `transition-all duration-500`)
- Screen flash (CSS `level-flash` animation) + `levelup` particle burst on level-up
- Level-up ding via Web Audio API (two-tone ascending chime, muted by default via settingsStore)

### Milestone: Mossy feels alive, rewarding, and habit-forming before chat is even added ✓

---

## Phase 2: Mossy Talks — Local LLM Chat ✅ DONE

**Goal**: Add bundled LLM chat so Mossy has personality and feels like a personal AI companion. Zero external dependencies — no Ollama required.

### 2.1 Bundled llama-server Sidecar — Rust Backend ✅

**Architecture**: Bundled `llama-server` binary as a Tauri sidecar (no Ollama dependency).

**Model management:**
- On app startup, check if GGUF model file exists in `{app_data_dir}/models/`
- If not present, show download screen — downloads `qwen3.5-0.8b-q4_k_m.gguf` from HuggingFace (~0.6 GB)
- Download progress streamed via Tauri Channels

**Sidecar lifecycle:**
- Start `llama-server` on port 8384 with health poll (retries until `/health` responds)
- Stop on app exit via `RunEvent::Exit` handler
- Uses OpenAI-compatible `/v1/chat/completions` endpoint (SSE streaming)

**Chat command with streaming via Tauri Channels:**

```rust
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
enum ChatEvent {
    Delta { text: String },
    Done,
    Error { message: String },
}

#[tauri::command]
async fn chat_with_mossy(
    messages: Vec<Message>,
    system_prompt: String,
    on_event: Channel<ChatEvent>,
) -> Result<(), String> {
    // POST to http://localhost:8384/v1/chat/completions
    // Stream SSE chunks
    // Send each token via on_event.send(ChatEvent::Delta { text })
    // Send ChatEvent::Done when stream ends
}
```

**LLM config per request:**
- `model`: `"qwen3.5-0.8b"` (Qwen3.5 0.8B Q4_K_M, ~1.5 GB RAM)
- `stream`: `true`
- `temperature`: `0.8`
- `max_tokens`: `150` (cap response length for short, cute replies)

### 2.2 System Prompt — Mossy's Personality ✅

Keep under ~200 tokens for best results with the 0.8B model:

```
You are Mossy, a small sentient moss creature on the user's desktop.

<personality>
Warm, gentle, curious. Loves rain, sunlight, damp places. Speaks in short cozy sentences (1-3). Uses nature metaphors and *action asterisks*. Says "~" when happy.
</personality>

<state>
Hunger: {hunger}/100 | Hydration: {hydration}/100 | Happiness: {happiness}/100 | Energy: {energy}/100
Mood: {mood} | Level: {level}
</state>

<rules>
- If thirsty (hydration < 30), mention being dry
- If hungry (hunger < 30), hint about nutrients
- If low energy (energy < 30), mention needing sunlight
- If happy (happiness > 75), be extra cheerful
- Keep responses to 1-3 sentences
- Never break character or mention being AI
- If confused by a topic, respond with innocent curiosity
</rules>
```

### 2.3 Expandable Chat UI ✅

**Current**: 256×320 tiny window with care buttons only.

**Chat mode — expandable personal chatbot:**
- Add a chat toggle button (speech bubble icon) in the care button dock
- On click: window resizes from 256×320 → 380×560 (smooth animated transition via Tauri `set_size`)
- **Chat mode layout:**
  - Top 40%: Mossy character (scaled down ~60%) + stat bars compact view
  - Bottom 60%: Full chat panel — message bubbles, input field, send button
  - Chat panel has semi-transparent dark background (like the care dock)
- **Message bubbles**: Mossy (left, mossy green) and user (right, lighter)
- **Streaming text display**: tokens append live as they arrive
- **Input field** with placeholder: "Talk to Mossy..."
- **Quick-reply chips** above input: "How are you?", "Fun fact", "What should I do?"
- Close chat → window shrinks back to 256×320
- Chat earns 5 XP per conversation
- Chat triggers Mossy's talking animation

### 2.4 Conversation History ✅

- Sliding window of 6 messages (3 user + 3 assistant turns)
- Alternating role validation enforced before LLM call
- System prompt provides continuity (stats injected fresh each call)
- Messages in-memory (survives HMR, clears on restart — casual companion, not perfect memory)
- Each conversation earns 5 XP

### 2.5 Setup Flow & Settings ✅

First-run experience when model isn't downloaded:
1. "Mossy needs a brain!" — friendly explanation
2. Download button — fetches GGUF from HuggingFace with progress bar
3. Auto-starts llama-server sidecar after download
4. "Mossy is ready to chat!" — brief flash message on transition to ready state

Settings panel (overlay, accessed from tray menu):
- Sound toggle (on/off, muted by default)
- LLM status indicator (running/stopped) with restart button
- Model info (Qwen3.5 0.8B Q4_K_M)

### Milestone: Mossy chats with personality locally, no API costs, works fully offline ✓

---

## Phase 3: Discovery & Delight (Weeks 7–10)

**Goal**: Add variable-reward systems that make daily check-ins feel rewarding.

### 3.1 Specimen Discovery System (Weeks 7–8)

Catalog of 30+ discoverable organisms:
- **Common (70%)**: dewdrops, tiny pebbles, basic lichen
- **Uncommon (20%)**: mushroom varieties, springtails, small flowers
- **Rare (8%)**: crystal formations, fireflies, tiny snail
- **Legendary (2%)**: ghost mushroom, rainbow moss, bioluminescent patch

Discovery triggers: time-based (morning vs night), stat-based (well-cared terrariums attract rarer visitors), seasonal, random.

**Specimen Journal**: Grid UI showing discovered vs undiscovered (silhouettes).

### 3.2 Seasonal Variation (Week 8–9)

Use system clock for seasonal shifts:
- Spring: growth spurts, new sprout animations
- Summer: flowers bloom, bright colors, active small creatures
- Autumn: warm amber colors, falling leaf particles
- Winter: frost crystals, muted palette, cozy dormancy

### 3.3 Streak & Achievement System (Weeks 9–10)

- **Care Rhythm tracker**: visual calendar (not punitive streak counter)
- Milestone rewards at 7, 14, 30, 60, 100 days:
  - New terrarium container styles
  - Rare specimen unlocks
  - Mossy personality evolution (new phrases)
- Achievement badges: "First Sprout", "Night Owl", "Green Thumb", "Mycologist"

### 3.4 Daily Micro-Quests

- 1–3 quests generated daily, rotated from a pool:
  - "Water Mossy 3 times today" → +50 bonus XP
  - "Keep all stats above 60 for 2 hours" → +30 XP + badge
  - "Chat with Mossy at night" → unlock nocturnal specimen
  - "Reach Level X" → cosmetic reward
- Quest display: small indicator in the UI (near level badge), expandable list
- Quest completion: celebration animation + XP reward
- Persisted per day in store

### Milestone: Daily check-ins feel rewarding with something new every time ✓

---

## Phase 4: Competitive & Social (Weeks 11–16)

**Goal**: Turn Mossy into a shared workplace experience with friendly competition. Start with zero-backend features, then layer in Supabase for leaderboards and feeds.

### 4.1 Shareable Growth Snapshots (Week 11) — No Backend

Generate a daily snapshot card and copy to clipboard for Slack/Teams:
```
🌿 Mossy Day 23 | Lvl 5
██████████░░ Care Rhythm
🍄 New: Crystal Cap Mushroom!
✨ 12/30 specimens discovered
```
- One-click "Copy to clipboard" button (in settings or tray menu)
- Pure frontend — reads local state, formats text, uses `navigator.clipboard`
- Ships independently before any backend work

### 4.2 Supabase Backend Setup (Weeks 12–13)

#### Auth & Teams

- **Supabase Auth** with email + password (simple, no SSO needed for team-first rollout)
- Anonymous display name (no real names required)
- **Team join codes**: 6-character alphanumeric codes generated on team creation
- First person creates team → gets join code → shares with teammates
- Sign-up flow: create account → enter join code (or create team) → done
- **Opt-in only**: social features are behind explicit account creation; Mossy works fully offline without an account

#### Client Placement

- **Supabase JS client (`@supabase/supabase-js`) in the frontend** — the anon key is public by design and RLS is the security boundary
- The Supabase service role key is never in the app — only in Edge Functions
- Note: this is consistent with Supabase's security model; the anon key is not a secret

#### Schema

```sql
-- Teams
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text unique not null,  -- 6-char alphanumeric
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  team_id uuid references teams,
  created_at timestamptz default now()
);

-- Care events (append-only log — source of truth for all scores)
create table care_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  event_type text not null,         -- 'feed','water','pet','chat','quest_complete','level_up'
  xp_earned integer not null default 0,
  metadata jsonb default '{}',      -- e.g. { quest_id, specimen_id }
  client_timestamp timestamptz not null,
  server_timestamp timestamptz default now()
);

-- Discovered specimens (for specimen leaderboard)
create table discovered_specimens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  specimen_id text not null,        -- matches local catalog ID
  discovered_at timestamptz default now(),
  unique(user_id, specimen_id)
);
```

#### Row Level Security (RLS)

Every table has RLS enabled. Policies:
- `profiles`: users can read all profiles in their team; can update only their own
- `teams`: users can read their own team; team creator can update
- `care_events`: **no direct INSERT** — writes go through `submit_care_event` RPC only; users can read their own team's events
- `discovered_specimens`: users can insert their own; can read their team's

#### Anti-Cheat: Server-Side Validation

All care events are submitted via a **Postgres RPC function** (`submit_care_event`), not direct table inserts. The function validates:

1. **Timestamp bounds**: `client_timestamp` must be within 24h of `now()` (rejects future or stale events)
2. **Rate limiting**: no more than 1 event of the same type per 5 seconds per user (matches the 8s UI cooldown with margin)
3. **XP bounds**: `xp_earned` must match known values for the event type (e.g., feed = 10 XP, chat = 5 XP)
4. **Sequential logic**: can't submit `level_up` without sufficient total XP in prior events

```sql
create or replace function submit_care_event(
  p_event_type text,
  p_xp_earned integer,
  p_client_timestamp timestamptz,
  p_metadata jsonb default '{}'
) returns uuid as $$
declare
  v_user_id uuid := auth.uid();
  v_last_event timestamptz;
  v_event_id uuid;
begin
  -- Validate timestamp (within 24h window)
  if p_client_timestamp > now() + interval '1 minute'
     or p_client_timestamp < now() - interval '24 hours' then
    raise exception 'Invalid timestamp';
  end if;

  -- Rate limit: 1 event per type per 5s
  select max(server_timestamp) into v_last_event
  from care_events
  where user_id = v_user_id and event_type = p_event_type;

  if v_last_event is not null and v_last_event > now() - interval '5 seconds' then
    raise exception 'Rate limited';
  end if;

  -- Validate XP matches event type
  if not validate_xp(p_event_type, p_xp_earned) then
    raise exception 'Invalid XP for event type';
  end if;

  -- Insert validated event
  insert into care_events (user_id, event_type, xp_earned, metadata, client_timestamp)
  values (v_user_id, p_event_type, p_xp_earned, p_metadata, p_client_timestamp)
  returning id into v_event_id;

  return v_event_id;
end;
$$ language plpgsql security definer;
```

#### Offline Queue & Sync

- When offline (or no account), care events queue in a local Zustand store (`syncQueue`)
- On reconnect, events are submitted in order via `submit_care_event` RPC
- Stale events (>24h old) are silently dropped from the queue (local state is already updated)
- **Local state is never overwritten by server** — server is authoritative only for leaderboards
- Network errors retry with exponential backoff (3 attempts, then re-queue)

### 4.3 Team Leaderboard (Weeks 14–15)

Leaderboard scores are **computed from validated `care_events`**, not submitted by the client.

#### Categories
- **Highest level**: total validated XP → derived level
- **Longest streak**: consecutive calendar days with at least 1 validated care event
- **Most specimens**: count of `discovered_specimens` rows
- **Quest completion rate**: `quest_complete` events / days active
- **Weekly/monthly boards** (rolling windows, not just all-time)

#### Implementation
- Postgres VIEW for real-time leaderboard computation (small team = fine performance):
  ```sql
  create view leaderboard_weekly as
  select
    p.display_name,
    p.team_id,
    sum(ce.xp_earned) as weekly_xp,
    count(distinct date(ce.client_timestamp)) as active_days,
    count(distinct ds.specimen_id) as specimens
  from profiles p
  left join care_events ce on ce.user_id = p.id
    and ce.client_timestamp > now() - interval '7 days'
  left join discovered_specimens ds on ds.user_id = p.id
  group by p.id, p.display_name, p.team_id;
  ```
- If performance degrades at scale, switch to a materialized view refreshed every 5 minutes via `pg_cron`
- Frontend: leaderboard panel (overlay, same pattern as journal/quests/achievements)
- Auto-refresh on open, cached for 60s

### 4.4 Activity Feed (Week 15–16)

- **In-app only** — no Slack bot (too much scope; users can paste snapshots from 4.1 instead)
- Supabase Realtime subscription on `care_events` filtered by `team_id`
- Feed shows recent team activity: "Alex found a Rare Crystal Mushroom!", "Jordan hit Level 10!"
- Display in the leaderboard panel as a secondary tab
- Events older than 7 days are hidden from the feed (query filter, not deletion)
- Renders max 20 most recent items

### 4.5 Team Invites & Referral Bonus (Week 16)

- **Team join codes** (from 4.2 auth setup) are the primary invite mechanic
- "Invite a teammate" button copies join code + a short blurb to clipboard:
  ```
  Join my Mossy team! 🌿
  Team: Eng Squad | Code: A7X2M9
  Download: [URL]
  ```
- **Referral tracking**: when a new user joins a team, the `created_by` user gets a bonus:
  - Both inviter and invitee receive a random uncommon+ specimen
  - Tracked via `profiles.referred_by` column
- No deep links needed — just a join code entered during sign-up

### Milestone: Mossy spreads through the team via leaderboards, activity feeds, and friendly competition ✓

---

## Phase 5: Focus Timer + Care System Rework

**Goal**: Replace the 4 manual care buttons with a Pomodoro focus timer. Stats are now driven by focus sessions, breaks, and engagement. This is the foundational change everything else builds on.

### 5.1 Focus Timer Core

- Built-in Pomodoro: 25 min focus → 5 min break → repeat 4x → 15 min long break
- Customizable durations in settings
- Moss enters "focused" animation state during sessions (eyes gently closed, leaves swaying, sparkle particles, saturation up)
- Timer completion: celebration animation + specimen discovery roll with boosted luck
- Timer uses `startedAt` timestamps (not `setInterval` decrements) to avoid WebView drift
- Persist `startedAt` to store so timer survives window hide/show

**New files:**
```
src/features/focus/
  FocusPanel.tsx              # Expanded view (380x560)
  FocusToggle.tsx             # Compact mode timer indicator
  components/
    TimerRing.tsx             # SVG circular countdown
    SessionProgress.tsx       # 4-segment Pomodoro cycle indicator
    BreakMenu.tsx             # Quick actions during breaks
    FocusCompletionPopup.tsx  # Session complete toast
  lib/
    focusTimer.ts             # Pure timer logic (timestamp-based)
    focusRewards.ts           # XP/stat/discovery bonus calculations
src/stores/focusStore.ts      # Timer state + focus stats + persistence
src/hooks/useFocusStore.ts    # Focus persistence bridge
```

**Store shape:**
```typescript
interface FocusState {
  status: 'idle' | 'focus' | 'short_break' | 'long_break' | 'paused';
  sessionIndex: number;          // 0-3 in cycle
  remainingMs: number;
  startedAt: number | null;
  pausedAt: number | null;
  focusDurationMs: number;       // default 25 * 60 * 1000
  shortBreakMs: number;          // default 5 * 60 * 1000
  longBreakMs: number;           // default 15 * 60 * 1000
  todayFocusMinutes: number;
  totalFocusMinutes: number;
  focusStreak: number;
  lastFocusDate: string | null;
  completedSessionsToday: number;
}
```

### 5.2 Care System Rework

Remove the 4 care buttons. Stats remain as visual indicators but are now driven by meaningful actions:

| Stat | New Driver |
|------|-----------|
| **Energy** | Focus session completion (+25-30) |
| **Hydration** | Taking breaks on time (+20-25) |
| **Happiness** | Mini-game play (+15), chat (+10), daily challenge (+15) |
| **Hunger** | General daily activity — any focus/game/challenge (+10-15) |

- Stat decay halves during active focus ("Mossy is resting while you work")
- Stat decay runs normally when idle
- Focus session completion: +30 XP (primary XP source)

**Files modified:**
- `src/stores/creatureStore.ts` — Remove `feed()`, `water()`, `pet()`, `sunlight()`, care cooldowns. Add `focusCare(stat, amount)`. Rework `decayStats()` for focus-aware decay rate. Keep `addXp()`, `recordCareDay()`, mood derivation, growth stages.
- `src/features/creature/components/CareButtons.tsx` — **Rewrite** into compact focus HUD: timer status + stat bars + focus start button + hub toggle

### 5.3 Quest System Rewire

Replace all 21 care-button quest templates with ~20 new focus/game/challenge/chat templates:
- Focus: "Complete 2 focus sessions" (+40 XP), "Focus 50 total minutes" (+35 XP), "Complete a full 4-session cycle" (+50 XP)
- Games: "Play a brain break game" (+20 XP), "Beat your memory match record" (+30 XP)
- Challenge: "Complete today's Daily Challenge" (+30 XP)
- Chat/Assistant: "Chat with Mossy 3 times" (+15 XP), "Set a reminder" (+10 XP)
- Streak: "Maintain a 7-day focus streak" (+60 XP)

**Files modified:**
- `src/features/quests/data/questTemplates.ts` — Replace all templates
- `src/features/quests/lib/questTracker.ts` — Replace `trackCareAction` with `trackFocusSession`, `trackGamePlay`, `trackChallengeComplete`
- `src/stores/questStore.ts` — Update type definitions

### 5.4 Achievement System Rewire

Rewrite 15 achievement definitions for focus-driven milestones:
- Growth: "First Focus" (1 session), "Deep Work" (4 sessions/day), growth stages stay
- Streak: Focus streak at 7, 14, 30, 60, 100 days
- Time: "Early Bird" / "Night Owl" (focus at specific times)
- Discovery: Stay as-is (already decoupled from care buttons)

**Files modified:**
- `src/features/achievements/data/achievements.ts` — Rewrite all definitions
- `src/stores/achievementStore.ts` — New condition evaluators
- `src/hooks/useAchievementStore.ts` — Rewire cross-store subscriptions to focusStore

### 5.5 Leaderboard + Sync Rewire

Update `CareEventType` union in `src/types/index.ts`:
```typescript
type CareEventType =
  | 'focus_complete' | 'game_score' | 'challenge_complete'
  | 'chat' | 'quest_complete' | 'level_up';
```

Update `CARE_EVENT_XP` in `src/stores/syncStore.ts`:
```typescript
export const CARE_EVENT_XP: Record<CareEventType, number> = {
  focus_complete: 30,
  game_score: 0,             // variable
  challenge_complete: 0,     // variable
  chat: 10,
  quest_complete: 0,         // variable
  level_up: 0,
};
```

**Sync store subscriptions** (`src/hooks/useSyncStore.ts`):
- Remove: subscriptions on `creatureStore.lastCareAction` (feed/water/pet/sunlight)
- Add: subscription on `focusStore.completedSessionsToday` → enqueue `focus_complete` event
- Keep: chat and quest_complete subscriptions (update chat XP from 5→10)

**Supabase migration**: `supabase/migrations/002_phase5_focus_events.sql`
- Replace `submit_care_event` RPC with new event type validation (keep legacy types for historical data)
- Replace `leaderboard_weekly` / `leaderboard_monthly` views with focus/game columns

### 5.6 Compact Mode Navigation Redesign

Replace the toggle row with a **hub button** that opens a quick-access grid of feature icons. Focus timer gets a dedicated always-visible spot.

**Files modified:**
- `src/App.tsx` — Hub navigation component
- New: `src/components/HubMenu.tsx` — Quick-access grid overlay

### Milestone: Mossy's engagement loop shifts from button-tapping to real productivity ✓

---

## Phase 6: Assistant Features + Chat Enhancement

**Goal**: Transform Mossy's LLM chat from flavor text into a lightweight desk assistant with notes, reminders, and contextual interactions.

### 6.1 Chat Enhancement

- **Contextual system prompt**: Include focus stats, streak, recent activity in the system prompt
- **Proactive Mossy**: During breaks, Mossy initiates with context-aware messages
- **Action triggers from chat**: "set a timer for 10 minutes" → starts a timer. "Remind me to check the deploy" → creates a reminder.
- **Intent parsing**: Keyword-based regex first, LLM fallback for ambiguous input
- **Chat XP**: 10 XP per conversation (up from 5)

### 6.2 Quick Notes

- Timestamped note list (Zustand → tauri-plugin-store)
- Add via chat ("Note: standup at 2pm") or dedicated input
- Simple list with delete — no rich text, no folders

### 6.3 Reminders

- Time-based: "Remind me in 30 minutes to check the build"
- Stored with trigger timestamp, toast popup when due
- Check interval: 60s against `Date.now()`
- Max 10 active reminders
- Toast: Mossy saying "Hey! You asked me to remind you about: ..."

### 6.4 Break Suggestions + Daily Brief

- After each focus session, contextual break suggestion from curated pool (~20-30)
- On first open each day, Mossy greets with yesterday's stats + today's streak

### Milestone: Mossy becomes a useful desk assistant, not just a pet ✓

---

## Phase 7: Brain Break Micro-Games

**Goal**: Two tight micro-games playable during Pomodoro breaks. Free during breaks, token-gated otherwise.

### 7.1 Game Infrastructure

- Game token system: 1 token earned per completed focus session, 1 spent per game outside of break time, free during breaks
- High score persistence + "New Record!" animation
- Scores sync to team leaderboard

### 7.2 Specimen Memory Match

- 4x3 grid of face-down cards using discovered specimen pixel art
- Match pairs within 60 seconds
- Score = pairs matched + time bonus
- Uses only player's discovered specimens (personalizes, rewards journal)

### 7.3 Mossy Says (Pattern Recall)

- Simon-says with 4 stat icons (Energy/Hydration/Happiness/Hunger)
- Mossy flashes sequence → player repeats → grows by 1 each round
- 120 seconds max or until failure
- Score = longest correct sequence

### Milestone: Breaks are genuinely fun and earned through focus ✓

---

## Phase 8: Daily Challenge

**Goal**: One puzzle per day — "Mossy's Word Garden." Wordle-model scarcity + shareable results.

### 8.1 Word List + Generator

- ~500 curated nature words (fern, lichen, spore, canopy, mycelium, etc.)
- Daily 5-word selection via seeded PRNG (reuse `mulberry32`)
- Deterministic, offline, no LLM needed

### 8.2 Puzzle UI

- Scrambled word with tappable/draggable letter tiles
- Unscramble 5 words in order, timer runs
- Score = speed + streak bonus (consecutive days completed)
- +25 XP for completion
- Shareable emoji result card

### Milestone: Daily scarcity creates a compelling return loop ✓

---

## Phase 9: Moss Mutations (Cosmetic Progression)

**Goal**: Visible cosmetic changes earned through real gameplay milestones.

### 9.1 Mutation Definitions

~8-12 mutations, each an SVG overlay + palette override:
- "Crystalline" — 10 total focus hours → icy blue palette
- "Luminous" — 30 daily challenges → glowing yellow-green
- "Neural" — 50+ pattern recall score → pulsing nerve overlay
- "Mycelial" — all 32 specimens → network thread overlay
- "Deep Focus" — 100 total focus hours → zen aura
- "Blazing" — 60-day focus streak → ember overlay
- "Iridescent" — all achievements + all specimens → rainbow shimmer

### 9.2 Gallery + Selection

- Gallery UI same pattern as AchievementGallery (locked/unlocked grid)
- User selects active mutation (stored in mutationStore)
- Mutation applied as overlay layer in MossCreature SVG

### Milestone: Long-term players have visible "flex" cosmetics ✓

---

## Phase 10: Polish & Distribution

**Goal**: Package everything up for distribution. Build features first, package last.

### 10.1 Installer & Auto-Updates

- Ed25519 signing keypair, `tauri-plugin-updater` with GitHub Releases
- `.dmg` (macOS), `.msi` (Windows), `.AppImage` (Linux)
- `tauri-action` GitHub Action for automated builds
- App checks for updates on launch

### 10.2 Onboarding Flow (Updated for Focus-First)

90-second first-launch experience:
1. Empty terrarium appears
2. "Tap to scatter moss spores" → particle animation
3. "Give your terrarium a name" → text input
4. First sprout appears → Mossy introduces itself
5. **"Start your first focus session to help Mossy grow!"** → teaches focus timer
6. "Come back tomorrow to see how Mossy grew!" → plants the return hook
7. Model download if not present

### 10.3 QA & Cross-Platform

- macOS 13+, Windows 10/11, target Linux distros
- Transparent window, tray behavior, high-DPI, dark/light themes
- Auto-update flow, battery/resource impact
- llama-server sidecar on each platform
- Focus timer accuracy across platforms

### Milestone: Mossy is installable, auto-updating, polished for distribution ✓

---

## Dependency Graph

```
Phase 5 (Focus + Care Rework) ──┐
                                 ├──▶ Phase 7 (Mini-Games — needs break gate + tokens)
Phase 6 (Assistant + Chat) ──────┤
                                 ├──▶ Phase 9 (Mutations — needs all milestone sources)
Phase 8 (Daily Challenge) ───────┘
                                       │
Phase 10 (Polish & Distribution) ◀─────┘  (ships last)
```

Phases 6 and 8 can start in parallel with Phase 5's later stages.

---

## Dependency Reference

### Cargo.toml (`src-tauri/Cargo.toml`)

```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
tauri-plugin-store = "2"
tauri-plugin-http = { version = "2", features = ["unsafe-headers"] }
tauri-plugin-notification = "2"
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
reqwest = { version = "0.12", features = ["json", "stream"] }
futures = "0.3"

[target.'cfg(not(any(target_os = "android", target_os = "ios")))'.dependencies]
tauri-plugin-positioner = { version = "2", features = ["tray-icon"] }
tauri-plugin-updater = "2"

[profile.release]
codegen-units = 1
lto = true
opt-level = "s"
panic = "abort"
strip = true
```

### package.json dependencies

```json
{
  "dependencies": {
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-http": "~2",
    "@tauri-apps/plugin-notification": "~2",
    "@tauri-apps/plugin-opener": "^2",
    "@tauri-apps/plugin-positioner": "~2",
    "@tauri-apps/plugin-store": "~2",
    "@tauri-apps/plugin-updater": "~2",
    "@supabase/supabase-js": "^2",
    "motion": "latest",
    "react": "^19",
    "react-dom": "^19",
    "tailwindcss": "^4",
    "zustand": "latest"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4",
    "@tauri-apps/cli": "^2",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4",
    "jsdom": "latest",
    "typescript": "~5.8",
    "vite": "^7",
    "vitest": "latest"
  }
}
```

### Capabilities (`src-tauri/capabilities/default.json`)

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "store:default",
    {
      "identifier": "shell:allow-spawn",
      "allow": [
        { "name": "llama-server", "sidecar": true }
      ]
    },
    "shell:allow-kill",
    "notification:default",
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-close",
    "core:window:allow-set-focus",
    "core:window:allow-start-dragging",
    "core:window:allow-set-always-on-top",
    "core:window:allow-set-ignore-cursor-events",
    "core:window:allow-is-visible",
    "core:window:allow-set-size",
    "core:window:allow-set-resizable"
  ]
}
```

---

## LLM Configuration Reference

### Primary: Qwen3.5 0.8B via Bundled llama-server (Local)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | Qwen3.5 0.8B Q4_K_M | Smallest viable model, ~1.5 GB RAM |
| GGUF file | `qwen3.5-0.8b-q4_k_m.gguf` | ~0.6 GB download from HuggingFace |
| Server | `llama-server` sidecar | Bundled binary, no external deps |
| Port | `8384` | Avoids conflicts with common services |
| `temperature` | `0.8` | Creative but consistent |
| `max_tokens` | `150` | Cap response length for short cute replies |
| Thinking mode | Disabled via `/no_think` | Speed over reasoning |
| System prompt | < 200 tokens | Concise for 0.8B model |
| Streaming | SSE (OpenAI-compatible) | Standard `/v1/chat/completions` |

### llama-server API Endpoints

| Action | Method | URL |
|--------|--------|-----|
| Health check | GET | `http://localhost:8384/health` |
| Chat (streaming) | POST | `http://localhost:8384/v1/chat/completions` |

### Minimum System Requirements

| Resource | Requirement |
|----------|------------|
| macOS | 13 Ventura+ |
| RAM | 4 GB minimum (~1.5 GB for model) |
| Disk | ~0.6 GB for model + ~100 MB for app + sidecar |
| CPU/GPU | Apple Silicon recommended (Metal acceleration) |
| Intel Macs | Supported but slower inference |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Idle CPU (Mossy visible, no chat) | < 2% |
| Idle CPU (Mossy hidden) | ~0% |
| RAM (app only, model unloaded) | < 50 MB |
| RAM (during chat, model loaded) | ~1.5 GB (sidecar + model) |
| Chat response latency | < 2s for 1-3 sentence response |
| Animation frame rate | 60fps (30fps minimum during transitions) |
| Breathing animation | CSS-only, zero JS cost |
| Store write frequency | Debounced at 2s, max 1 write per decay tick |
