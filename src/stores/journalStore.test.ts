import { describe, it, expect, beforeEach } from "vitest";
import { useJournalStore } from "./journalStore";

function resetStore() {
  useJournalStore.setState({
    discovered: [],
    lastDiscovery: null,
  });
}

describe("journalStore", () => {
  beforeEach(resetStore);

  describe("addDiscovery", () => {
    it("adds a discovered specimen", () => {
      useJournalStore.getState().addDiscovery("tiny_pebble");
      const { discovered } = useJournalStore.getState();
      expect(discovered).toHaveLength(1);
      expect(discovered[0].specimenId).toBe("tiny_pebble");
      expect(discovered[0].discoveredDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("sets lastDiscovery", () => {
      useJournalStore.getState().addDiscovery("moss_ball");
      const { lastDiscovery } = useJournalStore.getState();
      expect(lastDiscovery).not.toBeNull();
      expect(lastDiscovery!.specimenId).toBe("moss_ball");
    });

    it("accumulates multiple discoveries", () => {
      useJournalStore.getState().addDiscovery("tiny_pebble");
      useJournalStore.getState().addDiscovery("moss_ball");
      expect(useJournalStore.getState().discovered).toHaveLength(2);
    });
  });

  describe("getDiscoveredIds", () => {
    it("returns set of discovered specimen IDs", () => {
      useJournalStore.getState().addDiscovery("tiny_pebble");
      useJournalStore.getState().addDiscovery("moss_ball");
      const ids = useJournalStore.getState().getDiscoveredIds();
      expect(ids.has("tiny_pebble")).toBe(true);
      expect(ids.has("moss_ball")).toBe(true);
      expect(ids.has("earthworm")).toBe(false);
    });
  });

  describe("hydrate", () => {
    it("restores discovered specimens", () => {
      useJournalStore.getState().hydrate([
        { specimenId: "tiny_pebble", discoveredAt: 1000, discoveredDate: "2026-03-10" },
        { specimenId: "moss_ball", discoveredAt: 2000, discoveredDate: "2026-03-11" },
      ]);
      expect(useJournalStore.getState().discovered).toHaveLength(2);
    });
  });
});
