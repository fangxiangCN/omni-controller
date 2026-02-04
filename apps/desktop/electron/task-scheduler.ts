import { createAgentFromEnv } from '@omni/core'
import type { IDeviceAdapter } from '@omni/drivers-interface'
import type { TaskLogPayload, TaskStatePayload } from '@omni/shared'

type SchedulerCallbacks = {
  onLog: (payload: TaskLogPayload) => void
  onState: (payload: TaskStatePayload) => void
}

export class TaskScheduler {
  private running = false
  private agent = createAgentFromEnv(this.adapter)

  constructor(
    private adapter: IDeviceAdapter,
    private callbacks: SchedulerCallbacks,
  ) {}

  resetAgent() {
    this.agent = createAgentFromEnv(this.adapter)
  }

  async start(instruction: string, deviceId: string) {
    if (this.running) {
      this.callbacks.onLog({
        type: 'error',
        content: '已有任务在执行，请先停止或等待完成',
      })
      return
    }

    if (!process.env.MIDSCENE_MODEL_NAME || !process.env.MIDSCENE_OPENAI_API_KEY) {
      this.callbacks.onLog({
        type: 'error',
        content: '模型配置缺失: 请检查 .env 中 MIDSCENE_MODEL_NAME / MIDSCENE_OPENAI_API_KEY',
      })
      return
    }

    const startedAt = Date.now()
    this.running = true
    this.callbacks.onState({
      status: 'running',
      startedAt,
    })
    this.callbacks.onLog({
      type: 'thought',
      content: `收到任务: ${instruction} (device=${deviceId || 'default'})`,
    })

    try {
      await this.agent.aiAct(instruction)
      this.callbacks.onLog({
        type: 'info',
        content: '任务完成 (Midscene)',
      })
      this.callbacks.onState({
        status: 'success',
        startedAt,
        finishedAt: Date.now(),
      })
    } catch (e: any) {
      this.callbacks.onLog({
        type: 'error',
        content: `任务失败: ${e?.message || e}`,
      })
      this.callbacks.onState({
        status: 'error',
        startedAt,
        finishedAt: Date.now(),
      })
    } finally {
      this.running = false
    }
  }
}
