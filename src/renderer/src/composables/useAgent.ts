import { onMounted, onUnmounted } from 'vue'
import { useAgentStore } from '../stores/agent'
import { useIpc } from './useIpc'
import type { 
  AgentLogPayload, 
  AgentPlanningPayload, 
  AgentActionPayload,
  AgentTaskCompletePayload,
  ModelConfigPayload 
} from '../types'

export function useAgent() {
  const agentStore = useAgentStore()
  const { on, send, invoke } = useIpc()

  let unsubscribers: (() => void)[] = []

  async function fetchModels() {
    try {
      const models = await invoke('agent:get-models') as ModelConfigPayload[]
      agentStore.setModels(models)
    } catch (err) {
      console.error('Failed to fetch models:', err)
    }
  }

  async function setModel(config: ModelConfigPayload) {
    try {
      const result = await invoke('agent:set-model', config) as { success: boolean; error?: string }
      if (result.success) {
        agentStore.setCurrentModel(config)
      }
      return result
    } catch (err) {
      console.error('Failed to set model:', err)
      return { success: false, error: String(err) }
    }
  }

  async function initialize(config?: any) {
    try {
      const result = await invoke('agent:initialize', config) as { success: boolean; error?: string }
      agentStore.setReady(result.success)
      if (result.error) {
        agentStore.setError(result.error)
      }
      return result
    } catch (err) {
      console.error('Failed to initialize agent:', err)
      agentStore.setError(String(err))
      return { success: false, error: String(err) }
    }
  }

  function startTask(prompt: string) {
    if (!agentStore.canSendTask) {
      agentStore.setError('Agent not ready or already running')
      return
    }

    agentStore.sendTask(prompt)
    send('agent:start-task', prompt)
  }

  function stopTask(taskId: string) {
    agentStore.stopTask()
    send('agent:stop-task', taskId)
  }

  onMounted(() => {
    // 监听各种 Agent 事件
    const unsubLog = on('agent:log', (_event: unknown, payload: AgentLogPayload) => {
      agentStore.addLog(payload)
    })

    const unsubPlanning = on('agent:planning', (_event: unknown, payload: AgentPlanningPayload) => {
      agentStore.updateThought(payload.thought)
      agentStore.updateActions(payload.actions)
    })

    const unsubAction = on('agent:action-start', (_event: unknown, payload: AgentActionPayload) => {
      agentStore.addLog({
        type: 'info',
        content: `Action: ${payload.action}`,
        timestamp: Date.now()
      })
    })

    const unsubComplete = on('agent:task-complete', (_event: unknown, payload: AgentTaskCompletePayload) => {
      agentStore.setRunning(false)
      agentStore.setResult(payload)
      agentStore.addLog({
        type: payload.success ? 'success' : 'error',
        content: payload.message || (payload.success ? 'Task completed' : 'Task failed'),
        timestamp: Date.now()
      })
    })

    unsubscribers = [unsubLog, unsubPlanning, unsubAction, unsubComplete]

    // 获取可用模型
    fetchModels()
  })

  onUnmounted(() => {
    unsubscribers.forEach(unsub => unsub?.())
  })

  return {
    // State
    isReady: agentStore.isReady,
    isRunning: agentStore.isRunning,
    logs: agentStore.logs,
    currentThought: agentStore.currentThought,
    currentActions: agentStore.currentActions,
    lastResult: agentStore.lastResult,
    error: agentStore.error,
    models: agentStore.models,
    currentModel: agentStore.currentModel,
    // Getters
    hasError: agentStore.hasError,
    canSendTask: agentStore.canSendTask,
    // Actions
    fetchModels,
    setModel,
    initialize,
    startTask,
    stopTask,
    clearLogs: agentStore.clearLogs,
    clearError: agentStore.setError.bind(null, null)
  }
}
