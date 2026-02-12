/**
 * Multi-Model Planning Strategies
 * 基于 Midscene 架构的多模型规划策略实现
 */

import { PlanningStrategy, PlanningContext, PlanResult, ActionPlan } from './planning'
import AIService from '../ai/service'

// 模型类型
export type ModelType = 'autoglm-phone' | 'gpt-4v' | 'claude-3-opus' | 'claude-3-sonnet' | 'custom'

// 模型配置
export interface ModelConfig {
  type: ModelType
  name: string
  provider: 'openai' | 'anthropic' | 'custom'
  baseUrl: string
  apiKey: string
  model: string
  description?: string
  capabilities: {
    vision: boolean
    planning: boolean
    action: boolean
  }
}

// 预定义模型配置
export const PREDEFINED_MODELS: Record<string, ModelConfig> = {
  'autoglm-phone': {
    type: 'autoglm-phone',
    name: 'AutoGLM-Phone',
    provider: 'openai',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: '',
    model: 'autoglm-phone',
    description: '智谱AI AutoGLM-Phone 专为移动设备控制优化',
    capabilities: { vision: true, planning: true, action: true },
  },
  'gpt-4v': {
    type: 'gpt-4v',
    name: 'GPT-4 Vision',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4-vision-preview',
    description: 'OpenAI GPT-4 with vision capabilities',
    capabilities: { vision: true, planning: true, action: true },
  },
  'claude-3-opus': {
    type: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    apiKey: '',
    model: 'claude-3-opus-20240229',
    description: 'Anthropic Claude 3 Opus with vision',
    capabilities: { vision: true, planning: true, action: true },
  },
  'claude-3-sonnet': {
    type: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    apiKey: '',
    model: 'claude-3-sonnet-20240229',
    description: 'Anthropic Claude 3 Sonnet (faster)',
    capabilities: { vision: true, planning: true, action: true },
  },
}

// 基础规划策略
export abstract class BasePlanningStrategy implements PlanningStrategy {
  abstract name: string
  protected aiService: AIService
  protected config: ModelConfig

  constructor(config: ModelConfig) {
    this.config = config
    this.aiService = new AIService({
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      temperature: 0.7,
      maxTokens: 4096,
    })
  }

  abstract plan(context: PlanningContext): Promise<PlanResult>

  // 通用的解析方法
  protected parseActionsFromText(text: string): ActionPlan[] {
    const actions: ActionPlan[] = []
    
    // 匹配 JSON 格式的动作
    const jsonMatch = text.match(/```json\n?([\s\S]*?)```/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1])
        if (Array.isArray(parsed)) {
          return parsed.map(a => ({
            type: a.type,
            param: a.param || {},
            description: a.description,
          }))
        }
      } catch (e) {
        // JSON 解析失败，继续文本解析
      }
    }

    // 从 XML 标签提取
    const extracted = AIService.extractAllXMLTags(text)
    
    if (extracted.action) {
      actions.push({
        type: this.normalizeActionType(extracted.action),
        param: extracted.param ? JSON.parse(extracted.param) : {},
        description: extracted.description || extracted.action,
      })
    }

    return actions
  }

  // 规范化动作类型
  protected normalizeActionType(action: string): ActionPlan['type'] {
    const normalized = action.toLowerCase().trim()
    const validTypes: ActionPlan['type'][] = ['tap', 'type', 'swipe', 'back', 'home', 'longPress']
    
    if (validTypes.includes(normalized as ActionPlan['type'])) {
      return normalized as ActionPlan['type']
    }
    
    // 映射常见的变体
    if (normalized.includes('click') || normalized.includes('tap')) return 'tap'
    if (normalized.includes('type') || normalized.includes('input')) return 'type'
    if (normalized.includes('swipe') || normalized.includes('scroll')) return 'swipe'
    if (normalized.includes('back')) return 'back'
    if (normalized.includes('home')) return 'home'
    if (normalized.includes('long') || normalized.includes('press')) return 'longPress'
    
    return 'tap' // 默认
  }

  // 检查是否完成任务
  protected shouldComplete(text: string): boolean {
    const lowerText = text.toLowerCase()
    return lowerText.includes('complete') || 
           lowerText.includes('done') || 
           lowerText.includes('finish') ||
           lowerText.includes('成功') ||
           lowerText.includes('完成')
  }

  // 提取思考过程
  protected extractThought(text: string): string {
    const extracted = AIService.extractAllXMLTags(text)
    return extracted.thought || 
           extracted.think || 
           extracted.reasoning || 
           text.split('\n')[0] || 
           'Processing...'
  }
}

// AutoGLM-Phone 规划策略
export class AutoGLMPlanningStrategy extends BasePlanningStrategy {
  name = 'AutoGLM-Phone'

