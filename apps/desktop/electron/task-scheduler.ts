import { createAgentFromEnv } from '@omni/core'
import type { IDeviceAdapter } from '@omni/drivers-interface'
import type { TaskLogPayload, TaskStatePayload } from '@omni/shared'

type SchedulerCallbacks = {
  onLog: (payload: TaskLogPayload) => void
  onState: (payload: TaskStatePayload) => void
}

export class TaskScheduler {
  private running = false
  private stopRequested = false
  private startedAt = 0
  private agent: ReturnType<typeof createAgentFromEnv>

  constructor(
    private adapter: IDeviceAdapter,
    private callbacks: SchedulerCallbacks,
  ) {
    this.agent = createAgentFromEnv(this.adapter)
  }

  resetAgent() {
    this.agent = createAgentFromEnv(this.adapter)
  }

  stop() {
    if (!this.running) {
      this.callbacks.onLog({
        type: 'info',
        content: '当前没有执行中的任务',
      })
      return
    }

    this.stopRequested = true
    this.running = false
    this.callbacks.onLog({
      type: 'info',
      content: '已请求停止：当前步骤可能仍在执行',
    })
    this.callbacks.onState({
      status: 'error',
      startedAt: this.startedAt || Date.now(),
      finishedAt: Date.now(),
    })
  }

  async start(instruction: string, deviceId: string) {
    if (this.running) {
      this.callbacks.onLog({
        type: 'error',
        content: '已有任务在执行，请先停止或等待完成',
      })
      return
    }

    if (!process.env.Omni_MODEL_NAME || !process.env.Omni_OPENAI_API_KEY) {
      this.callbacks.onLog({
        type: 'error',
        content: '模型配置缺失：请检查 .env 中 Omni_MODEL_NAME / Omni_OPENAI_API_KEY',
      })
      return
    }

    this.startedAt = Date.now()
    this.stopRequested = false
    this.running = true
    this.callbacks.onState({
      status: 'running',
      startedAt: this.startedAt,
    })
    this.callbacks.onLog({
      type: 'thought',
      content: `收到任务: ${instruction} (device=${deviceId || 'default'})`,
    })

    try {
      await this.agent.aiAct(instruction)
      if (this.stopRequested) return
      this.callbacks.onLog({
        type: 'info',
        content: '任务完成 (Omni)',
      })
      this.callbacks.onState({
        status: 'success',
        startedAt: this.startedAt,
        finishedAt: Date.now(),
      })
    } catch (e: any) {
      if (this.stopRequested) return
      this.callbacks.onLog({
        type: 'error',
        content: `任务失败: ${e?.message || e}`,
      })
      this.callbacks.onState({
        status: 'error',
        startedAt: this.startedAt,
        finishedAt: Date.now(),
      })
    } finally {
      this.running = false
      this.stopRequested = false
    }
  }
}
