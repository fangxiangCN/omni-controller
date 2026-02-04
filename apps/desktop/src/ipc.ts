export function ipcOn<T = unknown>(channel: string, cb: (payload: T) => void) {
  const ipc = (window as any)?.ipcRenderer
  if (!ipc?.on) return
  ipc.on(channel, (_event: unknown, payload: T) => cb(payload))
}

export function ipcSend<T = unknown>(channel: string, payload: T) {
  const ipc = (window as any)?.ipcRenderer
  if (!ipc?.send) return
  ipc.send(channel, payload)
}
