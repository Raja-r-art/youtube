import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set, get) => ({
      darkMode: true,
      sidebarCollapsed: false,
      miniPlayer: null, // { url, thumbnail, title, id }
      toggleDark: () => {
        const next = !get().darkMode;
        document.documentElement.classList.toggle("dark", next);
        set({ darkMode: next });
      },
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMiniPlayer: (data) => set({ miniPlayer: data }),
      closeMiniPlayer: () => set({ miniPlayer: null }),
    }),
    {
      name: "ui-store",
      partialize: (s) => ({ darkMode: s.darkMode, sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
