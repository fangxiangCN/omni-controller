import type { DeviceFrame, DeviceInfo, DeviceSize } from '@omni/shared'
import type { IDeviceAdapter } from '@omni/drivers-interface'
import {
  defineActionTap,
  defineActionInput,
  defineActionScroll,
  defineActionKeyboardPress,
  defineActionLongPress,
  defineActionSwipe,
} from '@midscene/core/device'
import type { DeviceAction } from '@midscene/core'
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

  async connect(deviceId?: string): Promise<boolean> {
    const result = await this.connectWithResult(deviceId)
    return result.ok
  }

  async connectWithResult(deviceId?: string): Promise<ConnectResult> {
    const devices = await this.adb.listDevices()
    if (deviceId) {
      const exists = devices.find((d) => d.id === deviceId)
      if (!exists) return { ok: false, error: 'device_not_found' }
      this.deviceId = deviceId
      this.scrcpy = new ScrcpyClient(this.deviceId, this.adb)
      return { ok: true }
    }
    if (!devices.length) return { ok: false, error: 'no_devices' }
    this.deviceId = devices[0].id
    this.scrcpy = new ScrcpyClient(this.deviceId, this.adb)
    return { ok: true }
  }

  async disconnect(): Promise<void> {
    await safeStop(this, this.scrcpy)
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
          await this.adb.shell(this.deviceId, 'input keyevent 67')
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
        await this.adb.shell(this.deviceId, `input swipe ${center[0]} ${center[1]} ${center[0]} ${center[1]} 500`)
      }),
      defineActionSwipe(async (param) => {
        const start = param.start?.center || [0, 0]
        const end = param.end?.center || [0, 0]
        await this.adb.shell(this.deviceId, `input swipe ${start[0]} ${start[1]} ${end[0]} ${end[1]}`)\n      }),
    ]
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
