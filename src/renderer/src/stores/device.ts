import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Device } from '../types'

export const useDeviceStore = defineStore('device', () => {
  // State
  const devices = ref<Device[]>([])
  const activeDeviceId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeDevice = computed(() => 
    devices.value.find(d => d.id === activeDeviceId.value)
  )

  const connectedDevices = computed(() =>
    devices.value.filter(d => d.status === 'connected')
  )

  // Actions
  function setDevices(newDevices: Device[]) {
    devices.value = newDevices
    
    // 自动选择第一个连接的设备
    if (!activeDeviceId.value && newDevices.length > 0) {
      const connected = newDevices.find(d => d.status === 'connected')
      activeDeviceId.value = connected?.id || newDevices[0]?.id
    }
  }

  function selectDevice(id: string) {
    activeDeviceId.value = id
  }

  function updateDeviceStatus(id: string, status: Device['status']) {
    const device = devices.value.find(d => d.id === id)
    if (device) {
      device.status = status
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    devices,
    activeDeviceId,
    loading,
    error,
    // Getters
    activeDevice,
    connectedDevices,
    // Actions
    setDevices,
    selectDevice,
    updateDeviceStatus,
    clearError
  }
})
