import { defineStore } from 'pinia'
import { IPC_DEVICE_LIST, IPC_TASK_LOG, IPC_TASK_STATE, IPC_DEVICE_SELECT } from '@omni/shared'
import type { DeviceInfo, TaskLog, TaskState } from '@omni/shared'
import { ipcOn, ipcSend } from '../ipc'

export const useAppStore = defineStore('app', {
  state: () => ({
    devices: [] as DeviceInfo[],
    activeDeviceId: '' as string,
    logs: [] as TaskLog[],
    taskState: { status: 'idle' } as TaskState,
  }),
  actions: {
    initIpc() {
      ipcOn(IPC_DEVICE_LIST, (payload: { devices: DeviceInfo[] }) => {
        if (payload?.devices) this.setDevices(payload.devices)
      })
      ipcOn(IPC_TASK_LOG, (payload: TaskLog) => {
        if (payload?.content) this.pushLog(payload)
      })
      ipcOn(IPC_TASK_STATE, (payload: TaskState) => {
        if (payload?.status) this.taskState = payload
      })
    },
    setDevices(list: DeviceInfo[]) {
      this.devices = list
      if (!this.activeDeviceId && list.length > 0) {
        this.activeDeviceId = list[0].id
      }
    },
    setActiveDevice(id: string) {
      this.activeDeviceId = id
      ipcSend(IPC_DEVICE_SELECT, { deviceId: id })
    },
    pushLog(log: TaskLog) {
      this.logs.push(log)
    },
  },
})
