import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  IPC_DEVICE_FRAME,
  IPC_DEVICE_LIST,
  IPC_DEVICE_SELECT,
  IPC_START_TASK,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
} from '@omni/shared'
import { AndroidAdapter } from '@omni/drivers-android'
import { createAgentFromEnv } from '@omni/core'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

const android = new AndroidAdapter()
let agent = createAgentFromEnv(android)
let connectedAndroidId = ''

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', async () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
    win?.webContents.send(IPC_DEVICE_LIST, {
      devices: [
        { id: 'android', name: 'Android', type: 'android' },
        { id: 'ohos', name: 'HarmonyOS', type: 'ohos' },
        { id: 'web', name: 'Web-Playwright', type: 'web' },
      ],
    })

    try {
      const ok = await android.connect()
      if (!ok) {
        win?.webContents.send(IPC_TASK_LOG, {
          type: 'info',
          content: 'Android 未检测到设备',
        })
        return
      }
      const info = await android.getDeviceInfo()
      connectedAndroidId = info.id
      win?.webContents.send(IPC_DEVICE_LIST, {
        devices: [
          { id: info.id, name: 'Android', type: 'android' },
          { id: 'ohos', name: 'HarmonyOS', type: 'ohos' },
          { id: 'web', name: 'Web-Playwright', type: 'web' },
        ],
      })
      android.startStream((frame) => {
        win?.webContents.send(IPC_DEVICE_FRAME, {
          deviceId: info.id,
          format: frame.format,
          data: frame.data,
        })
      })
      agent = createAgentFromEnv(android)
    } catch {
      // ignore
    }
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
    if (!deviceId || deviceId === connectedAndroidId) return
    const result = await android.connectWithResult?.(deviceId)
    if (!result?.ok) {
      win?.webContents.send(IPC_TASK_LOG, {
        type: 'error',
        content: `Android 连接失败: ${deviceId} (${result?.error || 'unknown'})`,
      })
      return
    }
    connectedAndroidId = deviceId
    agent = createAgentFromEnv(android)
    win?.webContents.send(IPC_DEVICE_LIST, {
      devices: [
        { id: connectedAndroidId, name: 'Android', type: 'android' },
        { id: 'ohos', name: 'HarmonyOS', type: 'ohos' },
        { id: 'web', name: 'Web-Playwright', type: 'web' },
      ],
    })
  })
  ipcMain.on(IPC_START_TASK, async (_event, payload) => {
    const instruction = payload?.instruction || ''
    const deviceId = payload?.deviceId || ''
    const startedAt = Date.now()
    if (!process.env.MIDSCENE_MODEL_NAME || !process.env.MIDSCENE_OPENAI_API_KEY) {
      win?.webContents.send(IPC_TASK_LOG, {
        type: 'error',
        content: '模型配置缺失: 请检查 .env 中 MIDSCENE_MODEL_NAME / MIDSCENE_OPENAI_API_KEY',
      })
      return
    }
    if (deviceId && deviceId !== connectedAndroidId) {
      try {
        const result = await android.connectWithResult?.(deviceId)
        if (!result?.ok) {
          win?.webContents.send(IPC_TASK_LOG, {
            type: 'error',
            content: `Android 连接失败: ${deviceId} (${result?.error || 'unknown'})`,
          })
          return
        }
        connectedAndroidId = deviceId
        agent = createAgentFromEnv(android)
      } catch {
        win?.webContents.send(IPC_TASK_LOG, {
          type: 'error',
          content: `Android 连接失败: ${deviceId}`,
        })
        return
      }
    }
    win?.webContents.send(IPC_TASK_STATE, {
      status: 'running',
      startedAt,
    })
    win?.webContents.send(IPC_TASK_LOG, {
      type: 'thought',
      content: `收到任务: ${instruction} (device=${deviceId})`,
    })

    try {
      await agent.aiAct(instruction)
      win?.webContents.send(IPC_TASK_LOG, {
        type: 'info',
        content: '任务完成 (Midscene)',
      })
      win?.webContents.send(IPC_TASK_STATE, {
        status: 'success',
        startedAt,
        finishedAt: Date.now(),
      })
    } catch (e: any) {
      win?.webContents.send(IPC_TASK_LOG, {
        type: 'error',
        content: `任务失败: ${e?.message || e}`,
      })
      win?.webContents.send(IPC_TASK_STATE, {
        status: 'error',
        startedAt,
        finishedAt: Date.now(),
      })
    }
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
  registerIpc()
  createWindow()
})
