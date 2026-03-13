import { describe, it, expect } from "vitest";
import { parseIntent, parseDuration } from "./intentParser";

describe("parseDuration", () => {
  it("parses minutes", () => {
    expect(parseDuration(10, "min")).toBe(600_000);
    expect(parseDuration(5, "minutes")).toBe(300_000);
    expect(parseDuration(1, "m")).toBe(60_000);
  });

  it("parses seconds", () => {
    expect(parseDuration(30, "seconds")).toBe(30_000);
    expect(parseDuration(10, "s")).toBe(10_000);
  });

  it("parses hours", () => {
    expect(parseDuration(1, "hour")).toBe(3_600_000);
    expect(parseDuration(2, "hrs")).toBe(7_200_000);
  });

  it("returns 0 for unknown unit", () => {
    expect(parseDuration(5, "lightyears")).toBe(0);
  });
});

describe("parseIntent", () => {
  describe("set_timer", () => {
    it("parses 'set a timer for 10 minutes'", () => {
      const result = parseIntent("set a timer for 10 minutes");
      expect(result.type).toBe("set_timer");
      expect(result.durationMs).toBe(600_000);
    });

    it("parses 'set timer 5 min'", () => {
      const result = parseIntent("set timer 5 min");
      expect(result.type).toBe("set_timer");
      expect(result.durationMs).toBe(300_000);
    });

    it("parses 'set timer for 1 hour'", () => {
      const result = parseIntent("set timer for 1 hour");
      expect(result.type).toBe("set_timer");
      expect(result.durationMs).toBe(3_600_000);
    });

    it("is case insensitive", () => {
      const result = parseIntent("Set A Timer For 25 Minutes");
      expect(result.type).toBe("set_timer");
      expect(result.durationMs).toBe(1_500_000);
    });
  });

  describe("set_reminder", () => {
    it("parses 'remind me in 30 minutes to check the build'", () => {
      const result = parseIntent("remind me in 30 minutes to check the build");
      expect(result.type).toBe("set_reminder");
      expect(result.durationMs).toBe(1_800_000);
      expect(result.text).toBe("check the build");
    });

    it("parses 'remind me 5 min to stretch'", () => {
      const result = parseIntent("remind me 5 min to stretch");
      expect(result.type).toBe("set_reminder");
      expect(result.durationMs).toBe(300_000);
      expect(result.text).toBe("stretch");
    });

    it("parses without 'to' prefix", () => {
      const result = parseIntent("remind me in 10 minutes check email");
      expect(result.type).toBe("set_reminder");
      expect(result.text).toBe("check email");
    });
  });

  describe("add_note", () => {
    it("parses 'Note: standup at 2pm'", () => {
      const result = parseIntent("Note: standup at 2pm");
      expect(result.type).toBe("add_note");
      expect(result.text).toBe("standup at 2pm");
    });

    it("parses 'save a note: check PR review'", () => {
      const result = parseIntent("save a note: check PR review");
      expect(result.type).toBe("add_note");
      expect(result.text).toBe("check PR review");
    });

    it("parses 'add note buy groceries'", () => {
      const result = parseIntent("add note buy groceries");
      expect(result.type).toBe("add_note");
      expect(result.text).toBe("buy groceries");
    });
  });

  describe("show_notes", () => {
    it("parses 'show notes'", () => {
      expect(parseIntent("show notes").type).toBe("show_notes");
    });

    it("parses 'list notes'", () => {
      expect(parseIntent("list notes").type).toBe("show_notes");
    });

    it("parses 'my notes'", () => {
      expect(parseIntent("my notes").type).toBe("show_notes");
    });
  });

  describe("none", () => {
    it("returns none for regular chat", () => {
      expect(parseIntent("hello mossy").type).toBe("none");
    });

    it("returns none for empty string", () => {
      expect(parseIntent("").type).toBe("none");
    });

    it("returns none for partial matches", () => {
      expect(parseIntent("set a").type).toBe("none");
      expect(parseIntent("remind").type).toBe("none");
    });
  });
});
