import { useState, useEffect, useCallback, useRef } from 'react'
import { ipcClient } from '../ipc/client'
import type { 
  AgentLogPayload,
  AgentTaskCompletePayload,
  ModelConfigPayload,
  ModelType
} from '../types/ipc'

interface AgentState {
  isReady: boolean
  isRunning: boolean
  logs: AgentLogPayload[]
  currentThought: string
  currentActions: string[]
  lastResult: AgentTaskCompletePayload | null
  error: string | null
  models: ModelConfigPayload[]
  currentModel: ModelConfigPayload | null
}

export function useAgent() {
  const [state, setState] = useState<AgentState>({
    isReady: false,
    isRunning: false,
    logs: [],
    currentThought: '',
    currentActions: [],
    lastResult: null,
    error: null,
    models: [],
    currentModel: null,
  })

  const logsEndRef = useRef<HTMLDivElement>(null)

  // Initialize agent
  const initialize = useCallback(async (apiKey: string) => {
    try {
      setState((prev) => ({ ...prev, error: null }))
      
      const result = await ipcClient.agent.initialize({
        provider: 'openai',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        apiKey,
        model: 'autoglm-phone',
        temperature: 0.7,
        maxTokens: 4096,
      })

      if (result.success) {
        setState((prev) => ({ ...prev, isReady: true }))
      } else {
        setState((prev) => ({ 
          ...prev, 
          error: result.error || 'Failed to initialize agent' 
        }))
      }
    } catch (err) {
      setState((prev) => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }))
    }
  }, [])

  // Fetch available models
  const fetchModels = useCallback(async () => {
    try {
      const models = await ipcClient.agent.getModels()
      setState((prev) => ({ ...prev, models }))
    } catch (err) {
      console.error('Failed to fetch models:', err)
    }
  }, [])

  // Fetch current model
  const fetchCurrentModel = useCallback(async () => {
    try {
      const model = await ipcClient.agent.getCurrentModel()
      setState((prev) => ({ ...prev, currentModel: model }))
    } catch (err) {
      console.error('Failed to fetch current model:', err)
    }
  }, [])

  // Set model
  const setModel = useCallback(async (config: ModelConfigPayload) => {
    try {
      const result = await ipcClient.agent.setModel(config)
      if (result.success) {
        setState((prev) => ({ ...prev, currentModel: config, error: null }))
        return true
      } else {
        setState((prev) => ({ 
          ...prev, 
          error: result.error || 'Failed to set model' 
        }))
        return false
      }
    } catch (err) {
      setState((prev) => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Failed to set model' 
      }))
      return false
    }
  }, [])

  // Initialize with specific model
  const initializeWithModel = useCallback(async (modelType: ModelType, apiKey: string) => {
    try {
      setState((prev) => ({ ...prev, error: null }))
      
      // Get available models
      const models = await ipcClient.agent.getModels()
      const selectedModel = models.find(m => m.type === modelType)
      
      if (!selectedModel) {
        setState((prev) => ({ 
          ...prev, 
          error: `Model ${modelType} not found` 
        }))
        return false
      }

      // Set API key
      const config = { ...selectedModel, apiKey }
      
      const result = await ipcClient.agent.setModel(config)
      if (!result.success) {
        setState((prev) => ({ 
          ...prev, 
          error: result.error || 'Failed to set model' 
        }))
        return false
      }

      // Initialize agent
      const initResult = await ipcClient.agent.initialize({
        provider: config.provider,
        baseUrl: config.baseUrl,
        apiKey,
        model: config.model,
        temperature: 0.7,
        maxTokens: 4096,
      })

      if (initResult.success) {
        setState((prev) => ({ ...prev, isReady: true, currentModel: config }))
        return true
      } else {
        setState((prev) => ({ 
          ...prev, 
          error: initResult.error || 'Failed to initialize agent' 
        }))
        return false
      }
    } catch (err) {
      setState((prev) => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }))
      return false
    }
  }, [])

  // Start task
  const startTask = useCallback((prompt: string) => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      logs: [],
      currentThought: '',
      currentActions: [],
      lastResult: null,
      error: null,
    }))
    
    ipcClient.agent.startTask(prompt)
  }, [])

  // Stop task
  const stopTask = useCallback((taskId: string) => {
    ipcClient.agent.stopTask(taskId)
    setState((prev) => ({ ...prev, isRunning: false }))
  }, [])

  // Listen to agent events
  useEffect(() => {
    const unsubLog = ipcClient.agent.onLog((payload) => {
      setState((prev) => ({
        ...prev,
        logs: [...prev.logs, payload],
      }))
    })

    const unsubPlanning = ipcClient.agent.onPlanning((payload) => {
      setState((prev) => ({
        ...prev,
        currentThought: payload.thought,
        currentActions: payload.actions,
      }))
    })

    const unsubAction = ipcClient.agent.onActionStart((_payload) => {
      // Action started - could be used for UI feedback
    })

    const unsubComplete = ipcClient.agent.onTaskComplete((payload) => {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        lastResult: payload,
      }))
    })

    return () => {
      unsubLog()
      unsubPlanning()
      unsubAction()
      unsubComplete()
    }
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [state.logs])

  // Load models on mount
  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  return {
    ...state,
    initialize,
    initializeWithModel,
    startTask,
    stopTask,
    fetchModels,
    fetchCurrentModel,
    setModel,
    logsEndRef,
  }
}

export default useAgent
