import type { DeviceFrame, DeviceInfo, DeviceSize } from '@omni/shared'
import type { DeviceAction } from '@midscene/core'

export interface IDeviceAdapter {
  interfaceType: string

  screenshotBase64(): Promise<string>
  size(): Promise<DeviceSize>
  actionSpace(): DeviceAction[]

  getContext?(): Promise<unknown>
  destroy?(): Promise<void>
  getDeviceInfo?(): Promise<DeviceInfo>

  connect(deviceId?: string): Promise<boolean>
  disconnect(): Promise<void>

  startStream(onFrame: (frame: DeviceFrame) => void): Promise<void>
  tap(x: number, y: number): Promise<void>
  type(text: string): Promise<void>
  scroll(dx: number, dy: number): Promise<void>
  back(): Promise<void>
}
