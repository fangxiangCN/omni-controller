/**
 * AI Service Layer
 * 封装 AI 模型调用，支持多种模型提供商
 */

import OpenAI from 'openai'
import { z } from 'zod'

// AI 模型配置
export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'custom'
  baseUrl: string
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

// 消息类型
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | ChatMessageContent[]
}

// 多模态消息内容
export type ChatMessageContent = 
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

// AI 调用结果
export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  timing?: {
    start: number
    end: number
    cost: number
  }
}

// 默认配置
const defaultConfig: Partial<AIModelConfig> = {
  temperature: 0.7,
  maxTokens: 4096,
}

export class AIService {
  private client: OpenAI
  private config: AIModelConfig

  constructor(config: AIModelConfig) {
    this.config = { ...defaultConfig, ...config }
    this.client = new OpenAI({
      baseURL: this.config.baseUrl,
      apiKey: this.config.apiKey,
    })
  }

  /**
   * 发送聊天请求
   */
  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages as any,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      })

      const endTime = Date.now()
      const content = response.choices[0]?.message?.content || ''

      return {
        content,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        timing: {
          start: startTime,
          end: endTime,
          cost: endTime - startTime,
        },
      }
    } catch (error) {
      console.error('AI Service error:', error)
      throw error
    }
  }

  /**
   * 带截图的聊天请求（多模态）
   */
  async chatWithImage(
    text: string, 
    imageBase64: string,
    systemPrompt?: string
  ): Promise<AIResponse> {
    const messages: ChatMessage[] = []

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      })
    }

    messages.push({
      role: 'user',
      content: [
        { type: 'text', text },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${imageBase64}`,
          },
        },
      ],
    })

    return this.chat(messages)
  }

  /**
   * 解析结构化响应（使用 Zod）
   */
  async parseResponse<T extends z.ZodType>(
    response: string,
    schema: T
  ): Promise<z.infer<T>> {
    try {
      // 尝试直接解析 JSON
      const jsonMatch = response.match(/```json\n?([\s\S]*?)```/) ||
                       response.match(/{[\s\S]*}/)
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        const parsed = JSON.parse(jsonStr.trim())
        return schema.parse(parsed)
      }

      // 如果无法解析，尝试从 XML 标签提取
      const extracted = this.extractFromXML(response)
      return schema.parse(extracted)
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      console.error('Response:', response)
      throw new Error(`Failed to parse AI response: ${error}`)
    }
  }

  /**
   * 从 XML 标签提取数据
   */
  private extractFromXML(response: string): Record<string, string> {
    const result: Record<string, string> = {}
    
    // 匹配常见的 XML 标签
    const tags = ['action', 'thought', 'plan', 'complete', 'param', 'locate']
    
    for (const tag of tags) {
      const regex = new RegExp(`<${tag}[\s\S]*?>([\s\S]*?)<\/${tag}>`, 'i')
      const match = response.match(regex)
      if (match) {
        result[tag] = match[1].trim()
      }
    }

    return result
  }

  /**
   * 提取 XML 标签内容
   */
  static extractXMLTag(response: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`, 'i')
    const match = response.match(regex)
    return match ? match[1].trim() : null
  }

  /**
   * 提取所有 XML 标签
   */
  static extractAllXMLTags(response: string): Record<string, string> {
    const result: Record<string, string> = {}
    const regex = /<(\w+)>([\s\S]*?)<\/\1>/g
    let match

    while ((match = regex.exec(response)) !== null) {
      result[match[1]] = match[2].trim()
    }

    return result
  }
}

export default AIService
