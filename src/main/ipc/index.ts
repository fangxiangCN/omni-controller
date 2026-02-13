import { ipcMain, BrowserWindow, app } from 'electron'
import path from 'node:path'
import deviceManager from '../core/device/manager'
import { findAdbPath } from '../utils/adb-resolver'
import taskScheduler from '../core/task/scheduler'
import playgroundServer from '../playground/server'
import { getAgentManager } from '../agent/manager'
import type { AIModelConfig } from '../ai/service'
import type { ModelConfig } from '../agent/strategies'
import {
  IPC_DEVICE_LIST,
  IPC_DEVICE_SELECT,
  IPC_DEVICE_REFRESH,
  IPC_DEVICE_DISCONNECT,
  IPC_DEVICE_FRAME,
  IPC_DEVICE_SET_ADB_PATH,
  IPC_DEVICE_GET_ADB_PATH,
  IPC_START_TASK,
  IPC_STOP_TASK,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
  IPC_REPORT_LIST,
  IPC_REPORT_DELETE,
  IPC_AGENT_INITIALIZE,
  IPC_AGENT_START_TASK,
  IPC_AGENT_STOP_TASK,
  IPC_AGENT_LOG,
  IPC_AGENT_PLANNING,
  IPC_AGENT_ACTION_START,
  IPC_AGENT_TASK_COMPLETE,
  IPC_AGENT_GET_MODELS,
  IPC_AGENT_SET_MODEL,
  IPC_AGENT_GET_CURRENT_MODEL,
  type DeviceListPayload,
  type TaskLogPayload,
  type TaskStatePayload,
  type ReportListPayload,
  type ReportPayload,
  type AgentLogPayload,
  type AgentPlanningPayload,
  type AgentActionPayload,
  type AgentTaskCompletePayload,
  type ModelConfigPayload,
} from './contract'

let mainWindow: BrowserWindow | null = null
let isIpcInitialized = false

function sendToRenderer(channel: string, payload: unknown) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload)
  }
}

export function initializeIpc(window: BrowserWindow) {
  // Prevent duplicate initialization
  if (isIpcInitialized) {
    console.log('[IPC] Already initialized, skipping...')
    return
  }
  
  mainWindow = window
  isIpcInitialized = true
  console.log('[IPC] Initializing IPC handlers...')
  
  // Setup managers
  deviceManager.setMainWindow(window)
  taskScheduler.setDeviceManager(deviceManager)
  playgroundServer.setDeviceManager(deviceManager)
  playgroundServer.setMainWindow(window)
  
  // Find and set ADB path (platform-specific)
  const adbPath = findAdbPath()
  if (adbPath) {
    deviceManager.setAdbPath(adbPath)
    console.log('[ADB] Using adb:', adbPath)
  } else {
    console.warn('[ADB] No adb found. Please install Android SDK Platform Tools.')
    console.warn('[ADB] macOS: brew install android-platform-tools')
    console.warn('[ADB] Or download from: https://developer.android.com/studio/releases/platform-tools')
  }
  
  // Setup event forwarding
  setupDeviceManagerEvents()
  setupTaskSchedulerEvents()
  
  // Setup IPC handlers
  setupDeviceIpc()
  setupTaskIpc()
  setupReportIpc()
  setupAgentIpc() // Ensure agent IPC is set up
  
  // Initialize playground
  playgroundServer.initialize()
  
  // Start device polling
  deviceManager.startPolling(3000)
}

function setupDeviceManagerEvents() {
  // Forward device list to renderer
  deviceManager.on('deviceList', (devices) => {
    const payload: DeviceListPayload = {
      devices: devices.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        status: d.status,
        resolution: d.resolution,
        osVersion: d.osVersion,
      })),
    }
    sendToRenderer(IPC_DEVICE_LIST, payload)
  })
  
  // Forward device frames to renderer
  deviceManager.on('frame', ({ deviceId, frame }) => {
    sendToRenderer(IPC_DEVICE_FRAME, {
      deviceId,
      format: frame.format,
      data: frame.data,
    })
  })
  
  // Forward logs
  deviceManager.on('log', (log) => {
    sendToRenderer(IPC_TASK_LOG, {
      type: log.type,
      content: log.content,
      timestamp: Date.now(),
    } as TaskLogPayload)
  })
}

function setupTaskSchedulerEvents() {
  // Forward task logs
  taskScheduler.on('log', (log) => {
    sendToRenderer(IPC_TASK_LOG, {
      type: log.type,
      content: log.content,
      timestamp: Date.now(),
    } as TaskLogPayload)
  })
  
  // Forward task state
  taskScheduler.on('taskStarted', (task) => {
    sendToRenderer(IPC_TASK_STATE, {
      status: 'running',
      taskId: task.id,
    } as TaskStatePayload)
  })
  
  taskScheduler.on('taskCompleted', (task) => {
    sendToRenderer(IPC_TASK_STATE, {
      status: task.status,
      taskId: task.id,
    } as TaskStatePayload)
  })
  
  taskScheduler.on('taskFailed', (task) => {
    sendToRenderer(IPC_TASK_STATE, {
      status: 'failed',
      taskId: task.id,
    } as TaskStatePayload)
  })
}

