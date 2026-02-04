import type { DeviceFrame } from '@omni/shared'
import type { IDeviceAdapter } from '@omni/drivers-interface'
import { ScrcpyClient } from './scrcpy/scrcpy-client'

export async function safeStop(adapter: IDeviceAdapter, scrcpy?: ScrcpyClient) {
  try {
    await scrcpy?.stop()
  } catch {}
  try {
    await adapter.disconnect()
  } catch {}
}

export function drainFrameQueue(frames: DeviceFrame[]) {
  frames.length = 0
}
