import type { DeviceFrame, DeviceSize, DeviceInfo } from '../interface'
import type { IDeviceAdapter, DeviceAction } from '../interface'
import { AdbClient } from './adb/adb-client'

type ConnectResult = { ok: boolean; error?: string }

export class AndroidAdapter implements IDeviceAdapter {
  interfaceType = 'android'
  deviceId = ''
  deviceName = ''
  
  private adb: AdbClient
  private deviceSize?: DeviceSize

  constructor(adbPath?: string) {
    this.adb = new AdbClient(adbPath)
  }

  async connect(deviceId?: string): Promise<boolean> {
    const result = await this.connectWithResult(deviceId)
    return result.ok
  }

  async connectWithResult(deviceId?: string): Promise<ConnectResult> {
    try {
      const devices = await this.adb.listDevices()
      if (!devices || devices.length === 0) {
        return { ok: false, error: 'no_devices' }
      }
      
      if (deviceId) {
        const exists = devices.find((d) => d.id === deviceId)
        if (!exists) return { ok: false, error: 'device_not_found' }
        this.deviceId = deviceId
        try {
          this.deviceSize = await this.size()
        } catch {
          this.deviceSize = { width: 0, height: 0 }
        }
        return { ok: true }
      }
      
      this.deviceId = devices[0].id
      try {
        this.deviceSize = await this.size()
      } catch {
        this.deviceSize = { width: 0, height: 0 }
      }
      return { ok: true }
    } catch (e: any) {
      console.error('Connection error:', e)
      return { ok: false, error: e?.message || 'connect_error' }
    }
  }

  async listDevices(): Promise<DeviceInfo[]> {
    try {
      const devices = await this.adb.listDevices()
      if (!devices || devices.length === 0) {
        return []
      }
      
      return Promise.all(
        devices.map(async (d) => {
          let name = d.id
          let osVersion = ''
          try {
            name = (await this.adb.shell(d.id, 'getprop ro.product.model')).trim() || d.id
            osVersion = (await this.adb.shell(d.id, 'getprop ro.build.version.release')).trim()
          } catch (err) {
            // ignore shell errors for basic device info
          }
          return {
            id: d.id,
            name,
            type: 'android' as const,
            status: d.state === 'device' ? 'connected' : 'disconnected',
            osVersion,
          }
        })
      )
    } catch (error) {
      console.error('Error listing devices:', error)
      return []
    }
  }

  async disconnect(): Promise<void> {
    this.deviceId = ''
    this.deviceSize = undefined
  }

  async screenshot(): Promise<Buffer> {
    return this.adb.shellRaw(this.deviceId, 'screencap -p')
  }

  async screenshotBase64(): Promise<string> {
    const buffer = await this.screenshot()
    return buffer.toString('base64')
  }

  async size(): Promise<DeviceSize> {
    const sizeStr = await this.adb.shell(this.deviceId, 'wm size')
    const match = /Physical size: (\d+)x(\d+)/.exec(sizeStr)
    if (match) {
      return { width: Number(match[1]), height: Number(match[2]) }
    }
    return { width: 0, height: 0 }
  }

  // Simplified stream using screenshot polling
  private streamInterval?: NodeJS.Timeout
  
  async startStream(onFrame: (frame: DeviceFrame) => void): Promise<void> {
    // Poll screenshot every 200ms for streaming effect
    this.streamInterval = setInterval(async () => {
      try {
        const data = await this.screenshot()
        onFrame({
          format: 'png',
          data,
          timestamp: Date.now(),
        })
      } catch (e) {
        console.error('Screenshot error:', e)
      }
    }, 200)
  }

  async stopStream(): Promise<void> {
    if (this.streamInterval) {
      clearInterval(this.streamInterval)
      this.streamInterval = undefined
    }
  }

  actionSpace(): DeviceAction<any, any>[] {
    return [
      {
        name: 'tap',
        description: 'Tap on screen at coordinates',
        execute: async (param: { x: number; y: number }) => {
          await this.tap(param.x, param.y)
        },
      },
      {
        name: 'type',
        description: 'Type text',
        execute: async (param: { text: string }) => {
          await this.type(param.text)
        },
      },
      {
        name: 'swipe',
        description: 'Swipe on screen',
        execute: async (param: { fromX: number; fromY: number; toX: number; toY: number }) => {
          await this.swipe(param.fromX, param.fromY, param.toX, param.toY)
        },
      },
      {
        name: 'back',
        description: 'Press back button',
        execute: async () => {
          await this.back()
        },
      },
      {
        name: 'home',
        description: 'Press home button',
        execute: async () => {
          await this.home()
        },
      },
    ]
  }

  async tap(x: number, y: number): Promise<void> {
    await this.adb.shell(this.deviceId, `input tap ${x} ${y}`)
  }

  async longPress(x: number, y: number, duration = 500): Promise<void> {
    await this.adb.shell(this.deviceId, `input swipe ${x} ${y} ${x} ${y} ${duration}`)
  }

  async swipe(fromX: number, fromY: number, toX: number, toY: number, duration = 300): Promise<void> {
    await this.adb.shell(this.deviceId, `input swipe ${fromX} ${fromY} ${toX} ${toY} ${duration}`)
  }

  async type(text: string): Promise<void> {
    // Escape special characters for shell
    const escaped = text.replace(/"/g, '\\"')
    await this.adb.shell(this.deviceId, `input text "${escaped}"`)
  }

  async back(): Promise<void> {
    await this.adb.shell(this.deviceId, 'input keyevent 4')
  }

  async home(): Promise<void> {
    await this.adb.shell(this.deviceId, 'input keyevent 3')
  }

  async getApps(): Promise<string[]> {
    const output = await this.adb.shell(this.deviceId, 'pm list packages')
    return output
      .split('\n')
      .map((line) => line.replace('package:', ''))
      .filter(Boolean)
  }

  async launchApp(packageName: string): Promise<void> {
    await this.adb.shell(this.deviceId, `monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`)
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    const id = this.deviceId || 'android-unknown'
    let name = 'Android'
    let osVersion = ''
    let resolution = ''
    
    try {
      name = (await this.adb.shell(id, 'getprop ro.product.model')).trim() || name
      osVersion = (await this.adb.shell(id, 'getprop ro.build.version.release')).trim()
      const size = await this.size()
      resolution = `${size.width}x${size.height}`
    } catch {
      // ignore
    }
    
    return { 
      id, 
      name, 
      type: 'android', 
      status: 'connected',
      osVersion, 
      resolution,
    }
  }
}
