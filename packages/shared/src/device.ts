export type DeviceType = 'android' | 'ohos' | 'web'

export type DeviceInfo = {
  id: string
  name: string
  type: DeviceType
  osVersion?: string
  size?: DeviceSize
}

export type DeviceList = DeviceInfo[]

export type DeviceSize = {
  width: number
  height: number
  dpr?: number
}

export type DeviceFrame = {
  data: Uint8Array
  format: 'h264' | 'jpeg'
}

