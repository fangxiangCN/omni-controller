import {
  IPC_DEVICE_LIST,
  IPC_DEVICE_FRAME,
  IPC_DEVICE_SELECT,
  IPC_DEVICE_REFRESH,
  IPC_DEVICE_DISCONNECT,
  IPC_DEVICE_STATUS,
  IPC_DEVICE_SET_ADB_PATH,
  IPC_DEVICE_GET_ADB_PATH,
  IPC_START_TASK,
  IPC_STOP_TASK,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
  IPC_TASK_PROGRESS,
  IPC_REPORT_UPDATE,
  IPC_REPORT_LIST,
  IPC_REPORT_SELECT,
  IPC_REPORT_DELETE,
  IPC_PLAYGROUND_EXECUTE,
  IPC_PLAYGROUND_GET_ACTIONS,
  IPC_PLAYGROUND_GET_SCREENSHOT,
  IPC_PLAYGROUND_GET_STATUS,
  IPC_PLAYGROUND_CANCEL,
  IPC_PLAYGROUND_DUMP_UPDATE,
  IPC_PLAYGROUND_PROGRESS,
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
  type DeviceFramePayload,
  type TaskLogPayload,
  type TaskStatePayload,
  type TaskProgressPayload,
  type ReportListPayload,
  type ReportPayload,
  type PlaygroundAction,
  type PlaygroundDumpPayload,
  type AIModelConfig,
  type AgentLogPayload,
  type AgentPlanningPayload,
  type AgentActionPayload,
  type AgentTaskCompletePayload,
} from '../types/ipc'

// Get ipcRenderer from window.api (exposed by preload script)
const getIpcRenderer = () => {
  const api = (window as any).api
  if (!api?.ipcRenderer) {
    console.warn('[IPC] api.ipcRenderer not available')
    return null
  }
  return api.ipcRenderer
}

// Device IPC
export const deviceIpc = {
  select: (deviceId: string) => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_DEVICE_SELECT, deviceId)
  },
  refresh: () => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_DEVICE_REFRESH)
  },
  disconnect: (deviceId: string) => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_DEVICE_DISCONNECT, deviceId)
  },
  
  setAdbPath: (path: string) => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_DEVICE_SET_ADB_PATH, path) as Promise<{ success: boolean; error?: string }>
  },
  
  getAdbPath: () => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_DEVICE_GET_ADB_PATH) as Promise<string | undefined>
  },
  
  onDeviceList: (callback: (payload: DeviceListPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: DeviceListPayload) => callback(payload)
    return ipc.on(IPC_DEVICE_LIST, handler)
  },
  
  onDeviceFrame: (callback: (payload: DeviceFramePayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: DeviceFramePayload) => callback(payload)
    return ipc.on(IPC_DEVICE_FRAME, handler)
  },

  onDeviceStatus: (callback: (payload: { deviceId: string; status: string }) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: { deviceId: string; status: string }) => callback(payload)
    return ipc.on(IPC_DEVICE_STATUS, handler)
  },
}

// Task IPC
export const taskIpc = {
  start: (prompt: string) => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_START_TASK, prompt)
  },
  stop: (taskId: string) => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_STOP_TASK, taskId)
  },
  
  onTaskLog: (callback: (payload: TaskLogPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: TaskLogPayload) => callback(payload)
    return ipc.on(IPC_TASK_LOG, handler)
  },
  
  onTaskState: (callback: (payload: TaskStatePayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: TaskStatePayload) => callback(payload)
    return ipc.on(IPC_TASK_STATE, handler)
  },
  
  onTaskProgress: (callback: (payload: TaskProgressPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: TaskProgressPayload) => callback(payload)
    return ipc.on(IPC_TASK_PROGRESS, handler)
  },
}

// Report IPC
export const reportIpc = {
  select: (reportId: string) => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_REPORT_SELECT, reportId)
  },
  delete: (reportId: string) => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_REPORT_DELETE, reportId)
  },
  
  onReportList: (callback: (payload: ReportListPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: ReportListPayload) => callback(payload)
    return ipc.on(IPC_REPORT_LIST, handler)
  },
  
  onReportUpdate: (callback: (payload: ReportPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: ReportPayload) => callback(payload)
    return ipc.on(IPC_REPORT_UPDATE, handler)
  },
}

// Playground IPC
export const playgroundIpc = {
  execute: (action: PlaygroundAction) => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_PLAYGROUND_EXECUTE, action)
  },
  
  getActions: () => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_PLAYGROUND_GET_ACTIONS)
  },
  
  getScreenshot: () => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_PLAYGROUND_GET_SCREENSHOT)
  },
  
  getStatus: () => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_PLAYGROUND_GET_STATUS)
  },
  
  cancel: () => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_PLAYGROUND_CANCEL)
  },
  
  onDumpUpdate: (callback: (payload: PlaygroundDumpPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: PlaygroundDumpPayload) => callback(payload)
    return ipc.on(IPC_PLAYGROUND_DUMP_UPDATE, handler)
  },

  onProgress: (callback: (tip: string) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, tip: string) => callback(tip)
    return ipc.on(IPC_PLAYGROUND_PROGRESS, handler)
  },
}

// Agent IPC
export const agentIpc = {
  initialize: (config?: AIModelConfig) => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_AGENT_INITIALIZE, config)
  },
  
  startTask: (prompt: string) => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_AGENT_START_TASK, prompt)
  },
  
  stopTask: (taskId: string) => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_AGENT_STOP_TASK, taskId)
  },
  
  onLog: (callback: (payload: AgentLogPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: AgentLogPayload) => callback(payload)
    return ipc.on(IPC_AGENT_LOG, handler)
  },

  onPlanning: (callback: (payload: AgentPlanningPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: AgentPlanningPayload) => callback(payload)
    return ipc.on(IPC_AGENT_PLANNING, handler)
  },

  onActionStart: (callback: (payload: AgentActionPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: AgentActionPayload) => callback(payload)
    return ipc.on(IPC_AGENT_ACTION_START, handler)
  },

  onTaskComplete: (callback: (payload: AgentTaskCompletePayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: AgentTaskCompletePayload) => callback(payload)
    return ipc.on(IPC_AGENT_TASK_COMPLETE, handler)
  },

  getModels: () => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_AGENT_GET_MODELS)
  },

  setModel: (config: any) => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_AGENT_SET_MODEL, config)
  },

  getCurrentModel: () => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_AGENT_GET_CURRENT_MODEL)
  },
}

// Export all IPC APIs
export const ipcClient = {
  device: deviceIpc,
  task: taskIpc,
  report: reportIpc,
  playground: playgroundIpc,
  agent: agentIpc,
}

export default ipcClient
