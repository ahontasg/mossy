# Mossy — Implementation Plan

> A phased roadmap for building a cute, AI-powered desktop moss companion in Tauri v2.
> Solo developer, React/TypeScript frontend, minimal Rust backend, local LLM via Ollama + Qwen.
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
| LLM | Qwen3 4B via Ollama (local, free, offline-capable) |
| Persistence | tauri-plugin-store v2 (local JSON) |
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

## Phase 1.5: UX & Engagement Foundation

**Goal**: Make in-window interactions intuitive, satisfying, and habit-forming before adding the LLM.

### 1.5.1 — Visible Progression

- XP progress ring around the level badge (fills as XP accumulates, resets on level-up — clearly an XP indicator, not a stat bar)
- Growth stage label on hover or in tray menu
- Subtle glow/pulse animation when close to leveling up

### 1.5.2 — Streak Indicator

- Small day-count / streak flame icon near the level badge
- Persisted in store alongside stats
- "Care day" = at least 1 care action that calendar day
- **Streak Shield**: auto-granted 1/week — if you miss a day, the shield is consumed instead of breaking the streak (not punitive)
- Visual indicator when shield is active vs. consumed

### 1.5.3 — Return Moment ("While you were away...")

- On startup after >1hr absence, brief overlay: "While you were away, Mossy rested. Hunger dropped to 42%."
- Creates context for the stat decay and motivates immediate care
- Dismisses on first care action or after 3s
- Shows which stats dropped the most (highlights urgency)

### 1.5.4 — Feedback Juice

- Floating "+20" text that rises and fades after care actions (inside SVG, above creature)
- Stat bar fill animation (already have `transition-all duration-500`)
- Subtle screen flash / particle burst on level-up
- Satisfying "ding" sound on level-up (muted by default)

### Milestone: Mossy feels alive, rewarding, and habit-forming before chat is even added ✓

---

## Phase 2: Mossy Talks — Local LLM Chat (Weeks 4–6)

**Goal**: Add Ollama/Qwen-powered chat so Mossy has personality and feels like a personal AI companion.

### 2.1 Ollama Integration — Rust Backend (Week 4)

**Health check + model management:**
- On app startup, check if Ollama is running: `GET http://localhost:11434/`
- If not running, show a setup screen directing user to install Ollama
- Check if `qwen3:4b` is installed: `GET /api/tags`
- If not installed, trigger pull with progress: `POST /api/pull {"model": "qwen3:4b", "stream": true}`
- Show download progress in the UI (~2.5 GB download)

**Chat command with streaming via Tauri Channels:**

```rust
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
enum ChatEvent {
    Delta { text: String },
    Done { full_text: String },
    Error { message: String },
}

#[tauri::command]
async fn chat_with_mossy(
    messages: Vec<Message>,
    system_prompt: String,
    on_event: Channel<ChatEvent>,
) -> Result<(), String> {
    // POST to http://localhost:11434/api/chat
    // Stream newline-delimited JSON chunks
    // Send each token via on_event.send(ChatEvent::Delta { text })
    // Send ChatEvent::Done when stream ends
}
```

**Ollama API config per request:**
- `model`: `"qwen3:4b"`
- `stream`: `true`
- `keep_alive`: `"3m"` (auto-unload after 3 min idle — zero resources when not chatting)
- `options.temperature`: `0.8`
- `options.num_predict`: `150` (cap response length for short, cute replies)

### 2.2 System Prompt — Mossy's Personality (Week 4)

Keep under ~200 tokens for best results with a 4B model:

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

### 2.3 Expandable Chat UI (Week 5)

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

### 2.4 Conversation History (Week 5)

- Sliding window of 6 messages (3 user + 3 assistant turns)
- Validate alternating roles before sending
- System prompt provides continuity (stats injected fresh each call)
- Persist conversation to store (clear on app restart — casual companion, not perfect memory)
- Each conversation earns 5 XP

### 2.5 Ollama Setup Flow (Week 6)

First-run experience when Ollama isn't detected:
1. "Mossy needs a brain!" — friendly explanation
2. Link to ollama.com download + `brew install ollama` instructions
3. "Check again" button that re-tests connection
4. Once connected, auto-pull `qwen3:4b` with progress bar
5. "Mossy is ready to chat!" — first conversation

Settings panel option to:
- Change model (advanced users can pick different Qwen sizes)
- Configure keep_alive timeout
- Test connection status

### Milestone: Mossy chats with personality locally, no API costs, works offline ✓

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

**Goal**: Turn Mossy into a shared workplace experience with friendly competition.

### 4.1 Shareable Growth Snapshots (Weeks 11–12)

Generate daily snapshot:
```
🌿 Mossy Day 23 | Lvl 5
██████████░░ Care Rhythm
🍄 New: Crystal Cap Mushroom!
✨ 12/30 specimens discovered
```
One-click "Copy to clipboard" for Slack/Teams.

### 4.2 Company Leaderboard (Weeks 13–14)

Simple Supabase (free tier):
- Tables: `users`, `specimens`, `scores`
- **Categories**: highest level, longest streak, most specimens, best stat averages, quest completion rate
- **Weekly/monthly boards** (not just all-time)
- **Department/team groupings**
- Mini-game high scores (Phase 6)
- **Opt-in only** with anonymous display name option

### 4.3 Activity Feed (Week 14)

- Opt-in feed: "Sarah's Mossy found a Rare Crystal Mushroom!", "Dev team's average level hit 10!"
- Can be Slack channel, in-app feed, or both
- Creates social proof and FOMO (the good kind)

### 4.4 Team Terrariums (Weeks 15–16)

