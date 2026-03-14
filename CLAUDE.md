# Mossy — Project Guidelines

## What is this?
A cute, AI-powered desktop moss companion built with Tauri v2. A small animated moss creature lives in a warm terrarium-styled window on the user's desktop, grows through Pomodoro focus sessions and micro-games, chats via a local LLM (Qwen3.5 0.8B via bundled llama-server), and discovers specimen organisms over time.

## Tech Stack
- **Framework**: Tauri v2 (Rust backend + React frontend in WebView)
- **Frontend**: React 19 + TypeScript 5.8 + Vite 7
- **Styling**: Tailwind CSS v4.2 (via `@tailwindcss/vite` plugin, configured in CSS not JS)
- **Animations**: Motion (formerly Framer Motion) + CSS keyframes for idle loops
- **State**: Zustand with `subscribeWithSelector` middleware
- **LLM**: Qwen3.5 0.8B Q4_K_M via bundled llama-server sidecar (local, free) — port 8384
- **Persistence**: tauri-plugin-store v2 (local JSON, `autoSave: false`, manual debounced saves)
- **Social (opt-in)**: Supabase (auth, Postgres, Realtime) — gated by `isSupabaseConfigured()`
- **Testing**: Vitest 4 + React Testing Library + happy-dom
- **Package Manager**: Bun (not npm)

## Commands
- `bun tauri dev` — Run the app in development mode
- `bun tauri build` — Build for production
- `bun run dev` — Start Vite dev server only (frontend)
- `bun run build` — Build frontend only (tsc + vite build)
- `bun test` — Run Vitest tests
- `bun test:run` — Run tests once (no watch)
- `cargo test` — Run Rust tests (from `src-tauri/`)

## Project Structure
```
src/
  main.tsx                    # Entry point, imports index.css
  App.tsx                     # Root component, NavTabs + panel routing
  index.css                   # Tailwind import + @theme tokens + warm terrarium palette
  components/
    NavTabs.tsx               # Bottom tab bar (4 primary + More overflow)
    PanelCard.tsx             # Shared overlay panel container
    Toast.tsx                 # Toast system (success, achievement, discovery, info, reminder)
    MiniPixelArt.tsx          # Inline pixel art renderer
    icons.tsx                 # Centralized inline SVG icon components
  hooks/
    useTauriStore.ts          # Core persistence bridge (load/save/decay timer)
    useTimeOfDay.ts           # Time-of-day hook + CSS property updates
    useSeason.ts              # Season detection + data-season attribute + CSS vars
    useWindowResize.ts        # Animated expand/collapse (300x420 ↔ 380x600)
    useFocusStore.ts          # Focus persistence bridge + creature isFocusing sync
    useGameStore.ts           # Game persistence bridge
    useQuestStore.ts          # Quest persistence + cross-store event subscriptions
    useAchievementStore.ts    # Achievement checker + multi-store subscriptions
    useJournalStore.ts        # Journal persistence + 5-min discovery timer
    useAssistantStore.ts      # Assistant persistence (notes, reminders)
    useAuthStore.ts           # Auth persistence + onAuthStateChange listener
    useSyncStore.ts           # Sync persistence + cross-store subscriptions
    useSettingsStore.ts       # Settings persistence bridge
  lib/                        # Utilities (typed invoke wrapper, time helpers, season, audio)
  types/                      # Shared TypeScript types
  stores/
    creatureStore.ts          # Core: stats, mood, XP, growth, focusCare(), isFocusing
    focusStore.ts             # Pomodoro timer state + focus stats
    chatStore.ts              # Chat messages, streaming, LLM status
    gameStore.ts              # Game tokens, high scores, session state
    questStore.ts             # Daily quests, completions
    achievementStore.ts       # Badges, care history, totals
    assistantStore.ts         # Notes, reminders, daily brief
    journalStore.ts           # Discovered specimens, lastDiscovery
    authStore.ts              # Auth + profile + team state
    syncStore.ts              # Offline sync queue (local → remote)
    leaderboardStore.ts       # Leaderboard data (weekly/monthly, 60s cache)
    feedStore.ts              # Activity feed (Supabase Realtime)
    settingsStore.ts          # Sound toggle, preferences
    uiStore.ts                # Active panel, navigation state
  assets/                     # SVGs, icons, sounds
  features/
    creature/                 # Animated SVG character + animations + pixel art data
    chat/                     # Chat panel + LLM streaming + system prompt
    focus/                    # Pomodoro timer (FocusPanel, TimerRing, SessionProgress)
    games/                    # Brain break micro-games (Memory Match, Mossy Says)
    quests/                   # Daily quests (templates, generator, tracker)
    journal/                  # Specimen collection (32 organisms, discovery engine)
    achievements/             # Badges, streaks, care calendar
    social/                   # Auth, leaderboard, activity feed, snapshots
    settings/                 # App settings
    stats/                    # (legacy) Stat bar components
  test/
    setup.ts                  # @testing-library/jest-dom/vitest
    smoke.test.ts             # Basic smoke tests
    mocks/tauri.ts            # vi.mock for @tauri-apps/api/*
    mocks/supabase.ts         # vi.mock for @supabase/supabase-js

src-tauri/src/
  main.rs                     # Entry point
  lib.rs                      # Builder setup, plugin registration, tray icon
  commands/                   # Tauri commands by domain
  models/                     # Rust data structures
  state/                      # Managed app state
  services/                   # Business logic (LLM proxy, sidecar, model download)
```

## Architecture Decisions

