export interface Device {
  id: string
  name: string
  type: 'android' | 'ios' | 'web'
  status: 'connected' | 'disconnected' | 'busy'
  resolution?: string
  osVersion?: string
}

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

export interface Report {
  id: string
  title: string
  createdAt: number
  path: string
  summary?: string
}

export interface PlaygroundAction {
  type: string
  value: unknown
  options?: Record<string, unknown>
}
