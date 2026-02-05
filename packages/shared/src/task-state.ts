export type TaskStatus = 'idle' | 'running' | 'success' | 'error';

export type TaskState = {
  status: TaskStatus;
  startedAt?: number;
  finishedAt?: number;
};

