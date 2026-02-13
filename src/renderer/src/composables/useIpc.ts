import { onMounted, onUnmounted } from 'vue'

export function useIpc() {
  const ipcRenderer = (window as any).api?.ipcRenderer

  function on(channel: string, handler: (...args: any[]) => void) {
    if (!ipcRenderer) {
      console.warn('[IPC] ipcRenderer not available')
      return () => {}
    }
    return ipcRenderer.on(channel, handler)
  }

  function send(channel: string, ...args: any[]) {
    if (!ipcRenderer) {
      console.warn('[IPC] ipcRenderer not available')
      return
    }
    ipcRenderer.send(channel, ...args)
  }

  function invoke(channel: string, ...args: any[]) {
    if (!ipcRenderer) {
      console.warn('[IPC] ipcRenderer not available')
      return Promise.resolve(null)
    }
    return ipcRenderer.invoke(channel, ...args)
  }

  return { on, send, invoke, ipcRenderer }
}
