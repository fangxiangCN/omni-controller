import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  IPC_DEVICE_FRAME,
  IPC_DEVICE_LIST,
  IPC_DEVICE_SELECT,
  IPC_START_TASK,
  IPC_STOP_TASK,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
} from '@omni/shared'
import { DeviceManager } from './device-manager'
import { TaskScheduler } from './task-scheduler'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let deviceManager: DeviceManager | null = null
let scheduler: TaskScheduler | null = null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', async () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
    if (!deviceManager || !scheduler) {
      return
    }
    await deviceManager.startPolling()
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

function registerIpc() {
  ipcMain.on(IPC_DEVICE_SELECT, async (_event, payload) => {
    const deviceId = payload?.deviceId || ''
    if (!deviceManager || !scheduler || !deviceId) return
    await deviceManager.selectDevice(deviceId)
    scheduler.resetAgent()
  })
  ipcMain.on(IPC_START_TASK, async (_event, payload) => {
    const instruction = payload?.instruction || ''
    const deviceId = payload?.deviceId || ''
    if (!deviceManager || !scheduler) return
    const targetId = deviceId || deviceManager.getActiveDeviceId()
    if (!targetId) {
      win?.webContents.send(IPC_TASK_LOG, {
        type: 'error',
        content: '未选择设备，无法执行任务',
      })
      return
    }
    if (deviceId) {
      await deviceManager.selectDevice(deviceId)
    }
    await deviceManager.ensureStream()
    await scheduler.start(instruction, targetId)
  })
  ipcMain.on(IPC_STOP_TASK, () => {
    if (!scheduler) return
    scheduler.stop()
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  deviceManager = new DeviceManager({
    onDeviceList: (payload) => win?.webContents.send(IPC_DEVICE_LIST, payload),
    onLog: (payload) => win?.webContents.send(IPC_TASK_LOG, payload),
    onFrame: (payload) => win?.webContents.send(IPC_DEVICE_FRAME, payload),
  })
  scheduler = new TaskScheduler(deviceManager.getAndroidAdapter(), {
    onLog: (payload) => win?.webContents.send(IPC_TASK_LOG, payload),
    onState: (payload) => win?.webContents.send(IPC_TASK_STATE, payload),
  })
  registerIpc()
  createWindow()
})
