import { create } from 'zustand'
import {
  IPC_DEVICE_LIST,
  IPC_DEVICE_SELECT,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
  type DeviceInfo,
  type DeviceListPayload,
  type TaskLogPayload,
  type TaskStatePayload,
} from '@omni/shared'
import { ipcOn, ipcSend } from '../ipc'

type AppState = {
  devices: DeviceInfo[]
  activeDeviceId: string
  logs: TaskLogPayload[]
  taskState: TaskStatePayload
  initIpc: () => void
  setDevices: (devices: DeviceInfo[]) => void
  setActiveDevice: (deviceId: string) => void
  pushLog: (log: TaskLogPayload) => void
  setTaskState: (state: TaskStatePayload) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  devices: [],
  activeDeviceId: '',
  logs: [],
  taskState: { status: 'idle' },
  initIpc: () => {
    ipcOn<DeviceListPayload>(IPC_DEVICE_LIST, (payload) => {
      if (!payload?.devices) return
      get().setDevices(payload.devices)
    })
    ipcOn<TaskLogPayload>(IPC_TASK_LOG, (payload) => {
      if (!payload?.content) return
      get().pushLog(payload)
    })
    ipcOn<TaskStatePayload>(IPC_TASK_STATE, (payload) => {
      if (!payload?.status) return
      get().setTaskState(payload)
    })
  },
  setDevices: (devices) => {
    set((state) => ({
      devices,
      activeDeviceId: state.activeDeviceId || devices[0]?.id || '',
    }))
  },
  setActiveDevice: (deviceId) => {
    set({ activeDeviceId: deviceId })
    ipcSend(IPC_DEVICE_SELECT, { deviceId })
  },
  pushLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setTaskState: (taskState) => set({ taskState }),
}))
