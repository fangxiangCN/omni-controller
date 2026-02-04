export type SchedulerStatus = 'idle' | 'running' | 'stopped' | 'error';

export interface AgentScheduler {
  status: SchedulerStatus;
  start(instruction: string, deviceId: string): Promise<void>;
  stop(): Promise<void>;
}

export class NoopScheduler implements AgentScheduler {
  status: SchedulerStatus = 'idle';
  async start(_instruction: string, _deviceId: string) {
    this.status = 'running';
  }
  async stop() {
    this.status = 'stopped';
  }
}
