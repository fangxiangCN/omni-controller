// IPC Channel Constants
export const IPC_DEVICE_LIST = 'device:list'
export const IPC_DEVICE_FRAME = 'device:frame'
export const IPC_DEVICE_SELECT = 'device:select'
export const IPC_DEVICE_REFRESH = 'device:refresh'
export const IPC_DEVICE_DISCONNECT = 'device:disconnect'
export const IPC_DEVICE_STATUS = 'device:status'

export const IPC_START_TASK = 'task:start'
export const IPC_STOP_TASK = 'task:stop'
export const IPC_TASK_LOG = 'task:log'
export const IPC_TASK_STATE = 'task:state'
export const IPC_TASK_PROGRESS = 'task:progress'

export const IPC_REPORT_UPDATE = 'report:update'
export const IPC_REPORT_LIST = 'report:list'
export const IPC_REPORT_SELECT = 'report:select'
export const IPC_REPORT_DELETE = 'report:delete'

export const IPC_WINDOW_MINIMIZE = 'window:minimize'
export const IPC_WINDOW_TOGGLE_MAXIMIZE = 'window:toggle-maximize'
export const IPC_WINDOW_CLOSE = 'window:close'
export const IPC_WINDOW_STATE = 'window:state'

// IPC Payload Types
export interface DeviceInfo {
  id: string
  name: string
  type: 'android' | 'ios' | 'web'
  status: 'connected' | 'disconnected' | 'busy'
  resolution?: string
  osVersion?: string
}

export interface DeviceListPayload {
  devices: DeviceInfo[]
}

export interface DeviceFramePayload {
  deviceId: string
  format: 'jpeg' | 'png' | 'raw'
  data: string | Uint8Array
}

export interface TaskLogPayload {
  type: 'info' | 'error' | 'success' | 'warning'
  content: string
  timestamp: number
}

export interface TaskStatePayload {
  status: 'idle' | 'running' | 'completed' | 'failed'
  taskId?: string
  progress?: number
}

export interface TaskProgressPayload {
  taskId: string
  step: number
  totalSteps: number
  message: string
}

export interface ReportPayload {
  id: string
  title: string
  html?: string
  path?: string
  createdAt: number
}

export interface ReportListPayload {
  reports: ReportPayload[]
}

export interface WindowStatePayload {
  maximized: boolean
}

// Playground IPC Channels
export const IPC_PLAYGROUND_EXECUTE = 'playground:execute'
export const IPC_PLAYGROUND_GET_ACTIONS = 'playground:get-actions'
export const IPC_PLAYGROUND_GET_SCREENSHOT = 'playground:get-screenshot'
export const IPC_PLAYGROUND_GET_STATUS = 'playground:get-status'
export const IPC_PLAYGROUND_CANCEL = 'playground:cancel'
export const IPC_PLAYGROUND_DUMP_UPDATE = 'playground:dump-update'
export const IPC_PLAYGROUND_PROGRESS = 'playground:progress'

export interface PlaygroundAction {
  type: string
  value: unknown
  options?: Record<string, unknown>
}

export interface PlaygroundDumpPayload {
  dump: string
  executionDump?: unknown
}

// Device IPC Channels - ADB Configuration
export const IPC_DEVICE_SET_ADB_PATH = 'device:set-adb-path'
export const IPC_DEVICE_GET_ADB_PATH = 'device:get-adb-path'

// Agent IPC Channels
export const IPC_AGENT_INITIALIZE = 'agent:initialize'
export const IPC_AGENT_START_TASK = 'agent:start-task'
export const IPC_AGENT_STOP_TASK = 'agent:stop-task'
export const IPC_AGENT_LOG = 'agent:log'
export const IPC_AGENT_PLANNING = 'agent:planning'
export const IPC_AGENT_ACTION_START = 'agent:action-start'
export const IPC_AGENT_TASK_COMPLETE = 'agent:task-complete'

// Model Selection IPC Channels
export const IPC_AGENT_GET_MODELS = 'agent:get-models'
export const IPC_AGENT_SET_MODEL = 'agent:set-model'
export const IPC_AGENT_GET_CURRENT_MODEL = 'agent:get-current-model'

export type ModelType = 'autoglm-phone' | 'gpt-4v' | 'claude-3-opus' | 'claude-3-sonnet' | 'custom'

export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'custom'
  baseUrl: string
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

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

export interface AgentLogPayload {
  type: 'info' | 'error' | 'success' | 'warning'
  content: string
  timestamp: number
}

export interface AgentPlanningPayload {
  thought: string
  actions: string[]
}

export interface AgentActionPayload {
  action: string
  param?: unknown
}

export interface AgentTaskCompletePayload {
  success: boolean
  message?: string
}
