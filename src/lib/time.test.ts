import { describe, it, expect } from "vitest";
import { getTimeOfDay, getLocalDate, getISOWeek, isYesterday, isToday } from "./time";

describe("getTimeOfDay", () => {
  it("returns morning for hours 6-9", () => {
    expect(getTimeOfDay(6)).toBe("morning");
    expect(getTimeOfDay(7)).toBe("morning");
    expect(getTimeOfDay(9)).toBe("morning");
  });

  it("returns afternoon for hours 10-16", () => {
    expect(getTimeOfDay(10)).toBe("afternoon");
    expect(getTimeOfDay(12)).toBe("afternoon");
    expect(getTimeOfDay(16)).toBe("afternoon");
  });

  it("returns evening for hours 17-20", () => {
    expect(getTimeOfDay(17)).toBe("evening");
    expect(getTimeOfDay(19)).toBe("evening");
    expect(getTimeOfDay(20)).toBe("evening");
  });

  it("returns night for hours 21-5", () => {
    expect(getTimeOfDay(21)).toBe("night");
    expect(getTimeOfDay(0)).toBe("night");
    expect(getTimeOfDay(3)).toBe("night");
    expect(getTimeOfDay(5)).toBe("night");
  });

  it("handles boundary: 6 is morning not night", () => {
    expect(getTimeOfDay(5)).toBe("night");
    expect(getTimeOfDay(6)).toBe("morning");
  });

  it("handles boundary: 10 is afternoon not morning", () => {
    expect(getTimeOfDay(9)).toBe("morning");
    expect(getTimeOfDay(10)).toBe("afternoon");
  });

  it("handles boundary: 17 is evening not afternoon", () => {
    expect(getTimeOfDay(16)).toBe("afternoon");
    expect(getTimeOfDay(17)).toBe("evening");
  });

  it("handles boundary: 21 is night not evening", () => {
    expect(getTimeOfDay(20)).toBe("evening");
    expect(getTimeOfDay(21)).toBe("night");
  });

  it("uses current hour when no argument given", () => {
    const result = getTimeOfDay();
    expect(["morning", "afternoon", "evening", "night"]).toContain(result);
  });
});

describe("getLocalDate", () => {
  it("formats date as YYYY-MM-DD", () => {
    expect(getLocalDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(getLocalDate(new Date(2026, 11, 25))).toBe("2026-12-25");
  });
});

describe("getISOWeek", () => {
  it("returns YYYY-Www format", () => {
    const result = getISOWeek(new Date(2026, 2, 12)); // March 12, 2026 = Thursday, week 11
    expect(result).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("week 1 of a year", () => {
    // Jan 1, 2026 is a Thursday → W01
    expect(getISOWeek(new Date(2026, 0, 1))).toBe("2026-W01");
  });
});

describe("isYesterday", () => {
  it("returns true for yesterday's date", () => {
    const ref = new Date(2026, 2, 12);
    expect(isYesterday("2026-03-11", ref)).toBe(true);
  });

  it("returns false for today", () => {
    const ref = new Date(2026, 2, 12);
    expect(isYesterday("2026-03-12", ref)).toBe(false);
  });

  it("returns false for 2 days ago", () => {
    const ref = new Date(2026, 2, 12);
    expect(isYesterday("2026-03-10", ref)).toBe(false);
  });
});

describe("isToday", () => {
  it("returns true for today's date", () => {
    const ref = new Date(2026, 2, 12);
    expect(isToday("2026-03-12", ref)).toBe(true);
  });

  it("returns false for yesterday", () => {
    const ref = new Date(2026, 2, 12);
    expect(isToday("2026-03-11", ref)).toBe(false);
  });
});
