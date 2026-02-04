import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  IPC_DEVICE_FRAME,
  IPC_DEVICE_LIST,
  IPC_START_TASK,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
} from '@omni/shared'
import { AndroidAdapter } from '@omni/drivers-android'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

const android = new AndroidAdapter()

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
        { id: 'device-1', name: 'Android-001', type: 'android' },
        { id: 'device-2', name: 'HarmonyOS-001', type: 'ohos' },
        { id: 'web-1', name: 'Web-Playwright', type: 'web' },
      ],
    })

    // auto-connect android (no-op if no device)
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
      android.startStream((frame) => {
        win?.webContents.send(IPC_DEVICE_FRAME, {
          deviceId: info.id,
          format: frame.format,
          data: frame.data,
        })
      })
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
  ipcMain.on(IPC_START_TASK, (_event, payload) => {
    const instruction = payload?.instruction || ''
    const deviceId = payload?.deviceId || ''
    const startedAt = Date.now()
    win?.webContents.send(IPC_TASK_STATE, {
      status: 'running',
      startedAt,
    })
    win?.webContents.send(IPC_TASK_LOG, {
      type: 'thought',
      content: `收到任务: ${instruction} (device=${deviceId})`,
    })
    setTimeout(() => {
      win?.webContents.send(IPC_TASK_LOG, {
        type: 'plan',
        content: '解析任务并规划步骤',
      })
    }, 400)
    setTimeout(() => {
      win?.webContents.send(IPC_TASK_LOG, {
        type: 'action',
        content: '模拟执行: Tap(x,y)',
      })
    }, 800)
    setTimeout(() => {
      win?.webContents.send(IPC_TASK_LOG, {
        type: 'info',
        content: '任务完成 (模拟)',
      })
      win?.webContents.send(IPC_TASK_STATE, {
        status: 'success',
        startedAt,
        finishedAt: Date.now(),
      })
    }, 1200)
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
