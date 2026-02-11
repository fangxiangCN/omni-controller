import type { DeviceAction } from '../types'
import { getPlaygroundBridge } from '../ipc/client'

export interface FormValue {
  type: string
  prompt?: string
  params?: Record<string, unknown>
}

export interface PlaygroundAgent {
  [key: string]: any
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

export interface ExecutionDump {
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

export class PlaygroundSDK {
  private config: PlaygroundSDKConfig

  constructor(config: PlaygroundSDKConfig) {
    this.config = config
  }

  async executeAction(
    actionType: string,
    value: FormValue,
    options: ExecutionOptions,
  ): Promise<unknown> {
    return getPlaygroundBridge().executeAction(actionType, value, options)
  }

  async getActionSpace(context?: unknown): Promise<DeviceAction<unknown>[]> {
    return getPlaygroundBridge().getActionSpace(context) as Promise<DeviceAction<unknown>[]>
  }

  validateStructuredParams(
    _value: FormValue,
    _action: DeviceAction<unknown> | undefined,
  ): ValidationResult {
    return { valid: true }
  }

  async validateStructuredParamsAsync(
    value: FormValue,
    action: DeviceAction<unknown> | undefined,
  ): Promise<ValidationResult> {
    return getPlaygroundBridge().validateParams(value, action)
  }

  formatErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return String(error || 'Unknown error')
  }

  async formatErrorMessageAsync(error: unknown): Promise<string> {
    return getPlaygroundBridge().formatErrorMessage(error)
  }

  createDisplayContent(
    value: FormValue,
    _needsStructuredParams: boolean,
    _action: DeviceAction<unknown> | undefined,
  ): string {
    return value.prompt || value.type || ''
  }

  async createDisplayContentAsync(
    value: FormValue,
    needsStructuredParams: boolean,
    action: DeviceAction<unknown> | undefined,
  ): Promise<string> {
    return getPlaygroundBridge().createDisplayContent(value, needsStructuredParams, action)
  }

  get id(): string | undefined {
    return undefined
  }

  async getId(): Promise<string | undefined> {
    return getPlaygroundBridge().getId()
  }

  async checkStatus(): Promise<boolean> {
    return getPlaygroundBridge().checkStatus()
  }

  async overrideConfig(aiConfig: unknown): Promise<void> {
    return getPlaygroundBridge().overrideConfig(aiConfig)
  }

  async getTaskProgress(requestId: string): Promise<{ executionDump?: unknown }> {
    return getPlaygroundBridge().getTaskProgress(requestId)
  }

  async cancelTask(requestId: string): Promise<unknown> {
    return getPlaygroundBridge().cancelTask(requestId)
  }

  async cancelExecution(requestId: string): Promise<ExecutionData | null> {
    return getPlaygroundBridge().cancelExecution(requestId)
  }

  async getCurrentExecutionData(): Promise<ExecutionData> {
    return getPlaygroundBridge().getCurrentExecutionData()
  }

  async getScreenshot(): Promise<ScreenshotData | null> {
    return getPlaygroundBridge().getScreenshot()
  }

  async getInterfaceInfo(): Promise<InterfaceInfo | null> {
    return getPlaygroundBridge().getInterfaceInfo()
  }

  getServiceMode(): ServiceMode {
    return 'Server'
  }

  onDumpUpdate(callback: (dump: string, executionDump?: ExecutionDump) => void): () => void {
    return getPlaygroundBridge().onDumpUpdate(callback)
  }

  onProgressUpdate(callback: (tip: string) => void): () => void {
    return getPlaygroundBridge().onProgressUpdate(callback)
  }
}

export default PlaygroundSDK

export * from './constants'