- Departments/teams share a collective garden
- Each person's Mossy appears in the shared view
- Team aggregate stats: combined level, collective streak, team specimens
- Inter-team friendly competition

### 4.5 Referral Mechanic (Week 16)

- "Mossy wants a neighbor!" — share invite link
- When someone joins from your invite: both get a rare specimen
- Viral growth loop for company-wide adoption

### Milestone: Mossy spreads through the company via sharing and friendly competition ✓

---

## Phase 5: Polish & Distribution (Weeks 17–20)

**Goal**: Make Mossy installable, auto-updating, and delightful.

### 5.1 Installer & Auto-Updates (Week 17)

- Generate Ed25519 signing keypair: `bun tauri signer generate`
- Configure `tauri-plugin-updater` with GitHub Releases endpoint
- Build installers: `.dmg` (macOS), `.msi` (Windows), `.AppImage` (Linux)
- `tauri-action` GitHub Action for automated builds + `latest.json` manifest
- App checks for updates on launch

### 5.2 Onboarding Flow (Week 18)

90-second first-launch experience (no account required):
1. Empty terrarium appears
2. "Tap to scatter moss spores" → particle animation
3. "Give your terrarium a name" → text input
4. First sprout appears → Mossy introduces itself
5. First care action tutorial (mist the terrarium)
6. "Come back tomorrow to see what grew!" → plants the return hook
7. Ollama setup if not detected (see Phase 2.5)

### 5.3 Sound Design (Week 18–19)

- Ambient terrarium sounds (gentle rain, soft wind — toggleable)
- Care action sounds: spray for watering, soft crunch for feeding
- Discovery chime for new specimens
- Mossy's "voice": soft chirps during chat (not actual speech)
- **Mute by default** — respect the workplace

### 5.4 Notifications (Week 19)

- Native OS notifications via `tauri-plugin-notification`
- Opt-in, gentle, max 1/day:
  - "Something new appeared in your terrarium 🌿"
  - "Mossy is thriving today! ✨"
- **Never** "Mossy misses you" or guilt-based messaging

### 5.5 QA & Cross-Platform (Week 20)

- Test on macOS 13+, Windows 10/11, target Linux distros
- Transparent window rendering on each platform
- System tray behavior (left-click, right-click)
- High-DPI and dark/light OS themes
- Auto-update flow end-to-end
- Battery/resource impact: leave running 8 hours, check CPU/memory
- Ollama integration on each platform

### Milestone: Mossy is installable, auto-updating, polished for distribution ✓

---

## Phase 6: Mini-Games & Growth (Months 6–12+)

**Goal**: Deepen engagement with competitive mini-games and long-term growth systems.

### 6.1 Mini-Games

- **Watering accuracy game**: tap-timing minigame, high scores go to leaderboard
- **Specimen trivia**: Mossy quizzes you on discovered organisms
- **Growth race**: who can level up Mossy the fastest in a week
- Mini-game scores contribute to leaderboard rankings
- Unlock new mini-games at growth stage milestones

### 6.2 Long-Term Growth

Based on real user feedback:
- Which features get used most? Double down.
- Terrarium customization (containers, backgrounds, decorations)
- Terrarium visiting (view friends' terrariums, leave gifts)
- Seasonal events (spring bloom festival, winter frost)
- Productivity integrations (break reminders, task celebrations)

### 6.3 Mobile Expansion

- Tauri Mobile (shared React codebase)
- Sync state between desktop and mobile
- Push notifications for mobile

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
  "description": "Main window capabilities",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "store:default",
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
    {
      "identifier": "http:default",
      "allow": [
        { "url": "http://localhost:11434/**" },
        { "url": "https://api.anthropic.com/**" }
      ]
    }
  ]
}
```

---

## LLM Configuration Reference

### Primary: Qwen3 4B via Ollama (Local)

| Setting | Value | Rationale |
|---------|-------|-----------|
| Model | `qwen3:4b` | Best quality-to-size ratio for persona chat |
| Quantization | Q4_K_M (Ollama default) | ~2.5 GB disk, ~3-4 GB RAM |
| `keep_alive` | `"3m"` | Auto-unload after 3 min idle — zero resources |
| `temperature` | `0.8` | Creative but consistent |
| `num_predict` | `150` | Cap response length for short cute replies |
| `top_p` | `0.9` | Standard diversity |
| Thinking mode | Disabled | Speed over reasoning |
| System prompt | < 200 tokens | Concise for 4B model |
| Streaming | Newline-delimited JSON | Simpler than SSE |

### Ollama API Endpoints

| Action | Method | URL |
|--------|--------|-----|
| Health check | GET | `http://localhost:11434/` |
| List models | GET | `http://localhost:11434/api/tags` |
| Pull model | POST | `http://localhost:11434/api/pull` |
| Chat (streaming) | POST | `http://localhost:11434/api/chat` |

### Minimum System Requirements

| Resource | Requirement |
|----------|------------|
| macOS | 14 Sonoma+ (for Ollama) |
| RAM | 8 GB minimum (4 GB for model + 4 GB for OS/apps) |
| Disk | ~3 GB for model + ~50 MB for app |
| CPU/GPU | Apple Silicon recommended (Metal acceleration) |
| Intel Macs | Supported but slower inference |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Idle CPU (Mossy visible, no chat) | < 2% |
| Idle CPU (Mossy hidden) | ~0% |
| RAM (app only, model unloaded) | < 50 MB |
| RAM (during chat, model loaded) | ~3-4 GB (temporary) |
| Chat response latency | < 2s for 1-3 sentence response |
| Animation frame rate | 60fps (30fps minimum during transitions) |
| Breathing animation | CSS-only, zero JS cost |
| Store write frequency | Debounced at 2s, max 1 write per decay tick |
