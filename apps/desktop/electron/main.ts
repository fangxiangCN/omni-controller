import { app, BrowserWindow, ipcMain } from 'electron'
import {
  IPC_DEVICE_FRAME,
  IPC_DEVICE_LIST,
  IPC_START_TASK,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
} from '@omni/shared'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
    win?.webContents.send(IPC_DEVICE_LIST, {
      devices: [
        { id: 'device-1', name: 'Android-001', type: 'android' },
        { id: 'device-2', name: 'HarmonyOS-001', type: 'ohos' },
        { id: 'web-1', name: 'Web-Playwright', type: 'web' },
      ],
    })
    // 1x1 jpeg placeholder frame
    const jpegBase64 =
      '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBIQEBAQEA8QDw8PDw8PDw8PDw8PFREWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGy0lICUuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAXAAEBAQEAAAAAAAAAAAAAAAAAAQID/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/8QAFgEBAQEAAAAAAAAAAAAAAAAAAQIE/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIRAxEAPwD7AooA/9k='
    const frame = Buffer.from(jpegBase64, 'base64')
    win?.webContents.send(IPC_DEVICE_FRAME, {
      deviceId: 'device-1',
      format: 'jpeg',
      data: frame,
    })
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  registerIpc()
  createWindow()
})
