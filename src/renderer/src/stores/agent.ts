import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AgentLogPayload, ModelConfigPayload, ModelType } from '../types'

export const useAgentStore = defineStore('agent', () => {
  // State
  const isReady = ref(false)
  const isRunning = ref(false)
  const logs = ref<AgentLogPayload[]>([])
  const currentThought = ref('')
  const currentActions = ref<string[]>([])
  const lastResult = ref<{ success: boolean; message?: string } | null>(null)
  const error = ref<string | null>(null)
  const models = ref<ModelConfigPayload[]>([])
  const currentModel = ref<ModelConfigPayload | null>(null)

  // Getters
  const hasError = computed(() => error.value !== null)
  const isInitialized = computed(() => isReady.value)
  const canSendTask = computed(() => isReady.value && !isRunning.value)

  // Actions
  function addLog(log: AgentLogPayload) {
    logs.value.push(log)
    // 限制日志数量，防止内存溢出
    if (logs.value.length > 1000) {
      logs.value = logs.value.slice(-500)
    }
  }

  function clearLogs() {
    logs.value = []
  }

  function setReady(ready: boolean) {
    isReady.value = ready
  }

  function setRunning(running: boolean) {
    isRunning.value = running
  }

  function setError(err: string | null) {
    error.value = err
  }

  function setModels(newModels: ModelConfigPayload[]) {
    models.value = newModels
  }

  function setCurrentModel(model: ModelConfigPayload | null) {
    currentModel.value = model
  }

  function updateThought(thought: string) {
    currentThought.value = thought
  }

  function updateActions(actions: string[]) {
    currentActions.value = actions
  }

  function setResult(result: { success: boolean; message?: string }) {
    lastResult.value = result
  }

  // 发送任务（需要在组件中调用 IPC）
  function sendTask(prompt: string) {
    if (!canSendTask.value) {
      error.value = 'Agent not ready or already running'
      return
    }
    
    // 添加用户输入日志
    addLog({
      type: 'info',
      content: `Task: ${prompt}`,
      timestamp: Date.now()
    })
    
    isRunning.value = true
    currentThought.value = ''
    currentActions.value = []
    
    // 实际的发送逻辑在 composable 中处理
    return prompt
  }

  function stopTask() {
    isRunning.value = false
    addLog({
      type: 'warning',
      content: 'Task stopped by user',
      timestamp: Date.now()
    })
  }

  return {
    // State
    isReady,
    isRunning,
    logs,
    currentThought,
    currentActions,
    lastResult,
    error,
    models,
    currentModel,
    // Getters
    hasError,
    isInitialized,
    canSendTask,
    // Actions
    addLog,
    clearLogs,
    setReady,
    setRunning,
    setError,
    setModels,
    setCurrentModel,
    updateThought,
    updateActions,
    setResult,
    sendTask,
    stopTask
  }
})
