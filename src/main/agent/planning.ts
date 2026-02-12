/**
 * Planning Types
 * 规划相关的类型定义
 */

// 动作计划
export interface ActionPlan {
  type: 'tap' | 'type' | 'swipe' | 'back' | 'home' | 'longPress'
  param?: Record<string, unknown>
  description?: string
}

// 规划结果
export interface PlanResult {
  shouldComplete: boolean
  thought: string
  actions: ActionPlan[]
  completeMessage?: string
}

// 规划上下文
export interface PlanningContext {
  taskPrompt: string
  screenshot: string
  history: string
  subGoals?: string
  memories?: string
}

// 规划策略接口
export interface PlanningStrategy {
  name: string
  plan(context: PlanningContext): Promise<PlanResult>
}

// AutoGLM-Phone 特定响应格式
export interface AutoGLMResponse {
  think?: string
  answer?: string
  action?: string
  action_input?: string
  complete?: boolean
}

// 元素定位结果
export interface LocateResult {
  x: number
  y: number
  width?: number
  height?: number
  confidence?: number
}

// 执行结果
export interface ExecutionResult {
  success: boolean
  output?: unknown
  error?: string
  timing?: {
    start: number
    end: number
    cost: number
  }
}
