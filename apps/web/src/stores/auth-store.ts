import { create } from "zustand";
import type { AuthUser } from "@price-tracker/shared";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  setAccessToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),

  setAccessToken: (accessToken) => set({ accessToken }),
}));

export function useAuth() {
  const { user, accessToken, isAuthenticated, setAuth, clearAuth } =
    useAuthStore();
  return { user, accessToken, isAuthenticated, setAuth, clearAuth };
}
