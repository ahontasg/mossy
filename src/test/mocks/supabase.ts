import { vi, beforeEach } from "vitest";

const mockSession = { user: null as { id: string; email: string } | null };
const authChangeCallbacks: ((event: string, session: unknown) => void)[] = [];

export const mockSupabase = {
  auth: {
    getSession: vi.fn(async () => ({
      data: { session: mockSession.user ? { user: mockSession.user } : null },
      error: null,
    })),
    signUp: vi.fn(async ({ email }: { email: string; password: string }) => {
      mockSession.user = { id: "user-1", email };
      return { data: { user: mockSession.user, session: { user: mockSession.user } }, error: null };
    }),
    signInWithPassword: vi.fn(async ({ email }: { email: string; password: string }) => {
      mockSession.user = { id: "user-1", email };
      return { data: { user: mockSession.user, session: { user: mockSession.user } }, error: null };
    }),
    signOut: vi.fn(async () => {
      mockSession.user = null;
      return { error: null };
    }),
    onAuthStateChange: vi.fn((cb: (event: string, session: unknown) => void) => {
      authChangeCallbacks.push(cb);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
  },
  from: vi.fn((_table: string) => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(async () => ({ data: null, error: null })),
        order: vi.fn(() => ({
          limit: vi.fn(async () => ({ data: [], error: null })),
        })),
        data: [],
        error: null,
      })),
      order: vi.fn(() => ({
        limit: vi.fn(async () => ({ data: [], error: null })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(async () => ({ data: { id: "new-id", join_code: "ABC123" }, error: null })),
      })),
    })),
    upsert: vi.fn(async () => ({ data: null, error: null })),
    update: vi.fn(() => ({
      eq: vi.fn(async () => ({ data: null, error: null })),
    })),
  })),
  rpc: vi.fn(async () => ({ data: null, error: null })),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
    unsubscribe: vi.fn(),
  })),
};

// Helper to simulate auth state changes in tests
export function simulateAuthChange(event: string, session: unknown) {
  for (const cb of authChangeCallbacks) {
    cb(event, session);
  }
}

export function resetMockSession() {
  mockSession.user = null;
  authChangeCallbacks.length = 0;
}

beforeEach(() => {
  resetMockSession();
  vi.clearAllMocks();
});

vi.mock("../../lib/supabase", () => ({
  supabase: mockSupabase,
  isSupabaseConfigured: vi.fn(() => true),
}));
