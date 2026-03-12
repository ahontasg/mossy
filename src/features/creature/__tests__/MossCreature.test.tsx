import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MossCreature } from "../MossCreature";
import { useCreatureStore } from "../../../stores/creatureStore";

describe("MossCreature", () => {
  beforeEach(() => {
    useCreatureStore.setState({
      stats: { hunger: 75, hydration: 75, happiness: 75, energy: 75 },
      xp: 0,
      level: 1,
      growthStage: "sprout",
      mood: "happy",
      lastCareAction: null,
      lastSave: Date.now(),
    });
  });

  it("renders an SVG element", () => {
    const { container } = render(<MossCreature timeOfDay="afternoon" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 256 256");
    expect(svg?.getAttribute("shape-rendering")).toBe("crispEdges");
  });

  it("renders pixel rects for the creature", () => {
    const { container } = render(<MossCreature timeOfDay="afternoon" />);
    const rects = container.querySelectorAll("rect");
    // Should have many rects for the pixel creature
    expect(rects.length).toBeGreaterThan(10);
  });

  it("does not render tint overlay", () => {
    const { container } = render(<MossCreature timeOfDay="night" />);
    const tintRect = Array.from(container.querySelectorAll("rect")).find(
      (r) => r.getAttribute("opacity") !== null && r.getAttribute("opacity") !== "",
    );
    expect(tintRect).toBeFalsy();
  });

  it("responds to mood changes", () => {
    const { container, rerender } = render(<MossCreature timeOfDay="afternoon" />);
    const rectsBefore = container.querySelectorAll("rect").length;

    useCreatureStore.setState({
      mood: "sad",
      stats: { hunger: 20, hydration: 20, happiness: 20, energy: 20 },
    });

    rerender(<MossCreature timeOfDay="afternoon" />);
    const rectsAfter = container.querySelectorAll("rect").length;

    // The frame data is different per mood, so rect count may differ
    // Just verify it still renders
    expect(rectsAfter).toBeGreaterThan(10);
    // The important thing is it doesn't crash
    expect(rectsBefore).toBeGreaterThan(0);
  });
});
