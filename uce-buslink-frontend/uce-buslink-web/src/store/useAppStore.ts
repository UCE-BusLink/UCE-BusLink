import { create } from 'zustand'

interface AppState {
  isSidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void

  activeTrackingRouteId: string | null
  activeTrackingTripId: string | null
  setActiveTracking: (params: { routeId: string | null; tripId: string | null }) => void
  clearActiveTracking: () => void

  unreadNotificationsCount: number
  setUnreadNotificationsCount: (count: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  activeTrackingRouteId: null,
  activeTrackingTripId: null,
  setActiveTracking: ({ routeId, tripId }) =>
    set({ activeTrackingRouteId: routeId, activeTrackingTripId: tripId }),
  clearActiveTracking: () => set({ activeTrackingRouteId: null, activeTrackingTripId: null }),

  unreadNotificationsCount: 0,
  setUnreadNotificationsCount: (count) => set({ unreadNotificationsCount: count }),
}))
