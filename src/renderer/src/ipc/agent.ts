/**
 * Agent IPC Client
 * 渲染进程与 Agent 通信的客户端
 */

import {
  IPC_AGENT_INITIALIZE,
  IPC_AGENT_START_TASK,
  IPC_AGENT_STOP_TASK,
  IPC_AGENT_LOG,
  IPC_AGENT_PLANNING,
  IPC_AGENT_ACTION_START,
  IPC_AGENT_TASK_COMPLETE,
  IPC_AGENT_GET_MODELS,
  IPC_AGENT_SET_MODEL,
  IPC_AGENT_GET_CURRENT_MODEL,
  type AgentLogPayload,
  type AgentPlanningPayload,
  type AgentActionPayload,
  type AgentTaskCompletePayload,
  type AIModelConfig,
  type ModelConfigPayload,
} from '../types/ipc'

// Get ipcRenderer from window.api (exposed by preload script)
const getIpcRenderer = () => {
  const api = (window as any).api
  if (!api?.ipcRenderer) {
    console.warn('[IPC] api.ipcRenderer not available')
    return null
  }
  return api.ipcRenderer
}

export const agentIpc = {
  /**
   * 初始化 Agent
   */
  initialize: (config?: AIModelConfig) => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_AGENT_INITIALIZE, config)
  },

  /**
   * 启动任务
   */
  startTask: (prompt: string) => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_AGENT_START_TASK, prompt)
  },

  /**
   * 停止任务
   */
  stopTask: (taskId: string) => {
    const ipc = getIpcRenderer()
    ipc?.send(IPC_AGENT_STOP_TASK, taskId)
  },

  /**
   * 监听日志
   */
  onLog: (callback: (payload: AgentLogPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: AgentLogPayload) => callback(payload)
    return ipc.on(IPC_AGENT_LOG, handler)
  },

  /**
   * 监听规划事件
   */
  onPlanning: (callback: (payload: AgentPlanningPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: AgentPlanningPayload) => callback(payload)
    return ipc.on(IPC_AGENT_PLANNING, handler)
  },

  /**
   * 监听动作开始
   */
  onActionStart: (callback: (payload: AgentActionPayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: AgentActionPayload) => callback(payload)
    return ipc.on(IPC_AGENT_ACTION_START, handler)
  },

  /**
   * 监听任务完成
   */
  onTaskComplete: (callback: (payload: AgentTaskCompletePayload) => void) => {
    const ipc = getIpcRenderer()
    if (!ipc) return () => {}
    const handler = (_event: unknown, payload: AgentTaskCompletePayload) => callback(payload)
    return ipc.on(IPC_AGENT_TASK_COMPLETE, handler)
  },

  /**
   * 获取可用模型列表
   */
  getModels: () => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_AGENT_GET_MODELS) as Promise<ModelConfigPayload[]>
  },

  /**
   * 设置当前模型
   */
  setModel: (config: ModelConfigPayload) => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_AGENT_SET_MODEL, config) as Promise<{ success: boolean; error?: string }>
  },

  /**
   * 获取当前模型配置
   */
  getCurrentModel: () => {
    const ipc = getIpcRenderer()
    return ipc?.invoke(IPC_AGENT_GET_CURRENT_MODEL) as Promise<ModelConfigPayload | null>
  },
}

export default agentIpc
