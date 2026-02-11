import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { mkdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { PlaygroundServer, PlaygroundSDK } from '../src/main/playground'
import { createAgentFromEnv, Agent } from '../src/main/core'
import type { AbstractInterface } from '../src/main/core/device'
import type { AgentWithDumpListener } from './task-scheduler'

import {
  IPC_DEVICE_FRAME,
  IPC_DEVICE_LIST,
  IPC_DEVICE_SELECT,
  IPC_START_TASK,
  IPC_STOP_TASK,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
  IPC_REPORT_UPDATE,
  IPC_REPORT_LIST,
  IPC_REPORT_SELECT,
  IPC_REPORT_DELETE,
  IPC_DEVICE_REFRESH,
  IPC_DEVICE_DISCONNECT,
  IPC_WINDOW_MINIMIZE,
  IPC_WINDOW_TOGGLE_MAXIMIZE,
  IPC_WINDOW_CLOSE,
  IPC_WINDOW_STATE,
  type DeviceFramePayload,
  type DeviceListPayload,
  type TaskLogPayload,
  type TaskStatePayload,
  type ReportPayload,
  type ReportListPayload,
} from '../src/main/ipc-contract'
import { PLAYGROUND_SERVER_PORT } from '../src/types/constants'
import {
  registerDeviceTaskIpc,
  registerPlaygroundIpc,
  registerReportIpc,
  registerWindowIpc,
} from '../src/main/ipc'
import { DeviceManager } from './device-manager'
import { TaskScheduler } from './task-scheduler'

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
let taskScheduler: TaskScheduler | null = null
const reportDir = path.join(process.env.APP_ROOT || process.cwd(), 'reports')
const reportIndexFile = path.join(reportDir, 'index.json')
const reportIndex: Array<{
  id: string
  title: string
  path: string
  createdAt: number
}> = []

function loadReportIndex() {
  try {
    if (!existsSync(reportIndexFile)) return
    const content = readFileSync(reportIndexFile, 'utf-8')
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      reportIndex.splice(0, reportIndex.length, ...parsed)
    }
  } catch {
    // ignore invalid index
  }
}

function saveReportIndex() {
  try {
    if (!existsSync(reportDir)) mkdirSync(reportDir, { recursive: true })
    writeFileSync(reportIndexFile, JSON.stringify(reportIndex, null, 2), 'utf-8')
  } catch {
    // ignore write failures
  }
}

function sendToRenderer(channel: string, ...args: unknown[]) {
  if (!win) return
  win.webContents.send(channel, ...args)
}

function createWindow() {
  const isMac = process.platform === 'darwin'
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
    frame: false,
    titleBarStyle: isMac ? 'hiddenInset' : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // 打开开发者工具以便调试
  win.webContents.openDevTools()

  win.webContents.on('did-finish-load', () => {
    const payload: ReportListPayload = { reports: reportIndex }
    sendToRenderer(IPC_REPORT_LIST, payload)
    sendToRenderer(IPC_WINDOW_STATE, { maximized: win?.isMaximized() || false })
  })

  win.on('maximize', () => sendToRenderer(IPC_WINDOW_STATE, { maximized: true }))
  win.on('unmaximize', () => sendToRenderer(IPC_WINDOW_STATE, { maximized: false }))
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

function registerTaskScheduler() {
  taskScheduler = new TaskScheduler(async () => {
    if (!deviceManager) {
      throw new Error('Device manager not initialized')
    }
    if (!deviceManager.getActiveDeviceId()) {
      await deviceManager.refreshDevices()
    }
    if (!deviceManager.getActiveDeviceId()) {
      throw new Error('No active device available')
    }
    return createAgentFromEnv(deviceManager.getAdapter()) as unknown as AgentWithDumpListener
  })

  taskScheduler.on('log', (payload) => {
    sendToRenderer(IPC_TASK_LOG, payload)
  })
  taskScheduler.on('state', (payload) => {
    sendToRenderer(IPC_TASK_STATE, payload)
  })
  taskScheduler.on('report', (payload) => {
    if (payload.html) {
      if (!existsSync(reportDir)) mkdirSync(reportDir, { recursive: true })
      const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
      const filePath = path.join(reportDir, `report-${id}.html`)
      writeFileSync(filePath, payload.html, 'utf-8')
      reportIndex.unshift({
        id,
        title: payload.title || 'Untitled',
        path: filePath,
        createdAt: Date.now(),
      })
      saveReportIndex()
      const listPayload: ReportListPayload = { reports: reportIndex }
      sendToRenderer(IPC_REPORT_LIST, listPayload)
      const reportPayload: ReportPayload = {
        html: payload.html,
        id,
        title: payload.title,
        path: filePath,
      }
      sendToRenderer(IPC_REPORT_UPDATE, reportPayload)
    }
  })
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
    return createAgentFromEnv(deviceManager.getAdapter()) as unknown as Agent<AbstractInterface>
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

// PlaygroundSDK 实例（用于 IPC 转发）
let playgroundSDK: PlaygroundSDK | null = null

function initPlaygroundSDK() {
  if (playgroundSDK) return
  playgroundSDK = new PlaygroundSDK({
    type: 'remote-execution',
    serverUrl: `http://localhost:${PLAYGROUND_SERVER_PORT}`,
  })
}

function registerIpc() {
  if (!deviceManager || !taskScheduler) return

  registerPlaygroundIpc({
    ipcMain,
    getSdk: () => {
      initPlaygroundSDK()
      return playgroundSDK!
    },
    sendToRenderer,
  })

  registerDeviceTaskIpc({
    ipcMain,
    deviceManager,
    taskScheduler,
  })

  registerReportIpc({
    ipcMain,
    readReport: (id: string) => {
      const target = reportIndex.find((item) => item.id === id)
      if (!target) return null
      const html = readFileSync(target.path, 'utf-8')
      return {
        html,
        id: target.id,
        title: target.title,
        path: target.path,
      } satisfies ReportPayload
    },
    deleteReport: (id: string) => {
      const targetIndex = reportIndex.findIndex((item) => item.id === id)
      if (targetIndex < 0) return null
      const target = reportIndex[targetIndex]
      try {
        if (existsSync(target.path)) unlinkSync(target.path)
      } catch {
        // ignore delete errors
      }
      reportIndex.splice(targetIndex, 1)
      saveReportIndex()
      return { reports: reportIndex } satisfies ReportListPayload
    },
    sendToRenderer: (channel, payload) => sendToRenderer(channel, payload),
  })

  registerWindowIpc({
    ipcMain,
    window: {
      minimize: () => win?.minimize(),
      toggleMaximize: () => {
        if (!win) return
        if (win.isMaximized()) win.unmaximize()
        else win.maximize()
      },
      close: () => win?.close(),
      isMaximized: () => win?.isMaximized() || false,
    },
  })
}

app.whenReady().then(async () => {
  loadReportIndex()
  registerDeviceManager()
  registerTaskScheduler()
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
