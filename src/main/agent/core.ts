/**
 * Agent Core
 * AI Agent 核心实现，参考 Midscene Agent 架构
 */

import { EventEmitter } from 'events'
import type { IDeviceAdapter } from '../drivers/interface'
import type { AIService } from '../ai/service'
import { ConversationHistory } from '../ai/history'
import type { PlanResult, ActionPlan, PlanningStrategy } from './planning'

// Agent 配置
export interface AgentConfig {
  aiService?: AIService
  planningStrategy?: PlanningStrategy
  device: IDeviceAdapter
  conversationHistory?: ConversationHistory
  replanningCycleLimit?: number
  waitAfterAction?: number
  deepThink?: boolean
}

// Agent 事件
export interface AgentEvents {
  'planning': (data: { thought: string; actions: ActionPlan[] }) => void
  'action:start': (data: { action: string; param: unknown }) => void
  'action:complete': (data: { action: string; result: unknown }) => void
  'action:error': (data: { action: string; error: string }) => void
  'log': (log: { type: string; content: string }) => void
  'task:complete': (result: { success: boolean; message?: string }) => void
}

declare interface Agent {
  on<E extends keyof AgentEvents>(event: E, listener: AgentEvents[E]): this
  emit<E extends keyof AgentEvents>(event: E, ...args: Parameters<AgentEvents[E]>): boolean
}

class Agent extends EventEmitter {
  private aiService?: AIService
  private planningStrategy?: PlanningStrategy
  private device: IDeviceAdapter
  private history: ConversationHistory
  private replanningCycleLimit: number
  private waitAfterAction: number
  private isRunning = false

  constructor(config: AgentConfig) {
    super()
    this.aiService = config.aiService
    this.planningStrategy = config.planningStrategy
    this.device = config.device
    this.history = config.conversationHistory || new ConversationHistory()
    this.replanningCycleLimit = config.replanningCycleLimit || 10
    this.waitAfterAction = config.waitAfterAction || 1000
  }

  /**
   * AI 自主执行多步任务（aiAct）
   * 参考 Midscene 的 planning-execution-feedback 循环
   */
  async aiAct(taskPrompt: string): Promise<{ success: boolean; message?: string }> {
    if (this.isRunning) {
      throw new Error('Agent is already running a task')
    }

    this.isRunning = true
    this.emit('log', { type: 'info', content: `Starting task: ${taskPrompt}` })

    try {
      let replanCount = 0
      let taskCompleted = false
      let finalMessage = ''

      // 主规划循环
      while (!taskCompleted && replanCount < this.replanningCycleLimit) {
        // 1. 规划阶段
        this.emit('log', { type: 'info', content: 'Planning next actions...' })
        const planResult = await this.planningPhase(taskPrompt)

        if (planResult.shouldComplete) {
          taskCompleted = true
          finalMessage = planResult.completeMessage || 'Task completed'
          this.emit('log', { type: 'success', content: finalMessage })
          break
        }

        // 2. 执行阶段
        this.emit('planning', { 
          thought: planResult.thought, 
          actions: planResult.actions 
        })

        for (const action of planResult.actions) {
          const success = await this.executeAction(action)
          if (!success) {
            this.emit('log', { type: 'warning', content: `Action failed: ${action.type}` })
          }

          // 等待动作生效
          await this.sleep(this.waitAfterAction)
        }

        // 3. 反馈阶段
        const feedback = await this.generateFeedback()
        this.history.append({
          role: 'assistant',
          content: `Executed ${planResult.actions.length} actions. ${feedback}`,
        })

        replanCount++
      }

      const result = { success: true, message: finalMessage }
      this.emit('task:complete', result)
      return result

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.emit('log', { type: 'error', content: `Task failed: ${errorMsg}` })
      const result = { success: false, message: errorMsg }
      this.emit('task:complete', result)
      return result
    } finally {
      this.isRunning = false
    }
  }

  /**
   * 智能点击（AI 定位并点击）
   */
  async aiTap(elementDescription: string): Promise<boolean> {
    this.emit('log', { type: 'info', content: `Locating element: ${elementDescription}` })

    try {
      // 检查 aiService 是否可用
      if (!this.aiService) {
        this.emit('log', { type: 'error', content: 'AI Service not available. Use planning strategy mode instead.' })
        return false
      }

      // 1. 获取截图
      const screenshot = await this.captureScreenshot()

      // 2. 请求 AI 定位
      const prompt = `Locate the element "${elementDescription}" on the screen and provide its center coordinates in JSON format: {"x": number, "y": number}`
      
      const response = await this.aiService.chatWithImage(prompt, screenshot, this.getLocateSystemPrompt())

      // 3. 解析坐标
      const coords = this.parseCoordinates(response.content)
      if (!coords) {
        this.emit('log', { type: 'error', content: `Failed to locate element: ${elementDescription}` })
        return false
      }

      // 4. 执行点击
      this.emit('action:start', { action: 'tap', param: coords })
      await this.device.tap(coords.x, coords.y)
      this.emit('action:complete', { action: 'tap', result: coords })
      
      this.emit('log', { type: 'success', content: `Tapped on "${elementDescription}" at (${coords.x}, ${coords.y})` })
      
      // 5. 记录到历史
      this.history.append({
        role: 'assistant',
        content: `Tapped on "${elementDescription}"`,
        screenshot,
      })

      return true
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.emit('action:error', { action: 'tap', error: errorMsg })
      return false
    }
  }

