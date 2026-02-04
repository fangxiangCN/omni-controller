import type { DeviceFrame, DeviceInfo, DeviceSize } from '@omni/shared'

export interface IDeviceAdapter {
  interfaceType: string

  screenshotBase64(): Promise<string>
  size(): Promise<DeviceSize>
  actionSpace(): unknown[]

  getContext?(): Promise<unknown>
  destroy?(): Promise<void>
  getDeviceInfo?(): Promise<DeviceInfo>

  connect(): Promise<boolean>
  disconnect(): Promise<void>

  startStream(onFrame: (frame: DeviceFrame) => void): Promise<void>
  tap(x: number, y: number): Promise<void>
  type(text: string): Promise<void>
  scroll(dx: number, dy: number): Promise<void>
  back(): Promise<void>
}
