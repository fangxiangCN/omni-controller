/**
 * Agent Manager
 * 管理 Agent 实例的生命周期，支持多模型切换
 */

import { EventEmitter } from 'events'
import Agent from './core'
import type { AgentConfig } from './core'
import type { IDeviceAdapter } from '../drivers/interface'
import { AIService } from '../ai/service'
import type { AIModelConfig } from '../ai/service'
import { PlanningStrategyFactory, ModelConfig, ModelType } from './strategies'
import type { PlanningStrategy } from './planning'

export interface AgentManagerEvents {
  'agent:created': (agent: Agent) => void
  'agent:destroyed': () => void
  'agent:error': (error: Error) => void
  'model:changed': (modelType: ModelType) => void
}

declare interface AgentManager {
  on<E extends keyof AgentManagerEvents>(event: E, listener: AgentManagerEvents[E]): this
  emit<E extends keyof AgentManagerEvents>(event: E, ...args: Parameters<AgentManagerEvents[E]>): boolean
}

class AgentManager extends EventEmitter {
  private currentAgent: Agent | null = null
  private device: IDeviceAdapter | null = null
  private aiConfig: AIModelConfig | null = null
  private currentModelConfig: ModelConfig | null = null
  private currentStrategy: PlanningStrategy | null = null

  /**
   * 设置设备
   */
  setDevice(device: IDeviceAdapter): void {
    this.device = device
  }

  /**
   * 设置 AI 配置（传统方式）
   */
  setAIConfig(config: AIModelConfig): void {
    this.aiConfig = config
    this.currentModelConfig = null
    this.currentStrategy = null
  }

  /**
   * 设置模型配置（新方式，支持多模型）
   */
  setModelConfig(config: ModelConfig): void {
    this.currentModelConfig = config
    this.currentStrategy = PlanningStrategyFactory.createStrategy(config)
    
    // 同步设置 aiConfig 用于兼容性
    this.aiConfig = {
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
    }

    this.emit('model:changed', config.type)
  }

  /**
   * 获取当前模型配置
   */
  getModelConfig(): ModelConfig | null {
    return this.currentModelConfig
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): ModelConfig[] {
    return PlanningStrategyFactory.getAvailableModels()
  }

  /**
   * 创建 Agent 实例
   */
  async createAgent(): Promise<Agent> {
    if (!this.device) {
      throw new Error('Device not set. Call setDevice() first.')
    }

    // 如果已有 Agent，先销毁
    if (this.currentAgent) {
      this.destroyAgent()
    }

    try {
      const { ConversationHistory } = await import('../ai/history')
      const history = new ConversationHistory()

      let agentConfig: AgentConfig = {
        device: this.device,
        conversationHistory: history,
        replanningCycleLimit: 10,
        waitAfterAction: 1000,
      }

      // 优先使用策略模式
      if (this.currentStrategy) {
        agentConfig.planningStrategy = this.currentStrategy
      } else if (this.aiConfig) {
        // 回退到传统方式
        agentConfig.aiService = new AIService(this.aiConfig)
      } else {
        throw new Error('Model configuration not set. Call setModelConfig() or setAIConfig() first.')
      }

      const agent = new Agent(agentConfig)

      this.currentAgent = agent
      this.emit('agent:created', agent)

      return agent
    } catch (error) {
      this.emit('agent:error', error as Error)
      throw error
    }
  }

  /**
   * 获取当前 Agent
   */
  getAgent(): Agent | null {
    return this.currentAgent
  }

  /**
   * 销毁 Agent
   */
  destroyAgent(): void {
    if (this.currentAgent) {
      this.currentAgent.stop()
      this.currentAgent.removeAllListeners()
      this.currentAgent = null
      this.emit('agent:destroyed')
    }
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.currentAgent !== null
  }
}

// 单例实例
let instance: AgentManager | null = null

export function getAgentManager(): AgentManager {
  if (!instance) {
    instance = new AgentManager()
  }
  return instance
}

export function resetAgentManager(): void {
  if (instance) {
    instance.destroyAgent()
    instance = null
  }
}

export default AgentManager
