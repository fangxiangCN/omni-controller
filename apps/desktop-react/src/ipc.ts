import { on, send } from '@omni/ipc-client'

export function ipcSend<T>(channel: string, payload: T) {
  send(channel, payload)
}

export function ipcOn<T>(channel: string, cb: (payload: T) => void) {
  return on<T>(channel, cb)
}
