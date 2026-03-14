import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

const COMPACT_WIDTH = 300;
const COMPACT_HEIGHT = 420;
const CHAT_WIDTH = 380;
const CHAT_HEIGHT = 600;

const STEPS = 8;
const STEP_DELAY = 20; // ~160ms total

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

async function animateResize(
  fromW: number,
  fromH: number,
  toW: number,
  toH: number,
) {
  const win = getCurrentWindow();
  await win.setResizable(true);

  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    const w = lerp(fromW, toW, t);
    const h = lerp(fromH, toH, t);
    await win.setSize(new LogicalSize(w, h));
    if (i < STEPS) {
      await new Promise((r) => setTimeout(r, STEP_DELAY));
    }
  }

  await win.setResizable(false);
}

export async function expandWindow() {
  await animateResize(COMPACT_WIDTH, COMPACT_HEIGHT, CHAT_WIDTH, CHAT_HEIGHT);
}

export async function collapseWindow() {
  await animateResize(CHAT_WIDTH, CHAT_HEIGHT, COMPACT_WIDTH, COMPACT_HEIGHT);
}