  async plan(context: PlanningContext): Promise<PlanResult> {
    const systemPrompt = `You are AutoGLM-Phone, an AI assistant that controls Android devices.
Analyze the screenshot and execute the task step by step.
Respond in XML format:
<think>Your reasoning</think>
<action>The action to take</action>
<param>JSON parameters for the action</param>
<complete>true/false</complete>

Available actions: tap, type, swipe, back, home, longPress`

    const userPrompt = `Task: ${context.taskPrompt}
${context.subGoals ? `Sub-goals: ${context.subGoals}` : ''}
${context.memories ? `Previous actions: ${context.memories}` : ''}`

    const response = await this.aiService.chatWithImage(
      userPrompt,
      context.screenshot,
      systemPrompt
    )

    const extracted = AIService.extractAllXMLTags(response.content)
    
    return {
      shouldComplete: extracted.complete === 'true' || this.shouldComplete(response.content),
      thought: extracted.think || this.extractThought(response.content),
      actions: this.parseActionsFromText(response.content),
      completeMessage: extracted.answer || extracted.complete || undefined,
    }
  }
}

// GPT-4V 规划策略
export class GPT4VPlanningStrategy extends BasePlanningStrategy {
  name = 'GPT-4V'

  async plan(context: PlanningContext): Promise<PlanResult> {
    const systemPrompt = `You are an AI assistant controlling an Android device. Analyze the screenshot and provide step-by-step instructions.

Respond in JSON format:
{
  "thought": "Your reasoning about the current state and next action",
  "actions": [
    {
      "type": "tap|type|swipe|back|home|longPress",
      "param": { "x": number, "y": number, "text": "string", etc },
      "description": "Human readable description"
    }
  ],
  "shouldComplete": boolean,
  "message": "Completion message if shouldComplete is true"
}

Coordinates: x and y are percentages (0-100) of screen width/height.
Be precise with element locations.`

    const userPrompt = `Execute this task: ${context.taskPrompt}

${context.subGoals ? `Break this down into steps: ${context.subGoals}` : ''}

${context.memories ? `History: ${context.memories}` : ''}

Analyze the current screenshot and provide the next action(s).`

    const response = await this.aiService.chatWithImage(
      userPrompt,
      context.screenshot,
      systemPrompt
    )

    try {
      // Try to parse as JSON
      const jsonMatch = response.content.match(/```json\n?([\s\S]*?)```/) ||
                       response.content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0])
        
        return {
          shouldComplete: parsed.shouldComplete || false,
          thought: parsed.thought || 'Processing...',
          actions: parsed.actions?.map((a: any) => ({
            type: this.normalizeActionType(a.type),
            param: a.param || {},
            description: a.description || a.type,
          })) || [],
          completeMessage: parsed.message,
        }
      }
    } catch (e) {
      console.error('Failed to parse GPT-4V response as JSON:', e)
    }

    // Fallback to XML parsing
    return {
      shouldComplete: this.shouldComplete(response.content),
      thought: this.extractThought(response.content),
      actions: this.parseActionsFromText(response.content),
    }
  }
}

// Claude 规划策略
export class ClaudePlanningStrategy extends BasePlanningStrategy {
  name = 'Claude'

  async plan(context: PlanningContext): Promise<PlanResult> {
    const systemPrompt = `You are Claude, an AI assistant helping control an Android device.

Look at the screenshot and determine the best next action(s) to complete the task.

Respond using this XML format:
<thinking>
Your analysis of the current screen state and what needs to be done.
</thinking>

<plan>
<action type="tap|type|swipe|back|home|longPress">
<description>What this action does</description>
<coordinates x="50" y="50"/> <!-- Use percentages 0-100 -->
<!-- Additional parameters as needed -->
</action>
</plan>

<status>continue|complete</status>
<message>Completion message if status is complete</message>

Be precise with coordinates. Use percentages (0-100) for x and y.`

    const userPrompt = `Task: ${context.taskPrompt}

${context.subGoals ? `Steps to complete: ${context.subGoals}` : ''}
${context.memories ? `What I've done so far: ${context.memories}` : ''}

What should I do next based on the current screen?`

    const response = await this.aiService.chatWithImage(
      userPrompt,
      context.screenshot,
      systemPrompt
    )

    const extracted = AIService.extractAllXMLTags(response.content)
    const status = extracted.status?.toLowerCase() || ''
    
    return {
      shouldComplete: status === 'complete' || this.shouldComplete(response.content),
      thought: extracted.thinking || extracted.thought || this.extractThought(response.content),
      actions: this.parseActionsFromText(response.content),
      completeMessage: extracted.message,
    }
  }
}

// 策略工厂
export class PlanningStrategyFactory {
  static createStrategy(config: ModelConfig): PlanningStrategy {
    switch (config.type) {
      case 'autoglm-phone':
        return new AutoGLMPlanningStrategy(config)
      case 'gpt-4v':
        return new GPT4VPlanningStrategy(config)
      case 'claude-3-opus':
      case 'claude-3-sonnet':
        return new ClaudePlanningStrategy(config)
      default:
        // 默认使用 GPT-4V 策略
        return new GPT4VPlanningStrategy(config)
    }
  }

  static getAvailableModels(): ModelConfig[] {
    return Object.values(PREDEFINED_MODELS)
  }
}

export default PlanningStrategyFactory
