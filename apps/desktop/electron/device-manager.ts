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
  private monitorTimer?: ReturnType<typeof setInterval>
  private retryTimer?: ReturnType<typeof setTimeout>
  private streaming = false
  private lastFrameAt = 0

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
    if (!this.monitorTimer) {
      this.monitorTimer = setInterval(() => {
        this.monitorStream().catch(() => {})
      }, 3000)
    }
  }

  stopPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer)
    if (this.monitorTimer) clearInterval(this.monitorTimer)
  }

  async refreshDevices() {
    const androidDevices = await this.android.listDevices()
    const activeExists =
      !this.activeDeviceId || androidDevices.some((d: DeviceInfo) => d.id === this.activeDeviceId)
    if (!activeExists) {
      await this.android.disconnect()
      this.streaming = false
      this.activeDeviceId = ''
      this.callbacks.onLog({
        type: 'error',
        content: '当前设备已断开连接',
      })
    }
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
    try {
      await this.android.startStream((frame: DeviceFrame) => {
        this.lastFrameAt = Date.now()
        this.callbacks.onFrame({
          deviceId: this.activeDeviceId,
          format: frame.format,
          data: frame.data,
        })
      })
    } catch (e: any) {
      this.streaming = false
      this.callbacks.onLog({
        type: 'error',
        content: `流启动失败: ${e?.message || e}`,
      })
      this.scheduleRetry()
    }
  }

  private scheduleRetry() {
    if (this.retryTimer) clearTimeout(this.retryTimer)
    if (!this.activeDeviceId) return
    this.retryTimer = setTimeout(() => {
      this.ensureStream().catch(() => {})
    }, 2000)
  }

  private async monitorStream() {
    if (!this.streaming || !this.activeDeviceId) return
    if (!this.lastFrameAt) return
    if (Date.now() - this.lastFrameAt < 5000) return

    this.callbacks.onLog({
      type: 'error',
      content: '画面流断开，正在尝试重连',
    })
    this.streaming = false
    await this.android.disconnect()
    const result = await this.android.connectWithResult?.(this.activeDeviceId)
    if (!result?.ok) {
      this.callbacks.onLog({
        type: 'error',
        content: `重连失败: ${this.activeDeviceId} (${result?.error || 'unknown'})`,
      })
      this.scheduleRetry()
      return
    }
    await this.ensureStream()
  }
}
