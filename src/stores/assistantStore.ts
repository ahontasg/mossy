import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Note, Reminder } from "../types";

const MAX_NOTES = 100;
const MAX_ACTIVE_REMINDERS = 10;
const STALE_FIRED_MS = 24 * 60 * 60 * 1000; // 24h

let idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

export interface PersistedAssistantData {
  notes: Note[];
  reminders: Reminder[];
  lastBriefDate: string | null;
}

interface AssistantStore {
  // Notes
  notes: Note[];
  addNote: (content: string) => void;
  deleteNote: (id: string) => void;

  // Reminders
  reminders: Reminder[];
  firedReminder: Reminder | null;
  addReminder: (message: string, triggerAt: number) => boolean;
  removeReminder: (id: string) => void;
  checkReminders: () => void;
  dismissFired: () => void;

  // Daily brief
  lastBriefDate: string | null;
  markBriefShown: () => void;

  // Lifecycle
  hydrate: (data: PersistedAssistantData) => void;
  reset: () => void;
}

export const useAssistantStore = create<AssistantStore>()(
  subscribeWithSelector((set, get) => ({
    notes: [],
    reminders: [],
    firedReminder: null,
    lastBriefDate: null,

    addNote: (content: string) => {
      const note: Note = { id: nextId("note"), content, createdAt: Date.now() };
      set((s) => {
        const notes = [note, ...s.notes].slice(0, MAX_NOTES);
        return { notes };
      });
    },

    deleteNote: (id: string) => {
      set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    },

    addReminder: (message: string, triggerAt: number): boolean => {
      const activeCount = get().reminders.filter((r) => !r.fired).length;
      if (activeCount >= MAX_ACTIVE_REMINDERS) return false;
      const reminder: Reminder = {
        id: nextId("rem"),
        message,
        triggerAt,
        createdAt: Date.now(),
        fired: false,
      };
      set((s) => ({ reminders: [...s.reminders, reminder] }));
      return true;
    },

    removeReminder: (id: string) => {
      set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }));
    },

    checkReminders: () => {
      const now = Date.now();
      const { reminders, firedReminder } = get();
      if (firedReminder) return; // one at a time

      const toFire = reminders.find((r) => !r.fired && r.triggerAt <= now);
      if (toFire) {
        set({
          reminders: reminders.map((r) =>
            r.id === toFire.id ? { ...r, fired: true } : r,
          ),
          firedReminder: { ...toFire, fired: true },
        });
      }
    },

    dismissFired: () => {
      set({ firedReminder: null });
    },

    markBriefShown: () => {
      const today = new Date().toISOString().split("T")[0];
      set({ lastBriefDate: today });
    },

    hydrate: (data: PersistedAssistantData) => {
      const now = Date.now();
      // Prune fired reminders older than 24h
      const reminders = (data.reminders ?? []).filter(
        (r) => !r.fired || now - r.triggerAt < STALE_FIRED_MS,
      );
      set({
        notes: (data.notes ?? []).slice(0, MAX_NOTES),
        reminders,
        lastBriefDate: data.lastBriefDate ?? null,
      });
    },

    reset: () => {
      idCounter = 0;
      set({
        notes: [],
        reminders: [],
        firedReminder: null,
        lastBriefDate: null,
      });
    },
  })),
);
