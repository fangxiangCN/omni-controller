// 设备类型
export type DeviceType = 'android' | 'ios' | 'web' | 'ohos'

export type DeviceStatus = 'connected' | 'disconnected' | 'busy'

export interface Device {
  id: string
  name: string
  type: DeviceType
  status: DeviceStatus
  resolution?: string
  osVersion?: string
}

// 报告类型
export interface Report {
  id: string
  title: string
  createdAt: number
  path: string
  summary?: string
}

// 任务类型
export interface Task {
  id: string
  type: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  prompt: string
  startTime?: number
  endTime?: number
  logs: TaskLog[]
}

export interface TaskLog {
  type: 'info' | 'error' | 'success' | 'warning'
  content: string
  timestamp: number
}

// Agent 日志类型
export interface AgentLogPayload {
  type: 'info' | 'error' | 'success' | 'warning'
  content: string
  timestamp: number
}

// Agent 规划类型
export interface AgentPlanningPayload {
  thought: string
  actions: string[]
}

// Agent 动作类型
export interface AgentActionPayload {
  action: string
  param?: unknown
}

// Agent 任务完成类型
export interface AgentTaskCompletePayload {
  success: boolean
  message?: string
}

// 模型配置类型
export type ModelType = 'autoglm-phone' | 'gpt-4v' | 'claude-3-opus' | 'claude-3-sonnet' | 'custom'

export interface ModelConfigPayload {
  type: ModelType
  name: string
  provider: 'openai' | 'anthropic' | 'custom'
  baseUrl: string
  apiKey: string
  model: string
  description?: string
  capabilities: {
    vision: boolean
    planning: boolean
    action: boolean
  }
}

// AI 模型配置
export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'custom'
  baseUrl: string
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

// IPC 类型
export interface DeviceListPayload {
  devices: Device[]
}

export interface DeviceFramePayload {
  deviceId: string
  format: 'jpeg' | 'png' | 'raw'
  data: Buffer | Uint8Array
}

export interface TaskLogPayload {
  type: string
  content: string
  timestamp: number
}

export interface TaskStatePayload {
  status: 'idle' | 'running' | 'completed' | 'failed'
  taskId?: string
}

export interface TaskProgressPayload {
  progress: number
  message?: string
}

export interface ReportListPayload {
  reports: Report[]
}

export interface ReportPayload {
  id: string
  title: string
  createdAt: string
  path?: string
  html?: string
}

// Playground 类型
export interface PlaygroundAction {
  type: string
  value: unknown
  options?: Record<string, unknown>
}

export interface PlaygroundDumpPayload {
  elements: any[]
  screenshot?: string
}

// Chat 消息类型
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  avatar?: string
  thinking?: boolean
  thought?: string
  actions?: string[]
  timestamp?: number
}
