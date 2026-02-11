import type { DeviceFrame } from '../../types'
import { ScrcpyClient } from './scrcpy/scrcpy-client'

export async function safeStop(scrcpy?: ScrcpyClient) {
  try {
    await scrcpy?.stop()
  } catch {}
}

export function drainFrameQueue(frames: DeviceFrame[]) {
  frames.length = 0
}
