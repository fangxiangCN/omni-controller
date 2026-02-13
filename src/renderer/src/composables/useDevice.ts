import { onMounted, onUnmounted } from 'vue'
import { useDeviceStore } from '../stores/device'
import { useIpc } from './useIpc'
import type { DeviceListPayload } from '../types'

export function useDevice() {
  const deviceStore = useDeviceStore()
  const { on, send } = useIpc()

  let unsubscribeDeviceList: (() => void) | null = null

  function refreshDevices() {
    send('device:refresh')
  }

  function selectDevice(deviceId: string) {
    send('device:select', deviceId)
    deviceStore.selectDevice(deviceId)
  }

  function disconnectDevice(deviceId: string) {
    send('device:disconnect', deviceId)
  }

  onMounted(() => {
    // 监听设备列表更新
    unsubscribeDeviceList = on('device:list', (_event: unknown, payload: DeviceListPayload) => {
      deviceStore.setDevices(payload.devices)
    })

    // 初始刷新
    refreshDevices()
  })

  onUnmounted(() => {
    unsubscribeDeviceList?.()
  })

  return {
    devices: deviceStore.devices,
    activeDevice: deviceStore.activeDevice,
    activeDeviceId: deviceStore.activeDeviceId,
    connectedDevices: deviceStore.connectedDevices,
    refreshDevices,
    selectDevice,
    disconnectDevice
  }
}
