import { defineStore } from 'pinia'
import {
  IPC_DEVICE_LIST,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
  IPC_DEVICE_SELECT,
  IPC_DEVICE_FRAME,
  IPC_START_TASK,
  IPC_STOP_TASK,
} from '@omni/shared'
import type { DeviceInfo, TaskLog, TaskState, DeviceFramePayload } from '@omni/shared'
import { ipcOn, ipcSend } from '../ipc'

export const useAppStore = defineStore('app', {
  state: () => ({
    devices: [] as DeviceInfo[],
    activeDeviceId: '' as string,
    logs: [] as TaskLog[],
    taskState: { status: 'idle' } as TaskState,
    lastInstruction: '' as string,
    lastError: '' as string,
    lastFrameAtByDevice: {} as Record<string, number>,
  }),
  getters: {
    getDeviceStatus: (state) => (deviceId: string) => {
      if (!deviceId) return 'none'
      const lastFrameAt = state.lastFrameAtByDevice[deviceId]
      if (!lastFrameAt) return 'idle'
      return Date.now() - lastFrameAt < 3000 ? 'streaming' : 'idle'
    },
  },
  actions: {
    initIpc() {
      ipcOn(IPC_DEVICE_LIST, (payload: { devices: DeviceInfo[] }) => {
        if (payload?.devices) this.setDevices(payload.devices)
      })
      ipcOn(IPC_TASK_LOG, (payload: TaskLog) => {
        if (payload?.content) {
          this.pushLog(payload)
          if (payload.type === 'error') this.lastError = payload.content
        }
      })
      ipcOn(IPC_TASK_STATE, (payload: TaskState) => {
        if (payload?.status) this.taskState = payload
      })
      ipcOn(IPC_DEVICE_FRAME, (payload: DeviceFramePayload) => {
        if (!payload?.deviceId) return
        this.lastFrameAtByDevice[payload.deviceId] = Date.now()
      })
    },
    setDevices(list: DeviceInfo[]) {
      this.devices = list
      if (!list.length) return
      const exists = list.some((d) => d.id === this.activeDeviceId)
      if (!this.activeDeviceId || !exists) {
        this.setActiveDevice(list[0].id)
      }
    },
    setActiveDevice(id: string) {
      this.activeDeviceId = id
      ipcSend(IPC_DEVICE_SELECT, { deviceId: id })
    },
    startTask(instruction: string) {
      this.lastInstruction = instruction
      ipcSend(IPC_START_TASK, {
        instruction,
        deviceId: this.activeDeviceId,
      })
    },
    stopTask() {
      ipcSend(IPC_STOP_TASK, {})
    },
    pushLog(log: TaskLog) {
      this.logs.push(log)
      if (this.logs.length > 200) {
        this.logs.splice(0, this.logs.length - 200)
      }
    },
    clearLogs() {
      this.logs = []
      this.lastError = ''
    },
  },
})
