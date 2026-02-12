/**
 * Task Scheduler with AI Agent Integration
 * 集成 AI Agent 的任务调度器
 */

import { EventEmitter } from 'events'
import type deviceManager from '../device/manager'
import type Agent from '../../agent/core'
import { getAgentManager } from '../../agent/manager'
import type { AIModelConfig } from '../../ai/service'
import type { ModelConfig } from '../../agent/strategies'

interface Task {
  id: string
  prompt: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  logs: Array<{ type: string; content: string; timestamp: number }>
  startTime?: number
  endTime?: number
  result?: {
    success: boolean
    message?: string
  }
}

interface TaskSchedulerEvents {
  'taskStarted': (task: Task) => void
  'taskCompleted': (task: Task) => void
  'taskFailed': (task: Task, error: string) => void
  'log': (log: { type: string; content: string }) => void
  'planning': (data: { thought: string; actions: string[] }) => void
  'action:start': (data: { action: string }) => void
}

declare interface TaskScheduler {
  on<E extends keyof TaskSchedulerEvents>(event: E, listener: TaskSchedulerEvents[E]): this
  emit<E extends keyof TaskSchedulerEvents>(event: E, ...args: Parameters<TaskSchedulerEvents[E]>): boolean
}

class TaskScheduler extends EventEmitter {
  private tasks: Task[] = []
  private currentTask: Task | null = null
  private deviceManager?: typeof deviceManager
  private aiConfig: AIModelConfig | null = null
  private modelConfig: ModelConfig | null = null
  private agent: Agent | null = null

  setDeviceManager(manager: typeof deviceManager) {
    this.deviceManager = manager
  }

  setAIConfig(config: AIModelConfig) {
    this.aiConfig = config
  }

  setModelConfig(config: ModelConfig) {
    this.modelConfig = config
    const agentManager = getAgentManager()
    agentManager.setModelConfig(config)
  }

  getModelConfig(): ModelConfig | null {
    return this.modelConfig
  }

  /**
   * 初始化 Agent
   */
  async initializeAgent(): Promise<void> {
    const device = this.deviceManager?.getActiveDevice()
    if (!device) {
      throw new Error('No active device')
    }

    const agentManager = getAgentManager()
    agentManager.setDevice(device)

    // 优先使用 modelConfig，否则回退到 aiConfig
    if (this.modelConfig) {
      agentManager.setModelConfig(this.modelConfig)
    } else if (this.aiConfig) {
      agentManager.setAIConfig(this.aiConfig)
    } else {
      // 使用默认配置（AutoGLM-Phone）
      const defaultConfig = {
        provider: 'openai' as const,
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        apiKey: process.env.AUTOGLM_API_KEY || '',
        model: 'autoglm-phone',
        temperature: 0.7,
        maxTokens: 4096,
      }
      agentManager.setAIConfig(defaultConfig)
    }
    
    this.agent = await agentManager.createAgent()
    
    // 转发 Agent 事件
    this.agent.on('log', (log) => {
      this.emit('log', log)
      if (this.currentTask) {
        this.addLog(this.currentTask.id, log.type, log.content)
      }
    })

    this.agent.on('planning', (data) => {
      this.emit('planning', {
        thought: data.thought,
        actions: data.actions.map((a) => a.type),
      })
    })

    this.agent.on('action:start', (data) => {
      this.emit('action:start', { action: data.action })
    })

    this.agent.on('task:complete', (result) => {
      if (this.currentTask) {
        this.currentTask.result = result
      }
    })
  }

  async startTask(prompt: string): Promise<Task> {
    if (this.currentTask?.status === 'running') {
      throw new Error('Task already running')
    }

    // 确保 Agent 已初始化
    if (!this.agent) {
      await this.initializeAgent()
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      prompt,
      status: 'running',
      logs: [{
        type: 'info',
        content: `Starting AI task: ${prompt}`,
        timestamp: Date.now(),
      }],
      startTime: Date.now(),
    }

    this.tasks.unshift(task)
    this.currentTask = task
    this.emit('taskStarted', task)
    this.emit('log', { type: 'info', content: `Task started: ${prompt}` })

    // 使用 Agent 执行任务
    this.executeTaskWithAgent(task)

    return task
  }

  stopTask(taskId: string): void {
    if (this.currentTask?.id === taskId) {
      this.agent?.stop()
      this.currentTask.status = 'idle'
      this.currentTask.endTime = Date.now()
      this.addLog(taskId, 'warning', 'Task stopped by user')
      this.emit('taskCompleted', this.currentTask)
      this.currentTask = null
    }
  }

  getCurrentTask(): Task | null {
    return this.currentTask
  }

  getTasks(): Task[] {
    return [...this.tasks]
  }

  /**
   * 使用 Agent 执行任务
   */
  private async executeTaskWithAgent(task: Task) {
    try {
      if (!this.agent) {
        throw new Error('Agent not initialized')
      }

      this.emit('log', { type: 'info', content: 'AI Agent analyzing task...' })

      // 使用 Agent 的 aiAct 方法执行任务
      const result = await this.agent.aiAct(task.prompt)

      task.status = result.success ? 'completed' : 'failed'
      task.endTime = Date.now()
      task.result = result

      if (result.success) {
        this.emit('log', { type: 'success', content: result.message || 'Task completed successfully' })
      } else {
        this.emit('log', { type: 'error', content: result.message || 'Task failed' })
      }

      this.emit('taskCompleted', task)
    } catch (error) {
      task.status = 'failed'
      task.endTime = Date.now()
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.addLog(task.id, 'error', `Task failed: ${errorMsg}`)
      this.emit('taskFailed', task, errorMsg)
      this.emit('log', { type: 'error', content: `Task failed: ${errorMsg}` })
    } finally {
      this.currentTask = null
    }
  }

  private addLog(taskId: string, type: string, content: string) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      task.logs.push({ type, content, timestamp: Date.now() })
      this.emit('log', { type, content })
    }
  }

  /**
   * 销毁 Agent
   */
  destroy(): void {
    if (this.agent) {
      this.agent.stop()
      this.agent.removeAllListeners()
      this.agent = null
    }
    getAgentManager().destroyAgent()
  }
}

export const taskScheduler = new TaskScheduler()
export default taskScheduler
