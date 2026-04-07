import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token });
      },
      updateUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem("token");
        api.post("/auth/logout").catch(() => {});
        set({ user: null, token: null });
        // Force clear persisted store
        localStorage.removeItem("auth");
      },
      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data });
        } catch {
          set({ user: null, token: null });
          localStorage.removeItem("token");
        }
      },
    }),
    { name: "auth", partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