  /**
   * 智能输入
   */
  async aiInput(elementDescription: string, text: string): Promise<boolean> {
    // 1. 先定位元素
    const located = await this.aiTap(elementDescription)
    if (!located) return false

    // 2. 等待元素聚焦
    await this.sleep(500)

    // 3. 输入文本
    this.emit('action:start', { action: 'type', param: text })
    await this.device.type(text)
    this.emit('action:complete', { action: 'type', result: text })

    this.emit('log', { type: 'success', content: `Input "${text}" into "${elementDescription}"` })
    return true
  }

  /**
   * 从屏幕提取信息
   */
  async aiQuery<T>(question: string): Promise<T | null> {
    if (!this.aiService) {
      this.emit('log', { type: 'error', content: 'AI Service not available for aiQuery' })
      return null
    }

    try {
      const screenshot = await this.captureScreenshot()
      const prompt = `Based on the current screen, answer the following question: ${question}. Provide the answer in a concise format.`

      const response = await this.aiService.chatWithImage(prompt, screenshot)
      
      this.history.append({
        role: 'assistant',
        content: `Query: ${question}\nAnswer: ${response.content}`,
        screenshot,
      })

      return response.content as T
    } catch (error) {
      this.emit('log', { type: 'error', content: `Query failed: ${error}` })
      return null
    }
  }

  /**
   * 断言验证
   */
  async aiAssert(assertion: string): Promise<boolean> {
    if (!this.aiService) {
      this.emit('log', { type: 'error', content: 'AI Service not available for aiAssert' })
      return false
    }

    try {
      const screenshot = await this.captureScreenshot()
      const prompt = `Verify if the following assertion is true based on the current screen: "${assertion}". Answer with only "true" or "false".`

      const response = await this.aiService.chatWithImage(prompt, screenshot)
      const result = response.content.toLowerCase().includes('true')

      this.emit('log', { 
        type: result ? 'success' : 'error', 
        content: `Assertion "${assertion}": ${result ? 'PASSED' : 'FAILED'}` 
      })

      return result
    } catch (error) {
      this.emit('log', { type: 'error', content: `Assert failed: ${error}` })
      return false
    }
  }

  /**
   * 规划阶段
   * 支持策略模式，优先使用 planningStrategy，否则回退到默认实现
   */
  private async planningPhase(taskPrompt: string): Promise<PlanResult> {
    const screenshot = await this.captureScreenshot()

    // 如果配置了规划策略，使用策略模式
    if (this.planningStrategy) {
      const context = {
        taskPrompt,
        screenshot,
        history: this.buildHistoryText(),
        subGoals: this.history.subGoalsToText(),
      }

      return this.planningStrategy.plan(context)
    }

    // 回退到默认实现（需要 aiService）
    if (!this.aiService) {
      throw new Error('Either planningStrategy or aiService must be provided')
    }

    // 构建系统提示
    const systemPrompt = this.buildPlanningSystemPrompt()

    // 构建用户提示
    const userPrompt = this.buildPlanningUserPrompt(taskPrompt)

    // 调用 AI
    const response = await this.aiService.chatWithImage(userPrompt, screenshot, systemPrompt)

    // 解析规划结果
    return this.parsePlanResponse(response.content)
  }

  /**
   * 构建历史文本
   */
  private buildHistoryText(): string {
    const messages = this.history.getMessages()
    if (messages.length === 0) return ''
    
    return messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')
  }

  /**
   * 执行单个动作
   */
  private async executeAction(action: ActionPlan): Promise<boolean> {
    try {
      this.emit('action:start', { action: action.type, param: action.param })

      switch (action.type) {
        case 'tap':
          if (action.param && typeof action.param.x === 'number' && typeof action.param.y === 'number') {
            await this.device.tap(action.param.x, action.param.y)
          }
          break
        case 'type':
          if (action.param && typeof action.param.text === 'string') {
            await this.device.type(action.param.text)
          }
          break
        case 'swipe':
          if (action.param && 
              typeof action.param.fromX === 'number' && 
              typeof action.param.fromY === 'number' &&
              typeof action.param.toX === 'number' && 
              typeof action.param.toY === 'number') {
            await this.device.swipe(
              action.param.fromX,
              action.param.fromY,
              action.param.toX,
              action.param.toY
            )
          }
          break
        case 'back':
          await this.device.back()
          break
        case 'home':
          await this.device.home()
          break
        default:
          this.emit('log', { type: 'warning', content: `Unknown action type: ${action.type}` })
          return false
      }

      this.emit('action:complete', { action: action.type, result: action.param })
      return true
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.emit('action:error', { action: action.type, error: errorMsg })
      return false
    }
  }

