import { describe, it, expect, beforeEach } from "vitest";
import "../test/mocks/tauri";
import { useChatStore } from "./chatStore";
import { useCreatureStore } from "./creatureStore";
import { invoke } from "@tauri-apps/api/core";

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockInvoke = invoke as any;

describe("chatStore", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
    useCreatureStore.setState({ xp: 0, level: 1 });
  });

  describe("toggleChat", () => {
    it("toggles isOpen state", () => {
      expect(useChatStore.getState().isOpen).toBe(false);
      useChatStore.getState().toggleChat();
      expect(useChatStore.getState().isOpen).toBe(true);
      useChatStore.getState().toggleChat();
      expect(useChatStore.getState().isOpen).toBe(false);
    });
  });

  describe("checkLlmStatus", () => {
    it("sets ready when model exists and sidecar starts", async () => {
      mockInvoke
        .mockResolvedValueOnce(true as never) // check_model_exists
        .mockResolvedValueOnce(undefined as never); // start_sidecar

      await useChatStore.getState().checkLlmStatus();
      expect(useChatStore.getState().llmStatus).toBe("ready");
    });

    it("sets no_model when model does not exist", async () => {
      mockInvoke.mockResolvedValueOnce(false as never);

      await useChatStore.getState().checkLlmStatus();
      expect(useChatStore.getState().llmStatus).toBe("no_model");
    });

    it("sets no_model on error", async () => {
      mockInvoke.mockRejectedValueOnce(new Error("sidecar failed"));

      await useChatStore.getState().checkLlmStatus();
      expect(useChatStore.getState().llmStatus).toBe("no_model");
    });
  });

  describe("sendMessage", () => {
    it("adds user message and streams assistant response", async () => {
      mockInvoke.mockImplementation(
        async (cmd: string, args?: Record<string, unknown>) => {
          if (cmd === "chat_with_mossy") {
            const channel = (args as Record<string, unknown>)
              ?.onEvent as { onmessage: (e: unknown) => void };
            channel.onmessage({ event: "delta", data: { text: "Hi " } });
            channel.onmessage({ event: "delta", data: { text: "there!" } });
            channel.onmessage({ event: "done" });
            return undefined as never;
          }
          return true as never;
        },
      );

      await useChatStore.getState().sendMessage("Hello");

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe("user");
      expect(messages[0].content).toBe("Hello");
      expect(messages[1].role).toBe("assistant");
      expect(messages[1].content).toBe("Hi there!");
    });

    it("strips think tags from response", async () => {
      mockInvoke.mockImplementation(
        async (cmd: string, args?: Record<string, unknown>) => {
          if (cmd === "chat_with_mossy") {
            const channel = (args as Record<string, unknown>)
              ?.onEvent as { onmessage: (e: unknown) => void };
            channel.onmessage({
              event: "delta",
              data: { text: "<think>reasoning here</think>*waves leaf*" },
            });
            channel.onmessage({ event: "done" });
            return undefined as never;
          }
          return true as never;
        },
      );

      await useChatStore.getState().sendMessage("hi");

      const messages = useChatStore.getState().messages;
      expect(messages[1].content).toBe("*waves leaf*");
      expect(messages[1].content).not.toContain("<think>");
    });

    it("awards 5 XP on conversation completion", async () => {
      mockInvoke.mockImplementation(
        async (cmd: string, args?: Record<string, unknown>) => {
          if (cmd === "chat_with_mossy") {
            const channel = (args as Record<string, unknown>)
              ?.onEvent as { onmessage: (e: unknown) => void };
            channel.onmessage({ event: "delta", data: { text: "ok" } });
            channel.onmessage({ event: "done" });
            return undefined as never;
          }
          return true as never;
        },
      );

      const xpBefore = useCreatureStore.getState().xp;
      await useChatStore.getState().sendMessage("test");
      expect(useCreatureStore.getState().xp).toBe(xpBefore + 5);
    });

    it("handles error events gracefully", async () => {
      mockInvoke.mockImplementation(
        async (cmd: string, args?: Record<string, unknown>) => {
          if (cmd === "chat_with_mossy") {
            const channel = (args as Record<string, unknown>)
              ?.onEvent as { onmessage: (e: unknown) => void };
            channel.onmessage({
              event: "error",
              data: { message: "model not found" },
            });
            return undefined as never;
          }
          return true as never;
        },
      );

      await useChatStore.getState().sendMessage("test");

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(2);
      expect(messages[1].role).toBe("assistant");
      expect(messages[1].content).toContain("model not found");
      expect(useChatStore.getState().isStreaming).toBe(false);
    });
  });

  describe("role validation", () => {
    it("filters consecutive same-role messages before LLM call", async () => {
      let capturedMessages: { role: string; content: string }[] = [];
      mockInvoke.mockImplementation(
        async (cmd: string, args?: Record<string, unknown>) => {
          if (cmd === "chat_with_mossy") {
            capturedMessages = (args as Record<string, unknown>)
              ?.messages as typeof capturedMessages;
            const channel = (args as Record<string, unknown>)
              ?.onEvent as { onmessage: (e: unknown) => void };
            channel.onmessage({ event: "delta", data: { text: "ok" } });
            channel.onmessage({ event: "done" });
            return undefined as never;
          }
          return true as never;
        },
      );

      // Manually inject consecutive same-role messages
      useChatStore.setState({
        messages: [
          { id: "1", role: "user", content: "hi", timestamp: 1 },
          { id: "2", role: "user", content: "hello", timestamp: 2 },
          { id: "3", role: "assistant", content: "hey", timestamp: 3 },
        ],
      });

      await useChatStore.getState().sendMessage("test");

      // Should not have consecutive user messages
      for (let i = 1; i < capturedMessages.length; i++) {
        expect(capturedMessages[i].role).not.toBe(capturedMessages[i - 1].role);
      }
    });
  });

  describe("reset", () => {
    it("clears all state", () => {
      useChatStore.setState({
        messages: [
          { id: "1", role: "user", content: "hi", timestamp: Date.now() },
        ],
        isOpen: true,
        isStreaming: true,
        llmStatus: "ready",
      });

      useChatStore.getState().reset();

      expect(useChatStore.getState().messages).toHaveLength(0);
      expect(useChatStore.getState().isOpen).toBe(false);
      expect(useChatStore.getState().isStreaming).toBe(false);
      expect(useChatStore.getState().llmStatus).toBe("unknown");
    });
  });
});
