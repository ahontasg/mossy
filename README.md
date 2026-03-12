# Mossy

A cute, AI-powered desktop moss companion built with Tauri v2.

<img width="201" height="196" alt="image" src="https://github.com/user-attachments/assets/2b74b9e7-efd5-420f-b494-673ab8949ad0" />


## About

Mossy is a tiny animated moss creature that lives on your desktop. Feed it, water it, pet it, and chat with it — all powered by a local LLM that runs entirely on your machine, no API keys required.

## Features

- **Pixel art creature** with mood-driven animations and particle effects
- **Tamagotchi-style care** — hunger, thirst, happiness stats that decay over time
- **Local LLM chat** via bundled llama-server (Qwen3.5 0.8B) — completely offline, no accounts
- **Time-of-day theming** — the world changes with the clock
- **Leveling & XP** — grow your moss through multiple life stages
- **Transparent, always-on-top window** — lives alongside your other apps

## Tech Stack

Tauri v2 (Rust) · React 19 · TypeScript · Vite 7 · Zustand · Tailwind CSS v4 · Motion

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
  features/
    creature/           # Animated SVG character
    chat/               # Chat panel + LLM streaming
    stats/              # Care system + stat bars
    journal/            # Specimen collection
    settings/           # App settings
  stores/               # Zustand state management
  hooks/                # Shared React hooks
  lib/                  # Utilities

src-tauri/              # Rust backend
  src/
    commands/           # Tauri IPC commands
    services/           # LLM proxy, sidecar, persistence
    models/             # Data structures
```

## License

[MIT](LICENSE)
