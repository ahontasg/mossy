import { describe, it, expect, beforeEach, vi } from "vitest";
import "../test/mocks/tauri";
import "../test/mocks/supabase";
import { useAuthStore } from "./authStore";
import { mockSupabase } from "../test/mocks/supabase";

beforeEach(() => {
  useAuthStore.setState({
    status: "signed_out",
    userId: null,
    profile: null,
    team: null,
  });
});

describe("authStore", () => {
  it("starts signed_out", () => {
    expect(useAuthStore.getState().status).toBe("signed_out");
  });

  it("signIn sets status to signed_in", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "user-1", email: "test@example.com" }, session: { user: { id: "user-1", email: "test@example.com" } } },
      error: null,
    } as never);
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "user-1", display_name: "Test", team_id: null, referred_by: null },
            error: null,
          }),
        }),
      }),
    } as never);

    await useAuthStore.getState().signIn("test@example.com", "password123");
    expect(useAuthStore.getState().status).toBe("signed_in");
    expect(useAuthStore.getState().userId).toBe("user-1");
  });

  it("signOut clears state", async () => {
    useAuthStore.setState({
      status: "signed_in",
      userId: "user-1",
      profile: { id: "user-1", displayName: "Test", teamId: null, referredBy: null },
    });
    await useAuthStore.getState().signOut();
    expect(useAuthStore.getState().status).toBe("signed_out");
    expect(useAuthStore.getState().userId).toBeNull();
    expect(useAuthStore.getState().profile).toBeNull();
    expect(useAuthStore.getState().team).toBeNull();
  });

  it("signIn throws on error", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new Error("Invalid credentials"),
    } as never);
    await expect(
      useAuthStore.getState().signIn("bad@example.com", "wrong"),
    ).rejects.toThrow("Invalid credentials");
    expect(useAuthStore.getState().status).toBe("signed_out");
  });

  it("signUp with auto-confirm sets signed_in and upserts profile", async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: {
        user: { id: "user-1", email: "new@example.com" },
        session: { user: { id: "user-1", email: "new@example.com" } },
      },
      error: null,
    } as never);
    mockSupabase.from.mockReturnValueOnce({
      upsert: vi.fn(async () => ({ data: null, error: null })),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "user-1", display_name: "New User", team_id: null, referred_by: null },
            error: null,
          }),
        }),
      }),
    } as never);
    // fetchProfile call
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "user-1", display_name: "New User", team_id: null, referred_by: null },
            error: null,
          }),
        }),
      }),
    } as never);

    await useAuthStore.getState().signUp("new@example.com", "password123", "New User");
    expect(useAuthStore.getState().status).toBe("signed_in");
    expect(useAuthStore.getState().userId).toBe("user-1");
  });

  it("signUp with email confirmation throws CHECK_EMAIL", async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: {
        user: { id: "user-1", email: "new@example.com" },
        session: null,
      },
      error: null,
    } as never);

    await expect(
      useAuthStore.getState().signUp("new@example.com", "password123", "New User"),
    ).rejects.toThrow("CHECK_EMAIL");
    expect(useAuthStore.getState().status).toBe("signed_out");
  });

  it("signUp passes display_name in options.data", async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: "user-1", email: "a@b.com" }, session: null },
      error: null,
    } as never);

    await useAuthStore.getState().signUp("a@b.com", "pass123", "MyName").catch(() => {});
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "pass123",
      options: { data: { display_name: "MyName" } },
    });
  });

  it("signIn upserts profile when fetchProfile returns null", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-2",
          email: "noProfile@example.com",
          user_metadata: { display_name: "Ghost" },
        },
        session: { user: { id: "user-2" } },
      },
      error: null,
    } as never);

    // First fetchProfile returns null (no profile row)
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    } as never);
    // upsert call to create profile
    mockSupabase.from.mockReturnValueOnce({
      upsert: vi.fn(async () => ({ data: null, error: null })),
    } as never);
    // Second fetchProfile returns created profile
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "user-2", display_name: "Ghost", team_id: null, referred_by: null },
            error: null,
          }),
        }),
      }),
    } as never);

    await useAuthStore.getState().signIn("noProfile@example.com", "password123");
    expect(useAuthStore.getState().status).toBe("signed_in");
    expect(useAuthStore.getState().profile?.displayName).toBe("Ghost");
  });

  it("createTeam sets team state", async () => {
    useAuthStore.setState({ status: "signed_in", userId: "user-1" });
    // 1. from("teams").insert() — insert without return
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as never);
    // 2. from("teams").select().eq().single() — fetch created team
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "team-1", name: "Test Team", join_code: "ABC123", created_by: "user-1" },
            error: null,
          }),
        }),
      }),
    } as never);
    // 3. from("profiles").update().eq() — link profile to team
    mockSupabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    } as never);
    // 4. from("profiles").select().eq().single() — fetchProfile
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "user-1", display_name: "Test", team_id: "team-1", referred_by: null },
            error: null,
          }),
        }),
      }),
    } as never);

    const code = await useAuthStore.getState().createTeam("Test Team");
    expect(code).toBeTruthy();
    expect(useAuthStore.getState().team).toBeTruthy();
    expect(useAuthStore.getState().team?.name).toBe("Test Team");
  });

  it("createTeam throws when profile update fails", async () => {
    useAuthStore.setState({ status: "signed_in", userId: "user-1" });
    const updateError = new Error("Profile update failed");
    // 1. from("teams").insert()
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as never);
    // 2. from("teams").select().eq().single()
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "team-1", name: "Test Team", join_code: "ABC123", created_by: "user-1" },
            error: null,
          }),
        }),
      }),
    } as never);
    // 3. from("profiles").update().eq() — returns error
    mockSupabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: updateError }),
      }),
    } as never);

    await expect(
      useAuthStore.getState().createTeam("Test Team"),
    ).rejects.toThrow("Profile update failed");
  });
});
