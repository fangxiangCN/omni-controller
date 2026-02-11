import { EventEmitter } from 'node:events'
import type { DeviceFrame, DeviceInfo } from '../src/types'
import { AndroidAdapter } from '../src/main/drivers/android/src'

export type DeviceManagerEvents = {
  deviceList: (devices: DeviceInfo[]) => void
  frame: (payload: { deviceId: string; frame: DeviceFrame }) => void
  log: (payload: { type: 'info' | 'error'; content: string }) => void
}

export class DeviceManager extends EventEmitter {
  private adapter = new AndroidAdapter()
  private devices: DeviceInfo[] = []
  private activeDeviceId = ''
  private pollingTimer?: NodeJS.Timeout
  private streaming = false

  startPolling(intervalMs = 3000) {
    if (this.pollingTimer) return
    this.refreshDevices().catch(() => {})
    this.pollingTimer = setInterval(() => {
      this.refreshDevices().catch(() => {})
    }, intervalMs)
  }

  stopPolling() {
    if (this.pollingTimer) clearInterval(this.pollingTimer)
    this.pollingTimer = undefined
  }

  getDevices() {
    return this.devices
  }

  getActiveDeviceId() {
    return this.activeDeviceId
  }

  getAdapter() {
    return this.adapter
  }

  async refreshDevices() {
    try {
      const devices = await this.adapter.listDevices()
      this.devices = devices
      this.emit('deviceList', devices)
      const exists = devices.some((device) => device.id === this.activeDeviceId)
      if (!exists && this.activeDeviceId) {
        await this.disconnect()
      }
      if (!this.activeDeviceId && devices.length > 0) {
        await this.selectDevice(devices[0].id)
      }
    } catch (error: any) {
      this.emit('log', {
        type: 'error',
        content: error?.message || 'Failed to refresh devices',
      })
    }
  }

  async selectDevice(deviceId: string) {
    if (!deviceId || deviceId === this.activeDeviceId) return
    await this.connect(deviceId)
  }

  async connect(deviceId?: string) {
    if (this.activeDeviceId && deviceId && this.activeDeviceId !== deviceId) {
      await this.disconnect()
    }
    const result = await this.adapter.connectWithResult(deviceId)
    if (!result.ok) {
      this.emit('log', {
        type: 'error',
        content: `Device connect failed: ${result.error || 'unknown'}`,
      })
      return
    }
    const info = await this.adapter.getDeviceInfo()
    this.activeDeviceId = info.id
    this.devices = this.devices.map((device) =>
      device.id === info.id ? { ...device, ...info } : device,
    )
    this.emit('deviceList', this.devices)
    await this.startStream()
    this.emit('log', { type: 'info', content: `Device connected: ${info.id}` })
  }

  async disconnect() {
    await this.adapter.disconnect()
    this.activeDeviceId = ''
    this.streaming = false
  }

  private async startStream() {
    if (this.streaming) return
    this.streaming = true
    try {
      await this.adapter.startStream((frame) => {
        if (!this.activeDeviceId) return
        this.emit('frame', { deviceId: this.activeDeviceId, frame })
      })
    } catch (error: any) {
      this.streaming = false
      this.emit('log', {
        type: 'error',
        content: error?.message || 'Failed to start scrcpy stream',
      })
    }
  }
}
