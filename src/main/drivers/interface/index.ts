/**
 * Device Adapter Interface
 * 统一的设备适配器接口定义
 */

export interface DeviceSize {
  width: number
  height: number
}

export interface DeviceFrame {
  format: 'jpeg' | 'png' | 'raw'
  data: Buffer | Uint8Array
  timestamp: number
}

export interface DeviceAction<TParam = unknown, TReturn = unknown> {
  name: string
  description?: string
  paramSchema?: unknown
  execute: (param: TParam) => Promise<TReturn>
}

export interface IDeviceAdapter {
  /** 设备类型标识 */
  interfaceType: string
  
  /** 设备ID */
  deviceId?: string
  
  /** 设备名称 */
  deviceName?: string
  
  /**
   * 连接设备
   */
  connect(deviceId?: string): Promise<boolean>
  
  /**
   * 断开设备连接
   */
  disconnect(): Promise<void>
  
  /**
   * 获取设备屏幕尺寸
   */
  size(): Promise<DeviceSize>
  
  /**
   * 获取屏幕截图
   */
  screenshot(): Promise<Buffer>
  
  /**
   * 开始屏幕流
   */
  startStream(onFrame: (frame: DeviceFrame) => void): Promise<void>
  
  /**
   * 停止屏幕流
   */
  stopStream(): Promise<void>
  
  /**
   * 获取设备支持的动作空间
   */
  actionSpace(): DeviceAction[]
  
  /**
   * 点击屏幕
   */
  tap(x: number, y: number): Promise<void>
  
  /**
   * 长按屏幕
   */
  longPress(x: number, y: number, duration?: number): Promise<void>
  
  /**
   * 滑动/拖拽
   */
  swipe(fromX: number, fromY: number, toX: number, toY: number, duration?: number): Promise<void>
  
  /**
   * 输入文本
   */
  type(text: string): Promise<void>
  
  /**
   * 返回上一页
   */
  back(): Promise<void>
  
  /**
   * 回到主页
   */
  home(): Promise<void>
  
  /**
   * 获取应用列表
   */
  getApps?(): Promise<string[]>
  
  /**
   * 启动应用
   */
  launchApp?(packageName: string): Promise<void>
}

export type DeviceStatus = 'connected' | 'disconnected' | 'busy' | 'error'

export interface DeviceInfo {
  id: string
  name: string
  type: 'android' | 'ios' | 'web' | 'ohos'
  status: DeviceStatus
  resolution?: string
  osVersion?: string
  adapter?: IDeviceAdapter
}
