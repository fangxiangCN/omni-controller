export enum IpcChannels {
  // Renderer -> Main
  START_TASK = 'task:start',
  STOP_TASK = 'task:stop',
  DEVICE_SELECT = 'device:select',

  // Main -> Renderer
  DEVICE_UPDATE = 'device:list',
  TASK_LOG = 'task:log',
  DEVICE_FRAME = 'device:frame',
  TASK_STATE = 'task:state',
}

export type TaskStartPayload = {
  instruction: string;
  deviceId: string;
};

export type TaskLogPayload = {
  type: 'thought' | 'plan' | 'action' | 'error' | 'info';
  content: string;
};

export type DeviceFramePayload = {
  deviceId: string;
  format: 'h264' | 'jpeg';
  data: Uint8Array;
};

export type DeviceListPayload = {
  devices: Array<{
    id: string;
    name: string;
    type: 'android' | 'ohos' | 'web';
  }>;
};

export type TaskStatePayload = {
  status: 'idle' | 'running' | 'success' | 'error';
  startedAt?: number;
  finishedAt?: number;
};

export const IPC_DEVICE_LIST = IpcChannels.DEVICE_UPDATE;
export const IPC_TASK_LOG = IpcChannels.TASK_LOG;
export const IPC_START_TASK = IpcChannels.START_TASK;
export const IPC_STOP_TASK = IpcChannels.STOP_TASK;
export const IPC_DEVICE_FRAME = IpcChannels.DEVICE_FRAME;
export const IPC_TASK_STATE = IpcChannels.TASK_STATE;
export const IPC_DEVICE_SELECT = IpcChannels.DEVICE_SELECT;

