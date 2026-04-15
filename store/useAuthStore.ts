import { create } from "zustand";
import { Session } from "next-auth";

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  isAdmin: false,
  setSession: (session) =>
    set({
      session,
      isAuthenticated: !!session,
      isAdmin: session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR",
    }),
}));

