export type TaskLogType = 'thought' | 'plan' | 'action' | 'error' | 'info';

export type TaskLog = {
  type: TaskLogType;
  content: string;
};
