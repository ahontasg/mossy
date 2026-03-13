import { describe, it, expect, beforeEach } from "vitest";
import "../test/mocks/tauri";
import "../test/mocks/supabase";
import { useSyncStore } from "./syncStore";
import { mockSupabase } from "../test/mocks/supabase";

beforeEach(() => {
  useSyncStore.setState({
    queue: [],
    isSyncing: false,
    isOnline: true,
    lastSyncAt: null,
  });
});

describe("syncStore", () => {
  describe("enqueue", () => {
    it("adds event to queue", () => {
      useSyncStore.getState().enqueue({
        eventType: "focus_complete",
        xpEarned: 10,
        metadata: {},
        clientTimestamp: Date.now(),
      });
      expect(useSyncStore.getState().queue).toHaveLength(1);
      expect(useSyncStore.getState().queue[0].eventType).toBe("focus_complete");
    });

    it("assigns unique id and retryCount 0", () => {
      useSyncStore.getState().enqueue({
        eventType: "chat",
        xpEarned: 10,
        metadata: {},
        clientTimestamp: Date.now(),
      });
      const event = useSyncStore.getState().queue[0];
      expect(event.id).toBeTruthy();
      expect(event.retryCount).toBe(0);
    });

    it("caps queue at 500 events", () => {
      for (let i = 0; i < 510; i++) {
        useSyncStore.getState().enqueue({
          eventType: "focus_complete",
          xpEarned: 10,
          metadata: {},
          clientTimestamp: Date.now(),
        });
      }
      expect(useSyncStore.getState().queue).toHaveLength(500);
    });
  });

  describe("processQueue", () => {
    it("clears queue on successful sync", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: "event-id", error: null } as never);
      useSyncStore.getState().enqueue({
        eventType: "focus_complete",
        xpEarned: 10,
        metadata: {},
        clientTimestamp: Date.now(),
      });
      await useSyncStore.getState().processQueue();
      expect(useSyncStore.getState().queue).toHaveLength(0);
      expect(useSyncStore.getState().lastSyncAt).toBeTruthy();
    });

    it("increments retryCount on failure", async () => {
      mockSupabase.rpc.mockRejectedValue(new Error("Network error"));
      useSyncStore.getState().enqueue({
        eventType: "focus_complete",
        xpEarned: 10,
        metadata: {},
        clientTimestamp: Date.now(),
      });
      await useSyncStore.getState().processQueue();
      expect(useSyncStore.getState().queue[0].retryCount).toBe(1);
    });

    it("drops events with retryCount >= 3", async () => {
      useSyncStore.setState({
        queue: [
          {
            id: "test-1",
            eventType: "focus_complete",
            xpEarned: 10,
            metadata: {},
            clientTimestamp: Date.now(),
            retryCount: 3,
          },
        ],
      });
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });
      await useSyncStore.getState().processQueue();
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });

    it("drops stale events (older than 24h)", async () => {
      useSyncStore.setState({
        queue: [
          {
            id: "test-1",
            eventType: "focus_complete",
            xpEarned: 10,
            metadata: {},
            clientTimestamp: Date.now() - 25 * 60 * 60 * 1000,
            retryCount: 0,
          },
        ],
      });
      await useSyncStore.getState().processQueue();
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });

    it("skips when offline", async () => {
      useSyncStore.setState({ isOnline: false });
      useSyncStore.getState().enqueue({
        eventType: "focus_complete",
        xpEarned: 10,
        metadata: {},
        clientTimestamp: Date.now(),
      });
      await useSyncStore.getState().processQueue();
      expect(useSyncStore.getState().queue).toHaveLength(1);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it("skips when already syncing", async () => {
      useSyncStore.setState({ isSyncing: true });
      useSyncStore.getState().enqueue({
        eventType: "focus_complete",
        xpEarned: 10,
        metadata: {},
        clientTimestamp: Date.now(),
      });
      await useSyncStore.getState().processQueue();
      expect(useSyncStore.getState().queue).toHaveLength(1);
    });
  });

  describe("hydrate", () => {
    it("loads valid events", () => {
      useSyncStore.getState().hydrate([
        {
          id: "test-1",
          eventType: "focus_complete",
          xpEarned: 10,
          metadata: {},
          clientTimestamp: Date.now(),
          retryCount: 0,
        },
      ]);
      expect(useSyncStore.getState().queue).toHaveLength(1);
    });

    it("filters out stale events on hydrate", () => {
      useSyncStore.getState().hydrate([
        {
          id: "test-1",
          eventType: "focus_complete",
          xpEarned: 10,
          metadata: {},
          clientTimestamp: Date.now() - 25 * 60 * 60 * 1000,
          retryCount: 0,
        },
      ]);
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });

    it("filters out over-retried events on hydrate", () => {
      useSyncStore.getState().hydrate([
        {
          id: "test-1",
          eventType: "focus_complete",
          xpEarned: 10,
          metadata: {},
          clientTimestamp: Date.now(),
          retryCount: 3,
        },
      ]);
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });
  });

  describe("setOnline", () => {
    it("triggers processQueue when coming online", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: "event-id", error: null } as never);
      useSyncStore.setState({ isOnline: false });
      useSyncStore.getState().enqueue({
        eventType: "focus_complete",
        xpEarned: 10,
        metadata: {},
        clientTimestamp: Date.now(),
      });
      useSyncStore.getState().setOnline(true);
      // Give async processQueue time to run
      await new Promise((r) => setTimeout(r, 10));
      expect(useSyncStore.getState().isOnline).toBe(true);
    });
  });
});
