import { describe, it, expect } from "vitest";
import { getSeason } from "./season";

describe("getSeason", () => {
  it("returns spring for March-May", () => {
    expect(getSeason(new Date(2026, 2, 1))).toBe("spring");  // March
    expect(getSeason(new Date(2026, 3, 15))).toBe("spring"); // April
    expect(getSeason(new Date(2026, 4, 31))).toBe("spring"); // May
  });

  it("returns summer for June-August", () => {
    expect(getSeason(new Date(2026, 5, 1))).toBe("summer");  // June
    expect(getSeason(new Date(2026, 6, 15))).toBe("summer"); // July
    expect(getSeason(new Date(2026, 7, 31))).toBe("summer"); // August
  });

  it("returns autumn for September-November", () => {
    expect(getSeason(new Date(2026, 8, 1))).toBe("autumn");   // September
    expect(getSeason(new Date(2026, 9, 15))).toBe("autumn");  // October
    expect(getSeason(new Date(2026, 10, 30))).toBe("autumn"); // November
  });

  it("returns winter for December-February", () => {
    expect(getSeason(new Date(2026, 11, 1))).toBe("winter"); // December
    expect(getSeason(new Date(2026, 0, 15))).toBe("winter"); // January
    expect(getSeason(new Date(2026, 1, 28))).toBe("winter"); // February
  });

  it("handles boundaries: Feb→Mar, May→Jun, Aug→Sep, Nov→Dec", () => {
    expect(getSeason(new Date(2026, 1, 28))).toBe("winter");
    expect(getSeason(new Date(2026, 2, 1))).toBe("spring");
    expect(getSeason(new Date(2026, 4, 31))).toBe("spring");
    expect(getSeason(new Date(2026, 5, 1))).toBe("summer");
    expect(getSeason(new Date(2026, 7, 31))).toBe("summer");
    expect(getSeason(new Date(2026, 8, 1))).toBe("autumn");
    expect(getSeason(new Date(2026, 10, 30))).toBe("autumn");
    expect(getSeason(new Date(2026, 11, 1))).toBe("winter");
  });

  it("uses current date when no argument given", () => {
    const result = getSeason();
    expect(["spring", "summer", "autumn", "winter"]).toContain(result);
  });
});
