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

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

function registerIpc() {
  ipcMain.on(IPC_DEVICE_SELECT, () => {})
  ipcMain.on(IPC_START_TASK, () => {})
  ipcMain.on(IPC_STOP_TASK, () => {})
  ipcMain.on(IPC_DEVICE_FRAME, () => {})
  ipcMain.on(IPC_DEVICE_LIST, () => {})
  ipcMain.on(IPC_TASK_LOG, () => {})
  ipcMain.on(IPC_TASK_STATE, () => {})
}

app.whenReady().then(() => {
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
