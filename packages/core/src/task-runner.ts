export interface TaskRunner {
  start(instruction: string, deviceId: string): Promise<void>;
  stop(): Promise<void>;
}
