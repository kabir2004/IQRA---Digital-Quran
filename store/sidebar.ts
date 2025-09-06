import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      toggleMobileSidebar: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setSidebarCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
      setMobileSidebarOpen: (open: boolean) => set({ isMobileOpen: open }),
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
)
