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
      version: 1,
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
      migrate: (persistedState: any, version: number) => {
        // If version is 0 (no version), migrate to version 1
        if (version === 0) {
          return { isCollapsed: persistedState.isCollapsed || false }
        }
        return persistedState
      },
      // Add fallback to handle migration errors
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Sidebar store rehydration failed, using default state:', error)
          // Clear the corrupted storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('sidebar-storage')
          }
        }
      }
    }
  )
)
