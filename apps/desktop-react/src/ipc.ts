type OmniIpc = {
  send: (channel: string, payload?: unknown) => void
  on: (channel: string, listener: (...args: unknown[]) => void) => void
  off?: (channel: string, listener: (...args: unknown[]) => void) => void
}

const omni = (window as any)?.omni as OmniIpc | undefined

export function ipcSend<T>(channel: string, payload: T) {
  if (!omni?.send) return
  omni.send(channel, payload)
}

export function ipcOn<T>(channel: string, cb: (payload: T) => void) {
  if (!omni?.on) return
  const listener = (payload: T) => cb(payload)
  omni.on(channel, listener)
  return () => {
    if (omni?.off) omni.off(channel, listener)
  }
}
