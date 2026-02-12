import {
  IPC_DEVICE_LIST,
  IPC_DEVICE_REFRESH,
  IPC_START_TASK,
  IPC_STOP_TASK,
  IPC_REPORT_LIST,
  IPC_REPORT_DELETE,
  type DeviceInfo,
  type DeviceListPayload,
  type TaskLogPayload,
  type TaskStatePayload,
  type ReportPayload,
} from '../types/ipc'
import { Device, Task, Report, TaskLog } from '../types'

// Convert DeviceInfo to Device
type DeviceStatus = 'connected' | 'disconnected' | 'busy'
function convertDevice(info: DeviceInfo): Device {
  return {
    id: info.id,
    name: info.name,
    type: info.type,
    status: info.status as DeviceStatus,
    resolution: info.resolution,
    osVersion: info.osVersion,
  }
}

// Convert ReportPayload to Report
function convertReport(payload: ReportPayload): Report {
  return {
    id: payload.id,
    title: payload.title,
    createdAt: payload.createdAt,
    path: payload.path || '',
    summary: payload.html,
  }
}

// Use window.api API if available, otherwise fall back to mock
const api = (window as any).api

export const ipcApi = {
  // Device APIs
  getDevices: async (): Promise<Device[]> => {
    return new Promise((resolve) => {
      // Request device refresh
      api?.ipcRenderer?.send?.(IPC_DEVICE_REFRESH)
      
      // Listen for device list
      const handler = (_event: unknown, payload: DeviceListPayload) => {
        resolve(payload.devices.map(convertDevice))
        api?.ipcRenderer?.off?.(IPC_DEVICE_LIST, handler)
      }
      
      api?.ipcRenderer?.once?.(IPC_DEVICE_LIST, handler)
      
      // Timeout after 5 seconds
      setTimeout(() => {
        resolve([])
      }, 5000)
    })
  },

  selectDevice: async (deviceId: string): Promise<void> => {
    api?.ipcRenderer?.send?.('device:select', deviceId)
  },

  // Task APIs
  startTask: async (prompt: string): Promise<Task> => {
    api?.ipcRenderer?.send?.(IPC_START_TASK, prompt)
    
    return {
      id: `task-${Date.now()}`,
      type: 'automation',
      status: 'running',
      prompt,
      startTime: Date.now(),
      logs: [{
        type: 'info' as const,
        content: 'Task started via IPC',
        timestamp: Date.now()
      }]
    }
  },

  stopTask: async (_taskId: string): Promise<void> => {
    api?.ipcRenderer?.send?.(IPC_STOP_TASK, _taskId)
  },

  // Report APIs
  getReports: async (): Promise<Report[]> => {
    return new Promise((resolve) => {
      const handler = (_event: unknown, payload: { reports: ReportPayload[] }) => {
        resolve(payload.reports.map(convertReport))
        api?.ipcRenderer?.off?.(IPC_REPORT_LIST, handler)
      }
      
      api?.ipcRenderer?.once?.(IPC_REPORT_LIST, handler)
      
      // Request report list
      setTimeout(() => {
        resolve([])
      }, 5000)
    })
  },

  deleteReport: async (reportId: string): Promise<void> => {
    api?.ipcRenderer?.send?.(IPC_REPORT_DELETE, reportId)
  },

  // Listeners
  onDeviceList: (callback: (devices: Device[]) => void) => {
    const handler = (_event: unknown, payload: DeviceListPayload) => {
      callback(payload.devices.map(convertDevice))
    }
    api?.ipcRenderer?.on?.(IPC_DEVICE_LIST, handler)
    return () => api?.ipcRenderer?.off?.(IPC_DEVICE_LIST, handler)
  },

  onTaskLog: (callback: (log: TaskLog) => void) => {
    const handler = (_event: unknown, payload: TaskLogPayload) => {
      callback({
        type: payload.type,
        content: payload.content,
        timestamp: payload.timestamp
      })
    }
    api?.ipcRenderer?.on?.('task:log', handler)
    return () => api?.ipcRenderer?.off?.('task:log', handler)
  },

  onTaskState: (callback: (state: { status: Task['status'] }) => void) => {
    const handler = (_event: unknown, payload: TaskStatePayload) => {
      callback({ status: payload.status as Task['status'] })
    }
    api?.ipcRenderer?.on?.('task:state', handler)
    return () => api?.ipcRenderer?.off?.('task:state', handler)
  },
}

export default ipcApi
