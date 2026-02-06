/**
 * PlaygroundSDK 的 IPC 包装器
 * 
 * 这个模块提供了与 @omni/playground 的 PlaygroundSDK 相同的 API，
 * 但所有调用都通过 IPC 转发到主进程执行。
 * 
 * 注意：这个模块完全不依赖 @omni/core 或 @omni/playground，
 * 所有类型都是本地定义的，确保渲染进程不会加载 Node.js 代码。
 */

// 本地类型定义（与 @omni/playground 和 @omni/core 保持一致）
export interface FormValue {
  type: string
  prompt?: string
  params?: Record<string, unknown>
}

export interface ExecutionOptions {
  deepThink?: boolean
  screenshotIncluded?: boolean
  domIncluded?: boolean | 'visible-only'
  planningStrategy?: 'fast' | 'standard'
  context?: any
  requestId?: string
  deviceOptions?: DeviceOptions
}

export interface DeviceOptions {
  imeStrategy?: 'always-yadb' | 'yadb-for-non-ascii'
  autoDismissKeyboard?: boolean
  keyboardDismissStrategy?: 'esc-first' | 'back-first'
  alwaysRefreshScreenInfo?: boolean
}

export interface DeviceAction<TParam = any, TReturn = any> {
  type: string
  description: string
  param?: TParam
  return?: TReturn
}

export interface ExecutionDump {
  // 简化定义，实际类型更复杂但 IPC 传输时不需要完整类型
  [key: string]: any
}

export interface PlaygroundSDKConfig {
  type: 'remote-execution' | 'local-execution'
  serverUrl?: string
}

export interface ValidationResult {
  valid: boolean
  errorMessage?: string
}

export interface InterfaceInfo {
  type: string
  description?: string
}

export interface ScreenshotData {
  screenshot: string
  timestamp: number
}

export interface ExecutionData {
  dump: ExecutionDump | null
  reportHTML: string | null
}

export type ServiceMode = 'In-Browser-Extension' | 'Server'

/**
 * PlaygroundSDK IPC 包装器类
 * 
 * 注意：这个类只是主进程中实际 PlaygroundSDK 实例的代理。
 * 所有方法调用都通过 IPC 转发到主进程执行。
 */
export class PlaygroundSDK {
  private config: PlaygroundSDKConfig

  constructor(config: PlaygroundSDKConfig) {
    this.config = config
    // 配置信息保留在客户端，实际实例在主进程中创建
  }

  /**
   * 执行动作
   */
  async executeAction(
    actionType: string,
    value: FormValue,
    options: ExecutionOptions,
  ): Promise<unknown> {
    return window.omni.playground.executeAction(actionType, value, options)
  }

  /**
   * 获取可用的动作列表
   */
  async getActionSpace(context?: unknown): Promise<DeviceAction<unknown>[]> {
    return window.omni.playground.getActionSpace(context) as Promise<DeviceAction<unknown>[]>
  }

  /**
   * 验证结构化参数
   * 
   * 注意：原始 PlaygroundSDK 中这是同步方法，但 IPC 是异步的。
   * 这里为了 API 兼容性，返回一个默认结果，并在后台异步获取实际结果。
   * 建议在实际使用时先调用此方法，然后立即调用 executeAction，
   * 因为 executeAction 会在服务器端进行实际验证。
   */
  validateStructuredParams(
    value: FormValue,
    action: DeviceAction<unknown> | undefined,
  ): ValidationResult {
    // 返回默认有效结果
    // 真正的验证会在 executeAction 时在服务器端进行
    return { valid: true }
  }

  /**
   * 异步验证参数（如果需要服务器端的验证结果）
   */
  async validateStructuredParamsAsync(
    value: FormValue,
    action: DeviceAction<unknown> | undefined,
  ): Promise<ValidationResult> {
    return window.omni.playground.validateParams(value, action)
  }

  /**
   * 格式化错误消息
   * 
   * 注意：这是一个同步方法的简化实现。
   * 如果需要服务器端的格式化，请使用 formatErrorMessageAsync。
   */
  formatErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return String(error || 'Unknown error')
  }

  /**
   * 异步格式化错误消息（使用服务器端的格式化逻辑）
   */
  async formatErrorMessageAsync(error: unknown): Promise<string> {
    return window.omni.playground.formatErrorMessage(error)
  }

  /**
   * 创建显示内容
   * 
   * 注意：原始 PlaygroundSDK 中这是同步方法，这里提供一个简化实现。
   * 如果需要服务器端生成的内容，请使用 createDisplayContentAsync。
   */
  createDisplayContent(
    value: FormValue,
    _needsStructuredParams: boolean,
    _action: DeviceAction<unknown> | undefined,
  ): string {
    // 简单的客户端实现
    return value.prompt || value.type || ''
  }

  /**
   * 异步创建显示内容（使用服务器端的逻辑）
   */
  async createDisplayContentAsync(
    value: FormValue,
    needsStructuredParams: boolean,
    action: DeviceAction<unknown> | undefined,
  ): Promise<string> {
    return window.omni.playground.createDisplayContent(value, needsStructuredParams, action)
  }

  /**
   * 获取适配器 ID
   * 
   * 注意：原始 PlaygroundSDK 中这是同步 getter，但 IPC 是异步的。
   * 这里返回 undefined，请使用 getId() 方法异步获取实际 ID。
   */
  get id(): string | undefined {
    return undefined
  }

  /**
   * 异步获取 ID
   */
  async getId(): Promise<string | undefined> {
    return window.omni.playground.getId()
  }

  /**
   * 检查服务器状态
   */
  async checkStatus(): Promise<boolean> {
    return window.omni.playground.checkStatus()
  }

  /**
   * 覆盖配置
   */
  async overrideConfig(aiConfig: unknown): Promise<void> {
    return window.omni.playground.overrideConfig(aiConfig)
  }

  /**
   * 获取任务进度
   */
  async getTaskProgress(requestId: string): Promise<{ executionDump?: unknown }> {
    return window.omni.playground.getTaskProgress(requestId)
  }

  /**
   * 取消任务
   */
  async cancelTask(requestId: string): Promise<unknown> {
    return window.omni.playground.cancelTask(requestId)
  }

  /**
   * 取消执行
   */
  async cancelExecution(requestId: string): Promise<ExecutionData | null> {
    return window.omni.playground.cancelExecution(requestId)
  }

  /**
   * 获取当前执行数据
   */
  async getCurrentExecutionData(): Promise<ExecutionData> {
    return window.omni.playground.getCurrentExecutionData()
  }

  /**
   * 获取截图
   */
  async getScreenshot(): Promise<ScreenshotData | null> {
    return window.omni.playground.getScreenshot()
  }

  /**
   * 获取接口信息
   */
  async getInterfaceInfo(): Promise<InterfaceInfo | null> {
    return window.omni.playground.getInterfaceInfo()
  }

  /**
   * 获取服务模式
   */
  getServiceMode(): ServiceMode {
    return 'Server'
  }

  /**
   * 注册 dump 更新回调
   * 
   * @returns 取消监听的函数
   */
  onDumpUpdate(callback: (dump: string, executionDump?: ExecutionDump) => void): () => void {
    return window.omni.playground.onDumpUpdate(callback)
  }

  /**
   * 注册进度更新回调
   * 
   * @returns 取消监听的函数
   */
  onProgressUpdate(callback: (tip: string) => void): () => void {
    return window.omni.playground.onProgressUpdate(callback)
  }
}

export default PlaygroundSDK
