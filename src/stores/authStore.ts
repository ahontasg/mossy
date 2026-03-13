import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { AuthStatus, UserProfile, Team } from "../types";

interface AuthStore {
  status: AuthStatus;
  userId: string | null;
  profile: UserProfile | null;
  team: Team | null;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createTeam: (name: string) => Promise<string>;
  joinTeam: (joinCode: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchTeam: () => Promise<void>;
  ensureProfile: (user: { id: string; user_metadata?: Record<string, unknown>; email?: string }) => Promise<void>;
  setStatus: (status: AuthStatus) => void;
  setProfile: (profile: UserProfile | null) => void;
  setTeam: (team: Team | null) => void;
}

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    status: "signed_out",
    userId: null,
    profile: null,
    team: null,

    initialize: async () => {
      if (!isSupabaseConfigured()) return;
      set({ status: "loading" });
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        set({ status: "signed_in", userId: data.session.user.id });
        await get().fetchProfile();
        await get().fetchTeam();
      } else {
        set({ status: "signed_out" });
      }
    },

    signUp: async (email, password, displayName) => {
      set({ status: "loading" });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) {
        set({ status: "signed_out" });
        throw error;
      }
      if (data.session && data.user) {
        // Auto-confirmed — create profile immediately
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          display_name: displayName,
        });
        if (profileError) {
          set({ status: "signed_out" });
          throw new Error("Failed to create profile");
        }
        set({ status: "signed_in", userId: data.user.id });
        await get().fetchProfile();
      } else if (data.user) {
        // Email confirmation required — no session yet
        set({ status: "signed_out" });
        throw new Error("CHECK_EMAIL");
      } else {
        set({ status: "signed_out" });
        throw new Error("Sign up failed");
      }
    },

    signIn: async (email, password) => {
      set({ status: "loading" });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ status: "signed_out" });
        throw error;
      }
      if (data.user) {
        set({ status: "signed_in", userId: data.user.id });
        await get().ensureProfile(data.user);
        await get().fetchTeam();
      }
    },

    signOut: async () => {
      await supabase.auth.signOut();
      set({ status: "signed_out", userId: null, profile: null, team: null });
    },

    createTeam: async (name) => {
      const userId = get().userId;
      if (!userId) throw new Error("Not signed in");
      const joinCode = generateJoinCode();
      // Insert without chained .select() — avoids PostgREST return-representation issues
      const { error: insertError } = await supabase
        .from("teams")
        .insert({ name, join_code: joinCode, created_by: userId });
      if (insertError) throw insertError;
      // Fetch the newly created team (SELECT policy allows created_by = auth.uid())
      const { data, error: selectError } = await supabase
        .from("teams")
        .select()
        .eq("join_code", joinCode)
        .single();
      if (selectError || !data) throw selectError ?? new Error("Team not found after insert");
      const team: Team = {
        id: data.id,
        name: data.name,
        joinCode: data.join_code,
        createdBy: data.created_by!,
      };
      // Update profile with team_id
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ team_id: data.id })
        .eq("id", userId);
      if (updateError) throw updateError;
      set({ team });
      await get().fetchProfile();
      return joinCode;
    },

    joinTeam: async (joinCode) => {
      const userId = get().userId;
      if (!userId) throw new Error("Not signed in");
      // Look up team via SECURITY DEFINER RPC (never exposes join_code to client)
      const { data: teamData, error: teamError } = await supabase
        .rpc("lookup_team_by_code", { p_join_code: joinCode })
        .single();
      if (teamError || !teamData) throw new Error("Team not found");
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ team_id: teamData.id })
        .eq("id", userId);
      if (profileError) throw profileError;
      const team: Team = {
        id: teamData.id,
        name: teamData.name,
        joinCode: joinCode.toUpperCase().trim(),
        createdBy: teamData.created_by!,
      };
      set({ team });
      // Claim referral bonus from team creator
      if (teamData.created_by && teamData.created_by !== userId) {
        try {
          const { data: specimenId } = await supabase.rpc("claim_referral_bonus", {
            p_referrer_id: teamData.created_by,
          });
          if (specimenId) {
            // Import dynamically to avoid circular dependency
            const { useJournalStore } = await import("./journalStore");
            useJournalStore.getState().addDiscovery(specimenId);
          }
        } catch {
          // Referral bonus is non-critical
        }
      }
      await get().fetchProfile();
    },

    fetchProfile: async () => {
      const userId = get().userId;
      if (!userId) return;
      const { data } = await supabase
        .from("profiles")
        .select()
        .eq("id", userId)
        .single();
      if (data) {
        set({
          profile: {
            id: data.id,
            displayName: data.display_name,
            teamId: data.team_id,
            referredBy: data.referred_by,
          },
        });
      }
    },

    ensureProfile: async (user) => {
      await get().fetchProfile();
      if (!get().profile) {
        await supabase.from("profiles").upsert({
          id: user.id,
          display_name:
            (user.user_metadata?.display_name as string)
            || user.email?.split("@")[0]
            || "Mossy",
        });
        await get().fetchProfile();
      }
    },

    fetchTeam: async () => {
      const profile = get().profile;
      if (!profile?.teamId) {
        set({ team: null });
        return;
      }
      const { data } = await supabase
        .from("teams")
        .select()
        .eq("id", profile.teamId)
        .single();
      if (data) {
        set({
          team: {
            id: data.id,
            name: data.name,
            joinCode: data.join_code,
            createdBy: data.created_by!,
          },
        });
      }
    },

    setStatus: (status) => set({ status }),
    setProfile: (profile) => set({ profile }),
    setTeam: (team) => set({ team }),
  })),
);
