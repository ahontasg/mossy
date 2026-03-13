import { describe, it, expect, beforeEach } from "vitest";
import { executeIntent } from "./actionExecutor";
import { useAssistantStore } from "../../../stores/assistantStore";
import type { ParsedIntent } from "../../../types";

beforeEach(() => {
  useAssistantStore.getState().reset();
});

describe("executeIntent", () => {
  describe("set_timer", () => {
    it("creates a reminder and returns response", () => {
      const intent: ParsedIntent = { type: "set_timer", durationMs: 600_000 };
      const result = executeIntent(intent);
      expect(result.executed).toBe(true);
      expect(result.response).toContain("I'll let you know in 10 minutes");
      expect(useAssistantStore.getState().reminders).toHaveLength(1);
      expect(useAssistantStore.getState().reminders[0].message).toBe("Timer complete!");
    });

    it("rejects when at max reminders", () => {
      for (let i = 0; i < 10; i++) {
        useAssistantStore.getState().addReminder(`r${i}`, Date.now() + 60_000);
      }
      const intent: ParsedIntent = { type: "set_timer", durationMs: 300_000 };
      const result = executeIntent(intent);
      expect(result.executed).toBe(true);
      expect(result.response).toContain("10 reminders");
    });
  });

  describe("set_reminder", () => {
    it("creates a reminder with custom message", () => {
      const intent: ParsedIntent = { type: "set_reminder", durationMs: 1_800_000, text: "check the build" };
      const result = executeIntent(intent);
      expect(result.executed).toBe(true);
      expect(result.response).toContain("check the build");
      expect(result.response).toContain("30 minutes");
      const { reminders } = useAssistantStore.getState();
      expect(reminders[0].message).toBe("check the build");
    });
  });

  describe("add_note", () => {
    it("adds note and returns confirmation", () => {
      const intent: ParsedIntent = { type: "add_note", text: "standup at 2pm" };
      const result = executeIntent(intent);
      expect(result.executed).toBe(true);
      expect(result.response).toContain("Noted");
      expect(useAssistantStore.getState().notes[0].content).toBe("standup at 2pm");
    });
  });

  describe("show_notes", () => {
    it("returns empty message when no notes", () => {
      const result = executeIntent({ type: "show_notes" });
      expect(result.executed).toBe(true);
      expect(result.response).toContain("No notes yet");
    });

    it("lists up to 5 recent notes", () => {
      for (let i = 0; i < 7; i++) {
        useAssistantStore.getState().addNote(`note ${i}`);
      }
      const result = executeIntent({ type: "show_notes" });
      expect(result.executed).toBe(true);
      expect(result.response).toContain("1.");
      expect(result.response).toContain("5.");
      expect(result.response).toContain("2 more");
    });
  });

  describe("none", () => {
    it("returns not executed", () => {
      const result = executeIntent({ type: "none" });
      expect(result.executed).toBe(false);
    });
  });
});
