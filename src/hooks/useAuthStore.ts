import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

const unsubs: (() => void)[] = [];

export async function initAuthPersistence() {
  if (!isSupabaseConfigured()) return;

  await useAuthStore.getState().initialize();

  // Listen for auth state changes
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      useAuthStore.setState({ status: "signed_in", userId: session.user.id });
      await useAuthStore.getState().ensureProfile(session.user);
      await useAuthStore.getState().fetchTeam();
    } else if (event === "SIGNED_OUT") {
      useAuthStore.setState({
        status: "signed_out",
        userId: null,
        profile: null,
        team: null,
      });
    }
  });

  unsubs.push(() => data.subscription.unsubscribe());
}

export function cleanupAuthPersistence() {
  for (const unsub of unsubs) unsub();
  unsubs.length = 0;
}