  /**
   * 生成反馈信息
   */
  private async generateFeedback(): Promise<string> {
    // 简单的反馈实现，后续可以根据截图对比生成更详细的反馈
    return 'Actions executed successfully.'
  }

  /**
   * 捕获截图
   */
  private async captureScreenshot(): Promise<string> {
    const buffer = await this.device.screenshot()
    return buffer.toString('base64')
  }

  /**
   * 构建规划系统提示
   */
  private buildPlanningSystemPrompt(): string {
    return `You are an AI assistant controlling an Android device. Your task is to analyze the current screen and plan the next actions to complete the user's goal.

You must respond in the following format:

<analysis>Brief analysis of the current state</analysis>
<plan>
1. Step 1 description
2. Step 2 description
...</plan>
<actions>
[
  { "type": "tap", "param": { "x": 100, "y": 200 } },
  { "type": "type", "param": { "text": "hello" } }
]
</actions>
<thought>Your reasoning for these actions</thought>
<complete>false</complete>

Action types available:
- tap: { x, y }
- type: { text }
- swipe: { fromX, fromY, toX, toY }
- back: {}
- home: {}

Set <complete>true</complete> when the task is finished.`
  }

  /**
   * 构建规划用户提示
   */
  private buildPlanningUserPrompt(taskPrompt: string): string {
    const history = this.history.getMessages()
    const subGoals = this.history.subGoalsToText()
    
    let prompt = `Task: ${taskPrompt}\n\n`
    
    if (subGoals) {
      prompt += `Sub-goals:\n${subGoals}\n\n`
    }

    if (history.length > 0) {
      prompt += `Previous actions have been taken. Analyze the current screen and plan the next steps.`
    } else {
      prompt += `This is the initial state. Analyze the screen and plan the first steps.`
    }

    return prompt
  }

  /**
   * 解析规划响应
   */
  private parsePlanResponse(content: string): PlanResult {
    // 提取 complete 标记
    const completeMatch = content.match(/<complete>(true|false)<\/complete>/i)
    const shouldComplete = completeMatch?.[1].toLowerCase() === 'true'

    // 提取 thought
    const thoughtMatch = content.match(/<thought>([\s\S]*?)<\/thought>/i)
    const thought = thoughtMatch?.[1]?.trim() || ''

    // 提取 actions JSON
    const actionsMatch = content.match(/<actions>([\s\S]*?)<\/actions>/i)
    let actions: ActionPlan[] = []

    if (actionsMatch) {
      try {
        actions = JSON.parse(actionsMatch[1].trim())
      } catch {
        // 尝试从其他格式解析
        actions = this.parseActionsFromText(content)
      }
    } else {
      actions = this.parseActionsFromText(content)
    }

    return {
      shouldComplete,
      thought,
      actions,
      completeMessage: shouldComplete ? thought : undefined,
    }
  }

  /**
   * 从文本解析动作
   */
  private parseActionsFromText(content: string): ActionPlan[] {
    const actions: ActionPlan[] = []

    // 尝试匹配常见的动作描述
    const tapMatch = content.match(/click|tap.*?(\d+)[,\s]+(\d+)/i)
    if (tapMatch) {
      actions.push({
        type: 'tap',
        param: { x: parseInt(tapMatch[1]), y: parseInt(tapMatch[2]) },
      })
    }

    return actions
  }

  /**
   * 解析坐标
   */
  private parseCoordinates(content: string): { x: number; y: number } | null {
    try {
      const jsonMatch = content.match(/{[^}]+}/)
      if (jsonMatch) {
        const coords = JSON.parse(jsonMatch[0])
        if (typeof coords.x === 'number' && typeof coords.y === 'number') {
          return coords
        }
      }
    } catch {
      // 尝试正则匹配
      const match = content.match(/(\d+)[,\s]+(\d+)/)
      if (match) {
        return { x: parseInt(match[1]), y: parseInt(match[2]) }
      }
    }
    return null
  }

  /**
   * 获取定位系统提示
   */
  private getLocateSystemPrompt(): string {
    return `You are an expert at locating UI elements on mobile screens. 
Given a description of an element, you must identify its center coordinates on the screen.

Respond in JSON format: {"x": number, "y": number}

The coordinates should be in pixels relative to the screenshot dimensions.`
  }

  /**
   * 辅助方法：延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 获取当前运行状态
   */
  isTaskRunning(): boolean {
    return this.isRunning
  }

  /**
   * 停止当前任务
   */
  stop(): void {
    this.isRunning = false
    this.emit('log', { type: 'warning', content: 'Task stopped by user' })
  }
}

export default Agent
