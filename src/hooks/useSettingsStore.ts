import { load } from "@tauri-apps/plugin-store";
import { useSettingsStore } from "../stores/settingsStore";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;

interface PersistedSettings {
  soundEnabled: boolean;
}

export async function initSettingsPersistence() {
  storeInstance = await load("mossy-data.json", { defaults: {}, autoSave: false });

  const data = await storeInstance.get<PersistedSettings>("settings");
  if (data) {
    useSettingsStore.getState().setSoundEnabled(data.soundEnabled ?? false);
  }

  // Persist on changes
  useSettingsStore.subscribe(
    (s) => s.soundEnabled,
    async (soundEnabled) => {
      if (!storeInstance) return;
      await storeInstance.set("settings", { soundEnabled } satisfies PersistedSettings);
      await storeInstance.save();
    },
  );
}
