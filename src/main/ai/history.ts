/**
 * Conversation History Manager
 * 管理多轮对话历史，支持截图缓存和上下文压缩
 */

import type { ChatMessage } from './service'

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  screenshot?: string  // Base64 截图
  timestamp: number
}

export interface SubGoal {
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export class ConversationHistory {
  private messages: ConversationMessage[] = []
  private subGoals: SubGoal[] = []
  private memories: string[] = []
  private maxScreenshots = 5  // 最大保留截图数量
  private maxMessages = 20    // 最大消息数量

  /**
   * 添加消息
   */
  append(message: Omit<ConversationMessage, 'timestamp'>): void {
    this.messages.push({
      ...message,
      timestamp: Date.now(),
    })

    // 如果消息包含截图，进行压缩
    if (message.screenshot) {
      this.compressScreenshots()
    }

    // 如果消息数量过多，进行压缩
    if (this.messages.length > this.maxMessages) {
      this.compressHistory()
    }
  }

  /**
   * 获取历史快照（用于 AI 调用）
   */
  snapshot(): ChatMessage[] {
    const result: ChatMessage[] = []

    for (const msg of this.messages) {
      if (msg.screenshot) {
        // 多模态消息
        result.push({
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${msg.screenshot}`,
              },
            },
          ],
        })
      } else {
        // 纯文本消息
        result.push({
          role: msg.role,
          content: msg.content,
        })
      }
    }

    return result
  }

  /**
   * 设置子目标
   */
  setSubGoals(goals: string[]): void {
    this.subGoals = goals.map((desc) => ({
      description: desc,
      status: 'pending',
    }))
  }

  /**
   * 标记子目标完成
   */
  markSubGoalFinished(index: number): void {
    if (index >= 0 && index < this.subGoals.length) {
      this.subGoals[index].status = 'completed'
    }
  }

  /**
   * 标记子目标进行中
   */
  markSubGoalRunning(index: number): void {
    if (index >= 0 && index < this.subGoals.length) {
      this.subGoals[index].status = 'running'
    }
  }

  /**
   * 子目标转为文本
   */
  subGoalsToText(): string {
    return this.subGoals
      .map((goal, i) => {
        const status = goal.status === 'completed' ? '✓' : 
                      goal.status === 'running' ? '▶' : '○'
        return `${status} ${i + 1}. ${goal.description}`
      })
      .join('\n')
  }

  /**
   * 添加记忆
   */
  addMemory(memory: string): void {
    this.memories.push(memory)
    // 只保留最近 10 条记忆
    if (this.memories.length > 10) {
      this.memories.shift()
    }
  }

  /**
   * 记忆转为文本
   */
  memoriesToText(): string {
    return this.memories.join('\n')
  }

  /**
   * 压缩截图：只保留最近的 N 张
   */
  private compressScreenshots(): void {
    const screenshotsWithIndex = this.messages
      .map((msg, index) => ({ msg, index }))
      .filter(({ msg }) => msg.screenshot)

    if (screenshotsWithIndex.length <= this.maxScreenshots) {
      return
    }

    // 删除最老的截图（保留最近的几张）
    const toRemove = screenshotsWithIndex.length - this.maxScreenshots
    for (let i = 0; i < toRemove; i++) {
      const { index } = screenshotsWithIndex[i]
      delete this.messages[index].screenshot
    }
  }

  /**
   * 压缩历史：当消息过多时，合并旧消息
   */
  private compressHistory(): void {
    // 保留最近的消息，将旧消息合并为摘要
    const keepCount = Math.floor(this.maxMessages / 2)
    const toSummarize = this.messages.slice(0, -keepCount)
    
    // 创建摘要消息
    const summary: ConversationMessage = {
      role: 'system',
      content: `[Previous ${toSummarize.length} messages summarized]`,
      timestamp: Date.now(),
    }

    // 保留最近的消息
    const recent = this.messages.slice(-keepCount)
    
    this.messages = [summary, ...recent]
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.messages = []
    this.subGoals = []
    this.memories = []
  }

  /**
   * 获取原始消息列表
   */
  getMessages(): ConversationMessage[] {
    return [...this.messages]
  }

  /**
   * 获取子目标
   */
  getSubGoals(): SubGoal[] {
    return [...this.subGoals]
  }
}

export default ConversationHistory
