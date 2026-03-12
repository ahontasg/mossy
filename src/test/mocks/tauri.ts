import { vi, beforeEach } from "vitest";

const storeData = new Map<string, unknown>();

// Mock Channel for streaming commands
class MockChannel<T> {
  onmessage: ((event: T) => void) | null = null;
  send(event: T) {
    this.onmessage?.(event);
  }
}

// Map of command handlers for testing
const commandHandlers: Record<string, (...args: unknown[]) => unknown> = {
  check_llm_health: async () => true,
  check_model_exists: async () => true,
  download_model: async () => {},
  start_sidecar: async () => {},
  stop_sidecar: async () => {},
  chat_with_mossy: async () => {},
};

beforeEach(() => {
  storeData.clear();
  vi.clearAllMocks();
});

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(async (cmd: string, args?: Record<string, unknown>) => {
    const handler = commandHandlers[cmd];
    if (handler) return handler(args);
    throw new Error(`Unknown command: ${cmd}`);
  }),
  Channel: MockChannel,
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(async () => () => {}),
  emit: vi.fn(async () => {}),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    show: vi.fn(async () => {}),
    hide: vi.fn(async () => {}),
    isVisible: vi.fn(async () => true),
    setFocus: vi.fn(async () => {}),
    setSize: vi.fn(async () => {}),
    setResizable: vi.fn(async () => {}),
    onCloseRequested: vi.fn(async () => () => {}),
  })),
  LogicalSize: vi.fn((w: number, h: number) => ({ width: w, height: h })),
}));

vi.mock("@tauri-apps/plugin-opener", () => ({
  openUrl: vi.fn(async () => {}),
  openPath: vi.fn(async () => {}),
  revealItemInDir: vi.fn(async () => {}),
}));

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(async () => ({
    get: vi.fn(async (key: string) => storeData.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown) => {
      storeData.set(key, value);
    }),
    save: vi.fn(async () => {}),
    delete: vi.fn(async (key: string) => storeData.delete(key)),
    clear: vi.fn(async () => storeData.clear()),
  })),
}));
