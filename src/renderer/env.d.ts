/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  api?: {
    ipcRenderer?: {
      send: (channel: string, ...args: any[]) => void
      invoke: (channel: string, ...args: any[]) => Promise<any>
      on: (channel: string, callback: (...args: any[]) => void) => (() => void)
    }
    minimizeWindow?: () => void
    toggleMaximizeWindow?: () => void
    closeWindow?: () => void
    onWindowStateChange?: (callback: (state: { maximized: boolean }) => void) => void
  }
}
