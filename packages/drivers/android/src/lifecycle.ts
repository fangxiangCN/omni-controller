import type { DeviceFrame } from '@omni/shared'
import { ScrcpyClient } from './scrcpy/scrcpy-client'

export async function safeStop(scrcpy?: ScrcpyClient) {
  try {
    await scrcpy?.stop()
  } catch {}
}

export function drainFrameQueue(frames: DeviceFrame[]) {
  frames.length = 0
}
