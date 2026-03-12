import { describe, it, expect } from "vitest";
import { getTimeOfDay } from "./time";

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
