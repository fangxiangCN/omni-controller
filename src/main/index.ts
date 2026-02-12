import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { electronApp as toolkitElectronApp, optimizer, is } from '@electron-toolkit/utils'
import { initializeIpc } from './ipc'
import { execSync } from 'child_process'
import { findAdbPath } from './utils/adb-resolver'

// Fix GPU cache and permission issues
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')
app.commandLine.appendSwitch('disable-gpu-sandbox')

// Set cache directory to a writable location
const cachePath = join(app.getPath('userData'), 'Cache')
if (!existsSync(cachePath)) {
  mkdirSync(cachePath, { recursive: true })
}
app.setPath('cache', cachePath)

// Test ADB before starting
function testAdb(adbPath: string | null): boolean {
  if (!adbPath) {
    console.error('[ADB Test] ADB path not provided')
    return false
  }
  try {
    console.log('[ADB Test] Testing ADB at:', adbPath)
    const result = execSync(`"${adbPath}" version`, { encoding: 'utf8', timeout: 5000 })
    console.log('[ADB Test] ADB version:', result.trim())
    return true
  } catch (error) {
    console.error('[ADB Test] ADB test failed:', error)
    return false
  }
}

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  console.log('[Window] Creating window...')
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: false,
      nodeIntegration: true
    }
  })
  
  console.log('[Window] Window created, ID:', mainWindow?.id)

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // Open DevTools in development
    if (is.dev) {
      mainWindow?.webContents.openDevTools()
    }
  })

  // Handle window state changes
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:state-change', { maximized: true })
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:state-change', { maximized: false })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    console.log('[Window] Window closed')
    mainWindow = null
  })

  // Handle renderer process crashes
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('[Window] Renderer process gone:', details)
  })
  
  mainWindow.webContents.on('crashed', () => {
    console.error('[Window] Renderer crashed!')
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  console.log('[Window] Loading renderer, dev mode:', is.dev, 'URL:', rendererUrl)
  
  if (is.dev && rendererUrl) {
    mainWindow.loadURL(rendererUrl).catch(err => {
      console.error('[Window] Failed to load URL:', err)
    })
  } else {
    const htmlPath = join(__dirname, '../renderer/index.html')
    console.log('[Window] Loading file:', htmlPath)
    mainWindow.loadFile(htmlPath).catch(err => {
      console.error('[Window] Failed to load file:', err)
    })
  }

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    console.error('[Window] Failed to load:', errorCode, errorDescription)
  })

  // Initialize IPC handlers after window is loaded
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Window] Renderer loaded successfully')
    initializeIpc(mainWindow!)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
console.log('[App] Waiting for app to be ready...')

app.whenReady().then(() => {
  console.log('[App] App is ready!')
  
  // Test ADB before starting
  console.log('[App] Testing ADB...')
  const adbPath = findAdbPath()
  const adbWorking = testAdb(adbPath)
  console.log('[App] ADB working:', adbWorking)
  if (!adbWorking) {
    console.warn('[App] ADB not available. Device control features may not work.')
  }
  
  // Set app user model id for windows
  toolkitElectronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Window control IPC handlers
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window:toggle-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow?.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('window:close', () => {
    mainWindow?.close()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
