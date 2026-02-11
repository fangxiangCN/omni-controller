import type { DeviceFrame, DeviceInfo, DeviceSize } from '../../types'
import type { IDeviceAdapter } from '@omni/drivers-interface'

// Reference: references/echo/src/main/lib/hdc/* and references/echo/src/renderer/screencast/*
export class OhosAdapter implements IDeviceAdapter {
  interfaceType = 'ohos'

  async connect(): Promise<boolean> {
    return false
  }

  async disconnect(): Promise<void> {}

  async screenshotBase64(): Promise<string> {
    throw new Error('Not implemented')
  }

  async size(): Promise<DeviceSize> {
    return { width: 0, height: 0 }
  }

  actionSpace(): unknown[] {
    return []
  }

  async startStream(_onFrame: (frame: DeviceFrame) => void): Promise<void> {
    throw new Error('Not implemented')
  }

  async tap(_x: number, _y: number): Promise<void> {}

  async type(_text: string): Promise<void> {}

  async scroll(_dx: number, _dy: number): Promise<void> {}

  async back(): Promise<void> {}

  async getDeviceInfo(): Promise<DeviceInfo> {
    return { id: 'ohos-unknown', name: 'HarmonyOS', type: 'ohos' }
  }
}
