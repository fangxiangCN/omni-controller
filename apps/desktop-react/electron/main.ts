import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { PlaygroundServer } from '@omni/playground'
import { createAgentFromEnv } from '@omni/core'
import {
  IPC_DEVICE_FRAME,
  IPC_DEVICE_LIST,
  IPC_DEVICE_SELECT,
  IPC_START_TASK,
  IPC_STOP_TASK,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
  type DeviceFramePayload,
  type DeviceListPayload,
  type TaskLogPayload,
  type TaskStatePayload,
} from '@omni/shared'
import { PLAYGROUND_SERVER_PORT } from '@omni/shared/constants'
import { DeviceManager } from './device-manager'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null
let deviceManager: DeviceManager | null = null
let playgroundServer: PlaygroundServer | null = null

function sendToRenderer<T>(channel: string, payload: T) {
  if (!win) return
  win.webContents.send(channel, payload)
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

function registerDeviceManager() {
  deviceManager = new DeviceManager()
  deviceManager.on('deviceList', (devices) => {
    const payload: DeviceListPayload = { devices }
    sendToRenderer(IPC_DEVICE_LIST, payload)
  })
  deviceManager.on('frame', ({ deviceId, frame }) => {
    const payload: DeviceFramePayload = {
      deviceId,
      format: frame.format,
      data: frame.data,
    }
    sendToRenderer(IPC_DEVICE_FRAME, payload)
  })
  deviceManager.on('log', (log) => {
    const payload: TaskLogPayload = {
      type: log.type,
      content: log.content,
    }
    sendToRenderer(IPC_TASK_LOG, payload)
  })
  deviceManager.startPolling()
}

async function ensurePlaygroundServer() {
  if (!deviceManager) return
  playgroundServer = new PlaygroundServer(async () => {
    if (!deviceManager) {
      throw new Error('Device manager not initialized')
    }
    if (!deviceManager.getActiveDeviceId()) {
      await deviceManager.refreshDevices()
    }
    if (!deviceManager.getActiveDeviceId()) {
      throw new Error('No active device available')
    }
    return createAgentFromEnv(deviceManager.getAdapter())
  })

  playgroundServer.app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }
    next()
  })

  await playgroundServer.launch(PLAYGROUND_SERVER_PORT)
  const payload: TaskLogPayload = {
    type: 'info',
    content: `Playground server running on :${playgroundServer.port}`,
  }
  sendToRenderer(IPC_TASK_LOG, payload)
}

function registerIpc() {
  ipcMain.on(IPC_DEVICE_SELECT, async (_event, payload: { deviceId?: string }) => {
    if (!deviceManager) return
    await deviceManager.selectDevice(payload?.deviceId || '')
  })
  ipcMain.on(IPC_START_TASK, (_event, _payload: { instruction: string; deviceId: string }) => {
    const payload: TaskStatePayload = { status: 'running', startedAt: Date.now() }
    sendToRenderer(IPC_TASK_STATE, payload)
  })
  ipcMain.on(IPC_STOP_TASK, () => {
    const payload: TaskStatePayload = { status: 'idle', finishedAt: Date.now() }
    sendToRenderer(IPC_TASK_STATE, payload)
  })
}

app.whenReady().then(async () => {
  registerDeviceManager()
  registerIpc()
  createWindow()

  const payload: TaskStatePayload = { status: 'idle' }
  sendToRenderer(IPC_TASK_STATE, payload)

  try {
    await ensurePlaygroundServer()
  } catch (error: any) {
    sendToRenderer(IPC_TASK_LOG, {
      type: 'error',
      content: error?.message || 'Failed to start playground server',
    } satisfies TaskLogPayload)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
