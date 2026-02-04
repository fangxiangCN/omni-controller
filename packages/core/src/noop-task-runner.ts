import type { TaskRunner } from './task-runner'
import { NoopScheduler } from './scheduler'

export class NoopTaskRunner implements TaskRunner {
  private scheduler = new NoopScheduler()
  async start(_instruction: string, _deviceId: string) {
    await this.scheduler.start(_instruction, _deviceId)
  }
  async stop() {
    await this.scheduler.stop()
  }
}
