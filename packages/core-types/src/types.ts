import type { z } from 'zod'
import type {
  BaseElement,
  LocateResultElement,
  Rect,
  Size,
  Point,
  ElementTreeNode,
  WebElementInfo,
} from '@omni/shared-types/types'

export type { BaseElement, LocateResultElement, Rect, Size, Point, ElementTreeNode, WebElementInfo }

export type DetailedLocateParam =
  | string
  | {
      prompt?: string | { prompt: string }
      description?: string
    }
  | Record<string, any>

export type ScrollParam = {
  direction?: string
  scrollType?: string
  distance?: number
  timeMs?: number
}

export type PullParam = {
  direction?: string
  distance?: number
  duration?: number
}

export interface UIContext {
  screenshot: unknown
  size: Size
  _isFrozen?: boolean
}

export type WebUIContext = UIContext

export type ExecutionTaskType = 'Planning' | 'Insight' | 'Action Space' | 'Log'

export type AIUsageInfo = Record<string, any> & {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  cached_input?: number
  time_cost?: number
  model_name?: string
  model_description?: string
  intent?: string
  request_id?: string
}

export interface ExecutionTaskApply<
  Type extends ExecutionTaskType = ExecutionTaskType,
  TaskParam = any,
  TaskOutput = any,
  TaskLog = any,
> {
  type: Type
  subType?: string
  subTask?: boolean
  param?: TaskParam
  thought?: string
  uiContext?: UIContext
  output?: TaskOutput
  log?: TaskLog
  timing?: { start?: number; end?: number; cost?: number }
  usage?: AIUsageInfo
  error?: any
}

export type ExecutionTask = ExecutionTaskApply<any, any, any, any> &
  Record<string, any>

export interface ExecutionTaskPlanning extends ExecutionTask {
  type: 'Planning'
}

export interface ExecutionTaskPlanningLocate extends ExecutionTaskPlanning {
  subType?: 'Locate'
  param?: DetailedLocateParam
}

export interface ExecutionTaskInsightQuery extends ExecutionTask {
  type: 'Insight'
  subType?: 'Query'
}

export interface ExecutionTaskInsightAssertion extends ExecutionTask {
  type: 'Insight'
  subType?: 'Assert'
}

export interface ExecutionTaskAction extends ExecutionTask {
  type: 'Action Space'
}

export interface ExecutionTaskProgressOptions {
  onTaskStart?: (task: ExecutionTask) => Promise<void> | void
}

export interface ExecutorContext {
  task: ExecutionTask
  element?: LocateResultElement | null
  uiContext?: UIContext
}

export interface DeviceAction<TParam = any, TReturn = any> {
  name: string
  description?: string
  interfaceAlias?: string
  paramSchema?: z.ZodType<TParam>
  call?: (param: TParam, context: ExecutorContext) => Promise<TReturn> | TReturn
  delayAfterRunner?: number
}

export interface IExecutionDump {
  logTime: number
  name: string
  description?: string
  tasks: ExecutionTask[]
  aiActContext?: string
}

export type ExecutionDump = IExecutionDump

export interface IGroupedActionDump {
  sdkVersion: string
  groupName: string
  modelBriefs: string[]
  executions: IExecutionDump[]
}

export type GroupedActionDump = IGroupedActionDump
