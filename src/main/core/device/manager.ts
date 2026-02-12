import { EventEmitter } from 'events'
import { AndroidAdapter } from '../../drivers/android'
import type { DeviceInfo, IDeviceAdapter, DeviceFrame } from '../../drivers/interface'
import type { BrowserWindow } from 'electron'

interface DeviceManagerEvents {
  'deviceList': (devices: DeviceInfo[]) => void
  'frame': (payload: { deviceId: string; frame: DeviceFrame }) => void
  'log': (log: { type: string; content: string }) => void
}

declare interface DeviceManager {
  on<E extends keyof DeviceManagerEvents>(event: E, listener: DeviceManagerEvents[E]): this
  emit<E extends keyof DeviceManagerEvents>(event: E, ...args: Parameters<DeviceManagerEvents[E]>): boolean
}

class DeviceManager extends EventEmitter {
  private adapters = new Map<string, IDeviceAdapter>()
  private activeDeviceId: string | null = null
  private pollingInterval?: NodeJS.Timeout
  private mainWindow?: BrowserWindow
  private adbPath?: string
  private androidAdapter?: AndroidAdapter

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window
  }

  /**
   * Set ADB binary path
   */
  setAdbPath(path: string) {
    this.adbPath = path
    // Create or update the shared AndroidAdapter
    if (!this.androidAdapter) {
      this.androidAdapter = new AndroidAdapter(this.adbPath)
    }
  }

  /**
   * Get current ADB path
   */
  getAdbPath(): string | undefined {
    return this.adbPath
  }

  /**
   * Get or create Android adapter
   */
  private getAndroidAdapter(): AndroidAdapter {
    if (!this.androidAdapter) {
      this.androidAdapter = new AndroidAdapter(this.adbPath)
    }
    return this.androidAdapter
  }

  startPolling(interval = 5000) {
    // Initial refresh with error handling - wait 2 seconds for window to be ready
    setTimeout(() => {
      this.refreshDevices().catch(err => {
        console.error('Initial device refresh failed:', err)
      })
    }, 2000)
    
    this.pollingInterval = setInterval(() => {
      this.refreshDevices().catch(err => {
        console.error('Polling device refresh failed:', err)
      })
    }, interval)
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = undefined
    }
  }

  async refreshDevices(): Promise<void> {
    try {
      // Get Android devices using shared adapter
      const androidAdapter = this.getAndroidAdapter()
      const androidDevices = await androidAdapter.listDevices()
      
      // Convert to DeviceInfo with adapters
      const devices: DeviceInfo[] = []
      
      for (const d of androidDevices) {
        try {
          // Reuse existing adapter if available
          let adapter = this.adapters.get(d.id)
          if (!adapter) {
            adapter = new AndroidAdapter(this.adbPath)
            const connected = await adapter.connect(d.id)
            if (connected) {
              this.adapters.set(d.id, adapter)
            }
          }
          
          // Get detailed info
          const info = await (adapter as AndroidAdapter).getDeviceInfo()
          devices.push({
            ...d,
            ...info,
            adapter,
          })
        } catch (deviceError) {
          console.error(`Error processing device ${d.id}:`, deviceError)
          // Add device without adapter info
          devices.push({
            ...d,
            type: 'android',
            status: 'disconnected',
            adapter: undefined,
          })
        }
      }

      this.emit('deviceList', devices)

      // Auto-select first device if none selected
      if (!this.activeDeviceId && devices.length > 0) {
        await this.selectDevice(devices[0].id)
      }
    } catch (error) {
      console.error('Failed to refresh devices:', error)
      // Check if it's an ADB not found error
      const errorStr = String(error)
      if (errorStr.includes('spawn adb ENOENT') || errorStr.includes('ENOENT')) {
        this.emit('log', {
          type: 'warning',
          content: 'ADB not found. Please install Android SDK Platform Tools or configure ADB path in settings.'
        })
      } else if (errorStr.includes('cannot connect to daemon') || errorStr.includes('failed to start daemon')) {
        this.emit('log', {
          type: 'warning',
          content: 'ADB server failed to start. This may be due to: (1) Port 5037 is in use by another ADB instance, (2) Windows Defender or antivirus is blocking ADB, (3) ADB needs administrator privileges. Try restarting your computer or running as administrator.'
        })
      } else if (errorStr.includes('createClient is not a function') || errorStr.includes('adbkit')) {
        this.emit('log', {
          type: 'warning',
          content: 'ADB library initialization failed. Please check ADB installation.'
        })
      } else {
        this.emit('log', { type: 'warning', content: `Device refresh failed: ${error}` })
      }

      // Emit empty device list on error
      this.emit('deviceList', [])
    }
  }

  async selectDevice(deviceId: string): Promise<boolean> {
    const adapter = this.adapters.get(deviceId)
    if (!adapter) {
      this.emit('log', { type: 'error', content: `Device ${deviceId} not found` })
      return false
    }

    // Stop stream on previous device
    if (this.activeDeviceId && this.activeDeviceId !== deviceId) {
      const prevAdapter = this.adapters.get(this.activeDeviceId)
      if (prevAdapter) {
        await prevAdapter.stopStream()
      }
    }

    this.activeDeviceId = deviceId
    this.emit('log', { type: 'info', content: `Selected device: ${deviceId}` })

    // Start streaming
    this.startStreaming(deviceId)
    
    return true
  }

  async disconnect(deviceId: string): Promise<void> {
    const adapter = this.adapters.get(deviceId)
    if (adapter) {
      await adapter.stopStream()
      await adapter.disconnect()
      this.adapters.delete(deviceId)
    }
    
    if (this.activeDeviceId === deviceId) {
      this.activeDeviceId = null
    }
  }

  getActiveDevice(): IDeviceAdapter | null {
    if (!this.activeDeviceId) return null
    return this.adapters.get(this.activeDeviceId) || null
  }

  getActiveDeviceId(): string | null {
    return this.activeDeviceId
  }

  private async startStreaming(deviceId: string) {
    const adapter = this.adapters.get(deviceId)
    if (!adapter) return

    try {
      await adapter.startStream((frame) => {
        this.emit('frame', { deviceId, frame })
      })
    } catch (error) {
      console.error('Failed to start stream:', error)
      this.emit('log', { type: 'error', content: `Stream error: ${error}` })
    }
  }
}

export const deviceManager = new DeviceManager()
export default deviceManager
