import type { DeviceFrame, DeviceInfo, DeviceSize } from '@omni/shared'
import type { IDeviceAdapter } from '@omni/drivers-interface'
import {
  defineActionTap,
  defineActionInput,
  defineActionScroll,
  defineActionKeyboardPress,
  defineActionLongPress,
  defineActionSwipe,
} from '@omni/core/device'
import type { DeviceAction } from '@omni/core'
import { AdbClient } from './adb/adb-client'
import { ScrcpyClient } from './scrcpy/scrcpy-client'
import { safeStop } from './lifecycle'
import type { ConnectResult } from './types'

// Reference: references/aya
export class AndroidAdapter implements IDeviceAdapter {
  interfaceType = 'android'
  private adb = new AdbClient()
  private scrcpy?: ScrcpyClient
  private deviceId = ''
  private deviceSize?: DeviceSize

  async connect(deviceId?: string): Promise<boolean> {
    const result = await this.connectWithResult(deviceId)
    return result.ok
  }

  async connectWithResult(deviceId?: string): Promise<ConnectResult> {
    try {
      const devices = await this.adb.listDevices()
      if (deviceId) {
        const exists = devices.find((d) => d.id === deviceId)
        if (!exists) return { ok: false, error: 'device_not_found' }
        this.deviceId = deviceId
        this.scrcpy = new ScrcpyClient(this.deviceId, this.adb)
        this.deviceSize = await this.size()
        return { ok: true }
      }
      if (!devices.length) return { ok: false, error: 'no_devices' }
      this.deviceId = devices[0].id
      this.scrcpy = new ScrcpyClient(this.deviceId, this.adb)
      this.deviceSize = await this.size()
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e?.message || 'connect_error' }
    }
  }

  async listDevices(): Promise<DeviceInfo[]> {
    const devices = await this.adb.listDevices()
    return devices.map((d) => ({
      id: d.id,
      name: d.id,
      type: 'android',
    }))
  }

  async disconnect(): Promise<void> {
    await safeStop(this.scrcpy)
    this.scrcpy = undefined
    this.deviceId = ''
    this.deviceSize = undefined
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

  actionSpace(): DeviceAction[] {
    return [
      defineActionTap(async (param) => {
        const { center } = param.locate
        await this.tap(center[0], center[1])
      }),
      defineActionInput(async (param) => {
        await this.type(param.value)
      }),
      defineActionKeyboardPress(async (param) => {
        if (param.keyName.toLowerCase() === 'backspace') {
          await this.scrcpy?.backspace()
        }
      }),
      defineActionScroll(async (param) => {
        const dir = param.direction || 'down'
        const distance = param.distance || 300
        if (dir === 'down') {
          await this.scroll(0, distance)
        } else if (dir === 'up') {
          await this.scroll(0, -distance)
        } else if (dir === 'left') {
          await this.scroll(-distance, 0)
        } else if (dir === 'right') {
          await this.scroll(distance, 0)
        }
      }),
      defineActionLongPress(async (param) => {
        const { center } = param.locate
        const size = await this.ensureSize()
        await this.scrcpy?.longPress(center[0], center[1], size, 500)
      }),
      defineActionSwipe(async (param) => {
        const start = param.start?.center
        const end = param.end?.center
        if (start && end) {
          const size = await this.ensureSize()
          await this.scrcpy?.swipe(start, end, size)
          return
        }
        const dir = param.direction || 'down'
        const distance = param.distance || 300
        if (dir === 'down') {
          await this.scroll(0, distance)
        } else if (dir === 'up') {
          await this.scroll(0, -distance)
        } else if (dir === 'left') {
          await this.scroll(-distance, 0)
        } else if (dir === 'right') {
          await this.scroll(distance, 0)
        }
      }),
    ]
  }

  async startStream(onFrame: (frame: DeviceFrame) => void): Promise<void> {
    await this.scrcpy?.startStream(onFrame)
  }

  async tap(x: number, y: number): Promise<void> {
    const size = await this.ensureSize()
    await this.scrcpy?.tap(x, y, size)
  }

  async type(text: string): Promise<void> {
    await this.scrcpy?.type(text)
  }

  async scroll(dx: number, dy: number): Promise<void> {
    const size = await this.ensureSize()
    await this.scrcpy?.scroll(dx, dy, size)
  }

  async back(): Promise<void> {
    await this.scrcpy?.back()
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    return { id: this.deviceId || 'android-unknown', name: 'Android', type: 'android' }
  }

  private async ensureSize(): Promise<DeviceSize> {
    if (!this.deviceSize || this.deviceSize.width === 0 || this.deviceSize.height === 0) {
      this.deviceSize = await this.size()
    }
    return this.deviceSize
  }
}
