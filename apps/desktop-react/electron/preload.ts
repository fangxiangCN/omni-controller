import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('omni', {
  send: (channel: string, payload?: unknown) => ipcRenderer.send(channel, payload),
  on: (channel: string, listener: (...args: unknown[]) => void) =>
    ipcRenderer.on(channel, (_event, ...args) => listener(...args)),
})
