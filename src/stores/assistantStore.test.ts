import { describe, it, expect, beforeEach } from "vitest";
import { useAssistantStore, type PersistedAssistantData } from "./assistantStore";

beforeEach(() => {
  useAssistantStore.getState().reset();
});

describe("notes", () => {
  it("adds a note", () => {
    useAssistantStore.getState().addNote("standup at 2pm");
    const { notes } = useAssistantStore.getState();
    expect(notes).toHaveLength(1);
    expect(notes[0].content).toBe("standup at 2pm");
  });

  it("adds notes in reverse chronological order", () => {
    useAssistantStore.getState().addNote("first");
    useAssistantStore.getState().addNote("second");
    const { notes } = useAssistantStore.getState();
    expect(notes[0].content).toBe("second");
    expect(notes[1].content).toBe("first");
  });

  it("limits to 100 notes (FIFO trim)", () => {
    for (let i = 0; i < 110; i++) {
      useAssistantStore.getState().addNote(`note ${i}`);
    }
    expect(useAssistantStore.getState().notes).toHaveLength(100);
    expect(useAssistantStore.getState().notes[0].content).toBe("note 109");
  });

  it("deletes a note by id", () => {
    useAssistantStore.getState().addNote("keep");
    useAssistantStore.getState().addNote("delete me");
    const toDelete = useAssistantStore.getState().notes[0];
    useAssistantStore.getState().deleteNote(toDelete.id);
    const { notes } = useAssistantStore.getState();
    expect(notes).toHaveLength(1);
    expect(notes[0].content).toBe("keep");
  });
});

describe("reminders", () => {
  it("adds a reminder", () => {
    const result = useAssistantStore.getState().addReminder("stretch", Date.now() + 60_000);
    expect(result).toBe(true);
    expect(useAssistantStore.getState().reminders).toHaveLength(1);
    expect(useAssistantStore.getState().reminders[0].message).toBe("stretch");
    expect(useAssistantStore.getState().reminders[0].fired).toBe(false);
  });

  it("limits to 10 active reminders", () => {
    for (let i = 0; i < 10; i++) {
      useAssistantStore.getState().addReminder(`r${i}`, Date.now() + 60_000);
    }
    const result = useAssistantStore.getState().addReminder("one too many", Date.now() + 60_000);
    expect(result).toBe(false);
    expect(useAssistantStore.getState().reminders).toHaveLength(10);
  });

  it("allows new reminders when some are fired", () => {
    for (let i = 0; i < 10; i++) {
      useAssistantStore.getState().addReminder(`r${i}`, Date.now() + 60_000);
    }
    // Fire one
    useAssistantStore.setState((s) => ({
      reminders: s.reminders.map((r, i) => (i === 0 ? { ...r, fired: true } : r)),
    }));
    const result = useAssistantStore.getState().addReminder("new one", Date.now() + 60_000);
    expect(result).toBe(true);
  });

  it("removes a reminder", () => {
    useAssistantStore.getState().addReminder("test", Date.now() + 60_000);
    const id = useAssistantStore.getState().reminders[0].id;
    useAssistantStore.getState().removeReminder(id);
    expect(useAssistantStore.getState().reminders).toHaveLength(0);
  });

  it("fires a due reminder on checkReminders", () => {
    const pastTime = Date.now() - 1000;
    useAssistantStore.getState().addReminder("overdue", pastTime);
    useAssistantStore.getState().checkReminders();

    const { firedReminder, reminders } = useAssistantStore.getState();
    expect(firedReminder).not.toBeNull();
    expect(firedReminder!.message).toBe("overdue");
    expect(reminders[0].fired).toBe(true);
  });

  it("fires only one reminder at a time", () => {
    const pastTime = Date.now() - 1000;
    useAssistantStore.getState().addReminder("first", pastTime);
    useAssistantStore.getState().addReminder("second", pastTime);
    useAssistantStore.getState().checkReminders();

    expect(useAssistantStore.getState().firedReminder!.message).toBe("first");
    expect(useAssistantStore.getState().reminders.filter((r) => r.fired)).toHaveLength(1);
  });

  it("does not fire while another is showing", () => {
    const pastTime = Date.now() - 1000;
    useAssistantStore.getState().addReminder("first", pastTime);
    useAssistantStore.getState().addReminder("second", pastTime);
    useAssistantStore.getState().checkReminders();
    // Still showing first
    useAssistantStore.getState().checkReminders();
    expect(useAssistantStore.getState().firedReminder!.message).toBe("first");
  });

  it("fires next after dismissing", () => {
    const pastTime = Date.now() - 1000;
    useAssistantStore.getState().addReminder("first", pastTime);
    useAssistantStore.getState().addReminder("second", pastTime);
    useAssistantStore.getState().checkReminders();
    useAssistantStore.getState().dismissFired();
    useAssistantStore.getState().checkReminders();
    expect(useAssistantStore.getState().firedReminder!.message).toBe("second");
  });

  it("does not fire future reminders", () => {
    useAssistantStore.getState().addReminder("future", Date.now() + 999_999);
    useAssistantStore.getState().checkReminders();
    expect(useAssistantStore.getState().firedReminder).toBeNull();
  });
});

describe("hydrate", () => {
  it("restores notes and reminders", () => {
    const data: PersistedAssistantData = {
      notes: [{ id: "n1", content: "test", createdAt: Date.now() }],
      reminders: [{ id: "r1", message: "stretch", triggerAt: Date.now() + 60_000, createdAt: Date.now(), fired: false }],
      lastBriefDate: "2026-03-13",
    };
    useAssistantStore.getState().hydrate(data);
    expect(useAssistantStore.getState().notes).toHaveLength(1);
    expect(useAssistantStore.getState().reminders).toHaveLength(1);
    expect(useAssistantStore.getState().lastBriefDate).toBe("2026-03-13");
  });

  it("prunes fired reminders older than 24h", () => {
    const oldTime = Date.now() - 25 * 60 * 60 * 1000;
    const data: PersistedAssistantData = {
      notes: [],
      reminders: [
        { id: "r1", message: "old", triggerAt: oldTime, createdAt: oldTime - 60_000, fired: true },
        { id: "r2", message: "recent", triggerAt: Date.now() - 1000, createdAt: Date.now() - 60_000, fired: true },
        { id: "r3", message: "active", triggerAt: Date.now() + 60_000, createdAt: Date.now(), fired: false },
      ],
      lastBriefDate: null,
    };
    useAssistantStore.getState().hydrate(data);
    const { reminders } = useAssistantStore.getState();
    expect(reminders).toHaveLength(2);
    expect(reminders.find((r) => r.message === "old")).toBeUndefined();
  });

  it("handles missing fields gracefully", () => {
    useAssistantStore.getState().hydrate({} as PersistedAssistantData);
    expect(useAssistantStore.getState().notes).toEqual([]);
    expect(useAssistantStore.getState().reminders).toEqual([]);
    expect(useAssistantStore.getState().lastBriefDate).toBeNull();
  });
});

describe("markBriefShown", () => {
  it("sets lastBriefDate to today", () => {
    useAssistantStore.getState().markBriefShown();
    const today = new Date().toISOString().split("T")[0];
    expect(useAssistantStore.getState().lastBriefDate).toBe(today);
  });
});
