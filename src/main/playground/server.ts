import { ipcMain, BrowserWindow } from 'electron'
import type deviceManager from '../core/device/manager'
import {
  IPC_PLAYGROUND_EXECUTE,
  IPC_PLAYGROUND_GET_ACTIONS,
  IPC_PLAYGROUND_GET_SCREENSHOT,
  IPC_PLAYGROUND_GET_STATUS,
  IPC_PLAYGROUND_CANCEL,
  IPC_PLAYGROUND_DUMP_UPDATE,
  IPC_PLAYGROUND_PROGRESS,
} from '../ipc/contract'

export class PlaygroundServer {
  private deviceManager?: typeof deviceManager
  private mainWindow?: BrowserWindow

  setDeviceManager(manager: typeof deviceManager) {
    this.deviceManager = manager
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window
  }

  initialize() {
    this.setupIpcHandlers()
  }

  private setupIpcHandlers() {
    // Execute action
    ipcMain.handle(IPC_PLAYGROUND_EXECUTE, async (_event, action) => {
      console.log('Executing action:', action)
      
      try {
        const device = this.deviceManager?.getActiveDevice()
        if (!device) {
          return { success: false, error: 'No active device' }
        }

        const { type, param } = action
        
        switch (type) {
          case 'tap':
            await device.tap(param.x, param.y)
            break
          case 'type':
            await device.type(param.text)
            break
          case 'swipe':
            await device.swipe(param.fromX, param.fromY, param.toX, param.toY)
            break
          case 'back':
            await device.back()
            break
          case 'home':
            await device.home()
            break
          default:
            return { success: false, error: `Unknown action type: ${type}` }
        }

        return { success: true }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        return { success: false, error: errorMsg }
      }
    })

    // Get available actions
    ipcMain.handle(IPC_PLAYGROUND_GET_ACTIONS, async () => {
      const device = this.deviceManager?.getActiveDevice()
      if (!device) {
        return []
      }
      return device.actionSpace()
    })

    // Get screenshot
    ipcMain.handle(IPC_PLAYGROUND_GET_SCREENSHOT, async () => {
      try {
        const device = this.deviceManager?.getActiveDevice()
        if (!device) {
          return { screenshot: null, error: 'No active device' }
        }

        // Try to get screenshot from AndroidAdapter
        const adapter = device as any
        if (adapter.screenshotBase64) {
          const base64 = await adapter.screenshotBase64()
          return { screenshot: `data:image/png;base64,${base64}`, timestamp: Date.now() }
        }

        return { screenshot: null, error: 'Screenshot not supported' }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        return { screenshot: null, error: errorMsg }
      }
    })

    // Get status
    ipcMain.handle(IPC_PLAYGROUND_GET_STATUS, async () => {
      const device = this.deviceManager?.getActiveDevice()
      return {
        status: device ? 'ready' : 'disconnected',
        connected: !!device,
        deviceId: this.deviceManager?.getActiveDeviceId(),
      }
    })

    // Cancel execution
    ipcMain.handle(IPC_PLAYGROUND_CANCEL, async () => {
      console.log('Cancelling playground execution')
      return { success: true }
    })
  }

  sendDumpUpdate(dump: string, executionDump?: unknown) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(IPC_PLAYGROUND_DUMP_UPDATE, { dump, executionDump })
    }
  }

  sendProgress(tip: string) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(IPC_PLAYGROUND_PROGRESS, tip)
    }
  }
}

export const playgroundServer = new PlaygroundServer()
export default playgroundServer
