# Mossy — Project Guidelines

## What is this?
A cute, AI-powered desktop moss companion built with Tauri v2. A small animated moss creature lives in a transparent window on the user's desktop, reacts to care (feeding, watering, petting), chats via a local LLM (Qwen3 4B via Ollama), and discovers specimen organisms over time.

## Tech Stack
- **Framework**: Tauri v2 (Rust backend + React frontend in WebView)
- **Frontend**: React 19 + TypeScript 5.8 + Vite 7
- **Styling**: Tailwind CSS v4.2 (via `@tailwindcss/vite` plugin, configured in CSS not JS)
- **Animations**: Motion (formerly Framer Motion) + CSS keyframes for idle loops
- **State**: Zustand with `subscribeWithSelector` middleware
- **LLM**: Qwen3 4B via Ollama (local, free) — API at `http://localhost:11434`
- **Persistence**: tauri-plugin-store v2 (local JSON, `autoSave: false`, manual debounced saves)
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
  App.tsx                     # Root component
  index.css                   # Tailwind import + @theme tokens + transparent body
  components/                 # Shared UI primitives (Button, Card, Panel)
  hooks/                      # Shared hooks (useTimeOfDay, useTauriStore)
  lib/                        # Utilities (typed invoke wrapper, time helpers)
  types/                      # Shared TypeScript types
  stores/                     # Zustand stores (creatureStore, settingsStore)
  assets/                     # SVGs, icons, sounds
  features/
    creature/                 # Animated SVG character + animations
    chat/                     # Chat panel + Ollama streaming
    stats/                    # Care system + stat bars
    journal/                  # Specimen collection
    settings/                 # App settings
    achievements/             # Badges + streaks
  test/
    setup.ts                  # @testing-library/jest-dom/vitest
    mocks/tauri.ts            # vi.mock for @tauri-apps/api/*
    test-utils.tsx            # Custom render with providers

src-tauri/src/
  main.rs                     # Entry point
  lib.rs                      # Builder setup, plugin registration, tray icon
  commands/                   # Tauri commands by domain
  models/                     # Rust data structures
  state/                      # Managed app state
  services/                   # Business logic (persistence, LLM proxy)
```

## Architecture Decisions

### Window
- Transparent, frameless, always-on-top, 256x256, visible on all workspaces
- `macOSPrivateApi: true` required for transparency (disqualifies Mac App Store — fine for direct distribution)
- `shadow: false` to prevent rectangular shadow on transparent window
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
- Zustand for all app state (creature stats, settings, chat history)
- `subscribeWithSelector` for slice-based persistence subscriptions
- Timer-based stat decay: `setInterval` at 30s calling `getState().decayStats()`
- Persistence: 2s debounced saves to tauri-plugin-store + immediate save on close
- Offline decay: calculate missed intervals on startup, cap at 120 ticks

### LLM (Qwen3 4B via Ollama)
- All LLM calls go through Rust commands (never from frontend directly)
- Streaming via Tauri Channels (`tauri::ipc::Channel<T>`), NOT events
- Ollama streams newline-delimited JSON (not SSE)
- `keep_alive: "3m"` — model auto-unloads when idle, zero resources
- `num_predict: 150` — enforce short responses
- System prompt < 200 tokens for best 4B model results
- Sliding window of 6 messages for conversation history
- Health check on startup: `GET http://localhost:11434/`

### Styling
- Tailwind v4 configured via `@tailwindcss/vite` plugin (no tailwind.config.js)
- Time-of-day theming via CSS custom properties in `@theme` + JS overrides
- Never apply `bg-*` to html/body/root — breaks transparency
- `data-time` attribute on `<html>` for time-of-day variants

### Security
- Never expose API keys or secrets to the frontend
- HTTP permissions scoped to `localhost:11434` and `api.anthropic.com`
- `freezePrototype: true` in CSP config
- All Tauri commands explicitly registered via `generate_handler![]`

### Testing
- Frontend: Vitest + React Testing Library + jsdom
- Mock Tauri APIs via `vi.mock` in `src/test/mocks/tauri.ts`
- Rust: `cargo test` — test commands as pure functions
- No E2E on macOS (no WKWebView WebDriver) — defer to CI Linux

## Conventions
- Use `bun` for all package operations (never `npm`)
- Feature-based organization: each feature is self-contained in `src/features/`
- Only promote to shared `components/`/`hooks/`/`lib/` when genuinely used by 2+ features
- Typed invoke wrapper in `src/lib/tauri.ts` for all Tauri command calls
- Rust commands organized by domain in `src-tauri/src/commands/`
- Keep Rust code minimal — business logic in frontend where possible

## Reference
- Full implementation plan: `IMPLEMENTATION_PLAN.md`
- Tauri v2 docs: https://v2.tauri.app
- Ollama API: http://localhost:11434 (when running)
