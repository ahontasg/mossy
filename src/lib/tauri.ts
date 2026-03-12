import { invoke as tauriInvoke, Channel } from "@tauri-apps/api/core";
import type { ChatEvent, PullEvent } from "../types";

type Commands = {
  check_llm_health: { args: Record<string, never>; return: boolean };
  check_model_exists: { args: Record<string, never>; return: boolean };
  download_model: { args: { onEvent: Channel<PullEvent> }; return: void };
  start_sidecar: { args: Record<string, never>; return: void };
  stop_sidecar: { args: Record<string, never>; return: void };
  chat_with_mossy: {
    args: {
      messages: { role: string; content: string }[];
      systemPrompt: string;
      onEvent: Channel<ChatEvent>;
    };
    return: void;
  };
};

export async function invoke<T extends keyof Commands>(
  cmd: T,
  args: Commands[T]["args"],
): Promise<Commands[T]["return"]> {
  return tauriInvoke(cmd, args as Record<string, unknown>);
}

export { Channel };
