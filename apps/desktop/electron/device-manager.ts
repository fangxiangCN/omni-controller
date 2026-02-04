import type { DeviceFrame, DeviceInfo, DeviceListPayload } from '@omni/shared'
import { AndroidAdapter } from '@omni/drivers-android'

type DeviceManagerCallbacks = {
  onDeviceList: (payload: DeviceListPayload) => void
  onLog: (payload: { type: 'info' | 'error' | 'thought'; content: string }) => void
  onFrame: (payload: { deviceId: string; format: 'h264' | 'jpeg'; data: Uint8Array }) => void
}

const NON_ANDROID_DEVICES: DeviceInfo[] = [
  { id: 'ohos', name: 'HarmonyOS', type: 'ohos' },
  { id: 'web', name: 'Web-Playwright', type: 'web' },
]

export class DeviceManager {
  private android = new AndroidAdapter()
  private activeDeviceId = ''
  private pollTimer?: ReturnType<typeof setInterval>
  private streaming = false

  constructor(private callbacks: DeviceManagerCallbacks) {}

  getAndroidAdapter(): AndroidAdapter {
    return this.android
  }

  getActiveDeviceId(): string {
    return this.activeDeviceId
  }

  async startPolling(intervalMs = 3000) {
    await this.refreshDevices()
    this.pollTimer = setInterval(() => {
      this.refreshDevices().catch(() => {})
    }, intervalMs)
  }

  stopPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer)
  }

  async refreshDevices() {
    const androidDevices = await this.android.listDevices()
    this.callbacks.onDeviceList({ devices: [...androidDevices, ...NON_ANDROID_DEVICES] })
  }

  async selectDevice(deviceId: string) {
    if (!deviceId) return
    if (deviceId === this.activeDeviceId) return

    if (deviceId === 'ohos' || deviceId === 'web') {
      this.callbacks.onLog({
        type: 'info',
        content: `设备 ${deviceId} 暂未接入`,
      })
      return
    }

    if (this.activeDeviceId) {
      await this.android.disconnect()
      this.streaming = false
    }

    const result = await this.android.connectWithResult?.(deviceId)
    if (!result?.ok) {
      this.callbacks.onLog({
        type: 'error',
        content: `Android 连接失败: ${deviceId} (${result?.error || 'unknown'})`,
      })
      return
    }

    this.activeDeviceId = deviceId
    await this.ensureStream()
    await this.refreshDevices()
  }

  async ensureStream() {
    if (this.streaming) return
    if (!this.activeDeviceId) return
    this.streaming = true
    await this.android.startStream((frame: DeviceFrame) => {
      this.callbacks.onFrame({
        deviceId: this.activeDeviceId,
        format: frame.format,
        data: frame.data,
      })
    })
  }
}
