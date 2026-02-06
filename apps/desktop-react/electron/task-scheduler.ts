import { EventEmitter } from 'node:events'
import type { AgentLike } from '@omni/core'
import type { ExecutionDump } from '@omni/core'
import type { TaskLogPayload, TaskStatePayload } from '@omni/shared'

type TaskSchedulerEvents = {
  log: (payload: TaskLogPayload) => void
  state: (payload: TaskStatePayload) => void
  report: (payload: { html: string | null; title: string }) => void
}

export type AgentWithDumpListener = AgentLike & {
  addDumpUpdateListener?: (
    listener: (dump: string, executionDump?: ExecutionDump) => void,
  ) => () => void
  reportHTMLString?: (opt?: { inlineScreenshots?: boolean }) => string
}

function summarizeTask(task: any) {
  const title = task.subType || task.type || 'Task'
  let detail = ''
  if (task?.param?.userInstruction) detail = task.param.userInstruction
  if (!detail && task?.param?.locate?.prompt?.prompt) {
    detail = task.param.locate.prompt.prompt
  }
  if (!detail && task?.param?.locate?.prompt) detail = task.param.locate.prompt
  if (!detail && typeof task?.param?.value === 'string') detail = task.param.value
  if (!detail && typeof task?.thought === 'string') detail = task.thought
  if (!detail && typeof task?.param === 'string') detail = task.param
  return detail ? `${title} · ${detail}` : title
}

export class TaskScheduler extends EventEmitter {
  private running = false
  private aborted = false
  private lastTaskId = ''

  constructor(private getAgent: () => Promise<AgentWithDumpListener>) {
    super()
  }

  isRunning() {
    return this.running
  }

  stop() {
    if (!this.running) return
    this.aborted = true
    this.emit('log', {
      type: 'info',
      content: 'Stop requested. Current task will finish if already running.',
    } satisfies TaskLogPayload)
    this.emit('state', {
      status: 'idle',
      finishedAt: Date.now(),
    } satisfies TaskStatePayload)
  }

  async run(instruction: string) {
    if (this.running) {
      this.emit('log', {
        type: 'info',
        content: 'Task already running. Please stop it first.',
      } satisfies TaskLogPayload)
      return
    }
    if (!instruction.trim()) {
      this.emit('log', {
        type: 'error',
        content: 'Instruction is empty.',
      } satisfies TaskLogPayload)
      return
    }

    this.running = true
    this.aborted = false
    this.lastTaskId = ''
    this.emit('state', {
      status: 'running',
      startedAt: Date.now(),
    } satisfies TaskStatePayload)
    const title = instruction.split('\n')[0].slice(0, 80)
    this.emit('log', {
      type: 'info',
      content: `Task started: ${instruction}`,
    } satisfies TaskLogPayload)

    let removeDumpListener: (() => void) | undefined
    let agent: AgentWithDumpListener | undefined

    try {
      agent = await this.getAgent()
      if (agent?.addDumpUpdateListener) {
        removeDumpListener = agent.addDumpUpdateListener(
          (_dump, executionDump) => {
            const tasks = executionDump?.tasks || []
            const last = tasks[tasks.length - 1]
            if (!last || last.taskId === this.lastTaskId) return
            this.lastTaskId = last.taskId
            const type =
              last.type === 'Planning'
                ? 'plan'
                : last.type === 'Insight'
                  ? 'thought'
                  : last.type === 'Action Space'
                    ? 'action'
                    : 'info'
            this.emit('log', {
              type,
              content: summarizeTask(last),
              taskId: last.taskId,
            } satisfies TaskLogPayload)
          },
        )
      }

      const result = await agent.aiAct(instruction)
      if (!this.aborted) {
        this.emit('log', {
          type: 'info',
          content: result ? `Task finished: ${result}` : 'Task finished.',
        } satisfies TaskLogPayload)
        this.emit('state', {
          status: 'success',
          finishedAt: Date.now(),
        } satisfies TaskStatePayload)
      }
    } catch (error: any) {
      if (!this.aborted) {
        this.emit('log', {
          type: 'error',
          content: error?.message || 'Task failed.',
        } satisfies TaskLogPayload)
        this.emit('state', {
          status: 'error',
          finishedAt: Date.now(),
        } satisfies TaskStatePayload)
      }
    } finally {
      if (removeDumpListener) removeDumpListener()
      if (agent?.reportHTMLString && !this.aborted) {
        const html = agent.reportHTMLString({ inlineScreenshots: true })
        this.emit('report', { html, title })
      }
      this.running = false
    }
  }
}
