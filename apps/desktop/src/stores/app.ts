import { defineStore } from 'pinia'

type DeviceItem = { id: string; name: string; type: 'android' | 'ohos' | 'web' }

type TaskLog = { type: 'thought' | 'plan' | 'action' | 'error' | 'info'; content: string }

export const useAppStore = defineStore('app', {
  state: () => ({
    devices: [] as DeviceItem[],
    activeDeviceId: '' as string,
    logs: [] as TaskLog[],
  }),
  actions: {
    setDevices(list: DeviceItem[]) {
      this.devices = list
      if (!this.activeDeviceId && list.length > 0) {
        this.activeDeviceId = list[0].id
      }
    },
    setActiveDevice(id: string) {
      this.activeDeviceId = id
    },
    pushLog(log: TaskLog) {
      this.logs.push(log)
    },
  },
})
