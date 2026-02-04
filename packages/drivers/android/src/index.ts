import type { DeviceFrame, DeviceInfo, DeviceSize } from '@omni/shared'
import type { IDeviceAdapter } from '@omni/drivers-interface'
import { AdbClient } from './adb/adb-client'
import { ScrcpyClient } from './scrcpy/scrcpy-client'

// Reference: references/aya
export class AndroidAdapter implements IDeviceAdapter {
  interfaceType = 'android'
  private adb = new AdbClient()
  private scrcpy?: ScrcpyClient
  private deviceId = ''

  async connect(deviceId?: string): Promise<boolean> {
    if (deviceId) {
      this.deviceId = deviceId
      this.scrcpy = new ScrcpyClient(this.deviceId, this.adb)
      return true
    }
    const devices = await this.adb.listDevices()
    if (!devices.length) return false
    this.deviceId = devices[0].id
    this.scrcpy = new ScrcpyClient(this.deviceId, this.adb)
    return true
  }

  async disconnect(): Promise<void> {
    await this.scrcpy?.stop()
  }

  async screenshotBase64(): Promise<string> {
    const output = await this.adb.shellRaw(this.deviceId, 'screencap -p')
    return Buffer.from(output).toString('base64')
  }

  async size(): Promise<DeviceSize> {
    const sizeStr = await this.adb.shell(this.deviceId, 'wm size')
    const match = /Physical size: (\d+)x(\d+)/.exec(sizeStr)
    if (match) {
      return { width: Number(match[1]), height: Number(match[2]) }
    }
    return { width: 0, height: 0 }
  }

  actionSpace(): unknown[] {
    return []
  }

  async startStream(onFrame: (frame: DeviceFrame) => void): Promise<void> {
    await this.scrcpy?.startStream(onFrame)
  }

  async tap(x: number, y: number): Promise<void> {
    await this.adb.shell(this.deviceId, `input tap ${x} ${y}`)
  }

  async type(text: string): Promise<void> {
    await this.adb.shell(this.deviceId, `input text ${JSON.stringify(text)}`)
  }

  async scroll(dx: number, dy: number): Promise<void> {
    await this.adb.shell(this.deviceId, `input swipe 0 0 ${dx} ${dy}`)
  }

  async back(): Promise<void> {
    await this.adb.shell(this.deviceId, 'input keyevent 4')
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    return { id: this.deviceId || 'android-unknown', name: 'Android', type: 'android' }
  }
}
