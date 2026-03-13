import { load } from "@tauri-apps/plugin-store";
import { useAssistantStore, type PersistedAssistantData } from "../stores/assistantStore";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let reminderInterval: ReturnType<typeof setInterval> | null = null;
const unsubs: (() => void)[] = [];

async function saveToStore() {
  if (!storeInstance) return;
  const s = useAssistantStore.getState();
  await storeInstance.set("assistant", {
    notes: s.notes,
    reminders: s.reminders,
    lastBriefDate: s.lastBriefDate,
  } satisfies PersistedAssistantData);
  await storeInstance.save();
}

function debouncedSave() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(saveToStore, 2000);
}

export async function initAssistantPersistence() {
  storeInstance = await load("mossy-data.json", { defaults: {}, autoSave: false });

  const data = await storeInstance.get<PersistedAssistantData>("assistant");
  if (data) {
    useAssistantStore.getState().hydrate(data);
  }

  // Check reminders every 60s
  reminderInterval = setInterval(() => {
    useAssistantStore.getState().checkReminders();
  }, 60_000);

  // Persist on notes changes
  unsubs.push(
    useAssistantStore.subscribe(
      (s) => s.notes,
      () => debouncedSave(),
      { equalityFn: (a, b) => a === b },
    ),
  );

  // Persist on reminders changes
  unsubs.push(
    useAssistantStore.subscribe(
      (s) => s.reminders,
      () => debouncedSave(),
      { equalityFn: (a, b) => a === b },
    ),
  );

  // Persist on brief date changes
  unsubs.push(
    useAssistantStore.subscribe(
      (s) => s.lastBriefDate,
      () => debouncedSave(),
    ),
  );
}

export function cleanupAssistantPersistence() {
  for (const unsub of unsubs) unsub();
  unsubs.length = 0;
  if (debounceTimer) clearTimeout(debounceTimer);
  if (reminderInterval) clearInterval(reminderInterval);
}
