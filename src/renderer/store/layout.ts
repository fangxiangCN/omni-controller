import { create } from 'zustand'

type WorkspaceMode = 'playground' | 'report' | 'recorder'

type LayoutState = {
  mode: WorkspaceMode
  theme: 'dark' | 'light'
  devicePanelWidth: number
  inspectorPanelWidth: number
  devicePanelCollapsed: boolean
  inspectorPanelCollapsed: boolean
  setMode: (mode: WorkspaceMode) => void
  setTheme: (theme: 'dark' | 'light') => void
  setDevicePanelWidth: (width: number) => void
  setInspectorPanelWidth: (width: number) => void
  setDevicePanelCollapsed: (collapsed: boolean) => void
  setInspectorPanelCollapsed: (collapsed: boolean) => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  mode: 'playground',
  theme: 'dark',
  devicePanelWidth: 240,
  inspectorPanelWidth: 280,
  devicePanelCollapsed: false,
  inspectorPanelCollapsed: false,
  setMode: (mode) => set({ mode }),
  setTheme: (theme) => set({ theme }),
  setDevicePanelWidth: (width) => set({ devicePanelWidth: width }),
  setInspectorPanelWidth: (width) => set({ inspectorPanelWidth: width }),
  setDevicePanelCollapsed: (collapsed) => set({ devicePanelCollapsed: collapsed }),
  setInspectorPanelCollapsed: (collapsed) => set({ inspectorPanelCollapsed: collapsed }),
}))