### Window
- Opaque, frameless, always-on-top, warm terrarium aesthetic
- Compact: 300x420, Expanded (chat/focus): 380x600, animated resize via `useWindowResize`
- `transparent: false`, `macOSPrivateApi: false`, `shadow: true`
- `visibleOnAllWorkspaces: true`, `skipTaskbar: true`
- Start hidden (`visible: false`), show on tray click
- Drag via `data-tauri-drag-region` attribute

### Animation
- CSS `@keyframes` for the breathing loop (zero JS cost, runs on compositor)
- Motion `variants` for mood-driven state transitions (propagate via parent `<motion.g animate={mood}>`)
- Motion `useAnimation` for imperative blink cycle (random 2-6s interval)
- Motion `AnimatePresence` for particle spawn/despawn
- Growth stages use layered cross-fade (NOT path morphing)
- All SVG in a single root `<svg viewBox="0 0 256 256">`
- All mouth path variants must have identical SVG command structure

### State Management
- Zustand for all app state, 14 stores organized by domain
- `subscribeWithSelector` for slice-based persistence subscriptions
- Each store has a `useXxxStore.ts` hook handling hydration, save, and cleanup
- Timer-based stat decay: `setInterval` at 30s calling `getState().decayStats()`
- Stat decay halved during active focus sessions
- Persistence: 2s debounced saves to tauri-plugin-store + immediate save on close
- Offline decay: calculate missed intervals on startup, cap at 120 ticks

### LLM (Qwen3.5 0.8B via Bundled llama-server)
- Bundled `llama-server` sidecar binary (no external dependencies)
- All LLM calls go through Rust commands (never from frontend directly)
- SSE streaming on `http://127.0.0.1:8384/v1/chat/completions`
- Rust `reqwest` streams SSE, forwards tokens via Tauri Channel (`tauri::ipc::Channel<T>`)
- `max_tokens: 150`, `temperature: 0.8`, thinking disabled (`/no_think`)
- System prompt includes creature stats, mood, focus context
- Sliding window of 6 messages for conversation history
- Health check: `GET http://127.0.0.1:8384/health`
- Model auto-downloads from HuggingFace (~0.6 GB) on first launch
- Sidecar killed on app exit via `RunEvent::Exit`

### Styling
- Tailwind v4 configured via `@tailwindcss/vite` plugin (no tailwind.config.js)
- Warm terrarium palette in oklch: `--color-surface-base`, `--color-terracotta-*`
- Time-of-day theming via CSS custom properties in `@theme` + JS overrides
- `data-time` attribute on `<html>` for time-of-day variants
- `data-season` attribute on `<html>` for seasonal palette

### Security
- Never expose API keys or secrets to the frontend
- LLM calls go through Rust `reqwest` to `127.0.0.1:8384` (never from frontend)
- Supabase anon key is public by design; RLS is the security boundary
- Social features gated by `isSupabaseConfigured()` — app works fully offline
- Shell permissions scoped to `llama-server` sidecar only
- `freezePrototype: true` in CSP config
- All Tauri commands explicitly registered via `generate_handler![]`

### Testing
- Frontend: Vitest + React Testing Library + happy-dom
- Mock Tauri APIs via `vi.mock` in `src/test/mocks/tauri.ts`
- Mock Supabase via `vi.mock` in `src/test/mocks/supabase.ts`
- Rust: `cargo test` — test commands as pure functions
- No E2E on macOS (no WKWebView WebDriver) — defer to CI Linux

### Navigation & Panels
- `NavTabs` bottom bar: 4 primary tabs (Creature, Focus, Chat, Journal) + More overflow
- `PanelCard` overlays for secondary views (quests, achievements, settings, social, games)
- `uiStore` tracks active panel state
- Window expand/collapse animated via `useWindowResize`

### Focus Timer
- Pomodoro cycle: 25 min focus → 5 min break → repeat 4x → 15 min long break
- Timestamp-based timer logic (survives window hide/show, avoids WebView drift)
- Primary care driver: focus sessions boost stats + earn 30 XP each
- Game tokens earned per completed session (1 token = 1 game outside breaks)

### Assistant Features
- Intent parsing: keyword-based regex first, LLM fallback for ambiguous input
- Quick notes: timestamped list, addable via chat ("Note: ...") or dedicated input
- Reminders: time-based, 60s check interval, max 10 active, toast popup when due
- Daily brief: yesterday's stats + today's streak on first open
- Proactive break messages during Pomodoro breaks

### Games
- 2 micro-games: Memory Match (4x3 specimen cards, 60s) and Mossy Says (pattern recall, 120s)
- Token system: free during breaks, 1 token per game otherwise
- High scores persisted + "New Record!" animation

## Conventions
- Use `bun` for all package operations (never `npm`)
- Feature-based organization: each feature is self-contained in `src/features/`
- Only promote to shared `components/`/`hooks/`/`lib/` when genuinely used by 2+ features
- Typed invoke wrapper in `src/lib/tauri.ts` for all Tauri command calls
- Rust commands organized by domain in `src-tauri/src/commands/`
- Keep Rust code minimal — business logic in frontend where possible
- `NavTabs` for primary navigation, `PanelCard` for overlay panels
- Icons centralized in `src/components/icons.tsx` (inline SVG components)
- Toast system with variants (success, achievement, discovery, info, reminder)
- Persistence bridges: each store has a `useXxxStore.ts` hook
- Social features gated behind `isSupabaseConfigured()`

## Reference
- Full implementation plan: `IMPLEMENTATION_PLAN.md`
- Tauri v2 docs: https://v2.tauri.app
- llama-server API: http://127.0.0.1:8384 (when sidecar running)
- Supabase configured via `.env` (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`)
