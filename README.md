# Mossy

A cute, AI-powered desktop moss companion built with Tauri v2.

<img width="201" height="196" alt="image" src="https://github.com/user-attachments/assets/2b74b9e7-efd5-420f-b494-673ab8949ad0" />


## About

Mossy is a tiny animated moss creature that lives on your desktop. Grow it through Pomodoro focus sessions, discover specimens, play brain-break mini-games, and chat with it — all powered by a local LLM that runs entirely on your machine, no API keys required.

## Features

- **Pixel art creature** with mood-driven animations, particle effects, and seasonal overlays
- **Pomodoro focus timer** — the primary way to care for Mossy (replaces care buttons)
- **Local LLM chat** via bundled llama-server (Qwen3.5 0.8B) — completely offline, no accounts
- **Specimen discovery** — 32 organisms with rarity-weighted rolls (common → legendary)
- **Daily quests** — 3 rotating quests with XP rewards
- **Achievements & streaks** — badges, care calendar, streak shields
- **Brain break games** — Memory Match and Mossy Says, free during breaks
- **Assistant features** — quick notes, reminders, daily briefing
- **Seasonal themes** + time-of-day theming
- **Leveling & XP** — grow your moss through multiple life stages
- **Team leaderboards** — opt-in competitive features via Supabase
- **Warm terrarium UI** — cozy desktop companion aesthetic

## Tech Stack

Tauri v2 (Rust) · React 19 · TypeScript · Vite 7 · Zustand · Tailwind CSS v4 · Motion · Supabase (opt-in)

## Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Bun](https://bun.sh/)
- Platform build tools for Tauri — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/ahontasg/mossy.git
cd mossy

# Install frontend dependencies
bun install

# Download the llama-server sidecar binary
bash scripts/fetch-llama-server.sh

# Run in development mode
bun tauri dev
```

On first launch, Mossy will download the LLM model (~600 MB) automatically.

## Project Structure

```
src/                    # React frontend
  components/           # Shared UI (NavTabs, PanelCard, Toast, icons)
  features/
    creature/           # Animated SVG character + pixel art data
    chat/               # Chat panel + LLM streaming
    focus/              # Pomodoro timer + session tracking
    games/              # Brain break micro-games
    quests/             # Daily quest system
    journal/            # Specimen collection
    achievements/       # Badges, streaks, care calendar
    social/             # Auth, leaderboard, activity feed
    settings/           # App settings
  stores/               # 14 Zustand stores (creature, focus, chat, game, quest, ...)
  hooks/                # Persistence bridges + shared hooks
  lib/                  # Utilities

src-tauri/              # Rust backend
  src/
    commands/           # Tauri IPC commands
    services/           # LLM proxy, sidecar, model download
    models/             # Data structures
```

## License

[MIT](LICENSE)
