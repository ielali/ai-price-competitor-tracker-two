import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@price-tracker/shared";

const mockUser: AuthUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "admin",
  tenantId: "tenant-456",
};

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it("initializes with no auth state", () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("setAuth stores user and token and sets isAuthenticated", () => {
    useAuthStore.getState().setAuth(mockUser, "access.token.here");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe("access.token.here");
    expect(state.isAuthenticated).toBe(true);
  });

  it("clearAuth resets all auth state", () => {
    useAuthStore.getState().setAuth(mockUser, "access.token.here");
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("setAccessToken updates only the access token", () => {
    useAuthStore.getState().setAuth(mockUser, "old.token");
    useAuthStore.getState().setAccessToken("new.token");

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("new.token");
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });
});