function setupDeviceIpc() {
  // Select device
  ipcMain.on(IPC_DEVICE_SELECT, async (_event, deviceId: string) => {
    await deviceManager.selectDevice(deviceId)
  })
  
  // Refresh devices
  ipcMain.on(IPC_DEVICE_REFRESH, async () => {
    await deviceManager.refreshDevices()
  })
  
  // Disconnect device
  ipcMain.on(IPC_DEVICE_DISCONNECT, async (_event, deviceId: string) => {
    await deviceManager.disconnect(deviceId)
  })

  // Set ADB path
  ipcMain.handle(IPC_DEVICE_SET_ADB_PATH, async (_event, path: string) => {
    try {
      deviceManager.setAdbPath(path)
      // Refresh devices after setting new ADB path
      await deviceManager.refreshDevices()
      return { success: true }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      return { success: false, error: errorMsg }
    }
  })

  // Get ADB path
  ipcMain.handle(IPC_DEVICE_GET_ADB_PATH, async () => {
    return deviceManager.getAdbPath()
  })
}

function setupTaskIpc() {
  // Start task
  ipcMain.on(IPC_START_TASK, async (_event, prompt: string) => {
    try {
      await taskScheduler.startTask(prompt)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      sendToRenderer(IPC_TASK_LOG, {
        type: 'error',
        content: `Failed to start task: ${errorMsg}`,
        timestamp: Date.now(),
      } as TaskLogPayload)
    }
  })
  
  // Stop task
  ipcMain.on(IPC_STOP_TASK, async (_event, taskId: string) => {
    taskScheduler.stopTask(taskId)
  })
}

function setupReportIpc() {
  // Initial report list
  const reports: ReportPayload[] = [
    {
      id: 'report-001',
      title: 'App Navigation Test',
      createdAt: Date.now() - 86400000,
      path: '/reports/report-001.html',
    },
    {
      id: 'report-002',
      title: 'Login Flow Verification',
      createdAt: Date.now() - 172800000,
      path: '/reports/report-002.html',
    },
  ]
  
  // Send initial list
  setTimeout(() => {
    sendToRenderer(IPC_REPORT_LIST, { reports } as ReportListPayload)
  }, 1000)
  
  // Delete report
  ipcMain.on(IPC_REPORT_DELETE, async (_event, reportId: string) => {
    console.log('Deleting report:', reportId)
    // TODO: implement actual deletion
  })
}

function setupAgentIpc() {
  console.log('[IPC] Setting up Agent IPC handlers...')
  
  const agentManager = getAgentManager()
  
  // Get available models
  ipcMain.handle(IPC_AGENT_GET_MODELS, async () => {
    console.log('[IPC] Getting available models...')
    try {
      const models = agentManager.getAvailableModels()
      console.log(`[IPC] Found ${models.length} models`)
      return models.map(m => ({
        type: m.type,
        name: m.name,
        provider: m.provider,
        baseUrl: m.baseUrl,
        apiKey: m.apiKey,
        model: m.model,
        description: m.description,
        capabilities: m.capabilities,
      } as ModelConfigPayload))
    } catch (error) {
      console.error('[IPC] Error getting models:', error)
      return []
    }
  })

  // Initialize agent
  ipcMain.handle(IPC_AGENT_INITIALIZE, async (_event, config?: AIModelConfig) => {
    try {
      if (config) {
        taskScheduler.setAIConfig(config)
      }
      await taskScheduler.initializeAgent()
      return { success: true }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      return { success: false, error: errorMsg }
    }
  })

  // Get available models
  ipcMain.handle(IPC_AGENT_GET_MODELS, async () => {
    const models = agentManager.getAvailableModels()
    return models.map(m => ({
      type: m.type,
      name: m.name,
      provider: m.provider,
      baseUrl: m.baseUrl,
      apiKey: m.apiKey,
      model: m.model,
      description: m.description,
      capabilities: m.capabilities,
    } as ModelConfigPayload))
  })

  // Set model
  ipcMain.handle(IPC_AGENT_SET_MODEL, async (_event, config: ModelConfigPayload) => {
    try {
      const modelConfig: ModelConfig = {
        type: config.type,
        name: config.name,
        provider: config.provider,
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model,
        description: config.description,
        capabilities: config.capabilities,
      }
      agentManager.setModelConfig(modelConfig)
      return { success: true }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      return { success: false, error: errorMsg }
    }
  })

  // Get current model
  ipcMain.handle(IPC_AGENT_GET_CURRENT_MODEL, async () => {
    const config = agentManager.getModelConfig()
    if (!config) return null
    return {
      type: config.type,
      name: config.name,
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      description: config.description,
      capabilities: config.capabilities,
    } as ModelConfigPayload
  })

  // Start task with agent
  ipcMain.on(IPC_AGENT_START_TASK, async (_event, prompt: string) => {
    try {
      await taskScheduler.startTask(prompt)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      sendToRenderer(IPC_AGENT_LOG, {
        type: 'error',
        content: `Failed to start task: ${errorMsg}`,
        timestamp: Date.now(),
      } as AgentLogPayload)
    }
  })

  // Stop task
  ipcMain.on(IPC_AGENT_STOP_TASK, async (_event, taskId: string) => {
    taskScheduler.stopTask(taskId)
  })

  // Forward agent events
  taskScheduler.on('log', (log) => {
    sendToRenderer(IPC_AGENT_LOG, {
      type: log.type,
      content: log.content,
      timestamp: Date.now(),
    } as AgentLogPayload)
  })

  taskScheduler.on('planning', (data) => {
    sendToRenderer(IPC_AGENT_PLANNING, {
      thought: data.thought,
      actions: data.actions,
    } as AgentPlanningPayload)
  })

  taskScheduler.on('action:start', (data) => {
    sendToRenderer(IPC_AGENT_ACTION_START, {
      action: data.action,
    } as AgentActionPayload)
  })

  taskScheduler.on('taskCompleted', (task) => {
    sendToRenderer(IPC_AGENT_TASK_COMPLETE, {
      success: task.status === 'completed',
      message: task.result?.message,
    } as AgentTaskCompletePayload)
  })
}
