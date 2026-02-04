export enum IpcChannels {
  // Renderer -> Main
  START_TASK = 'task:start',
  STOP_TASK = 'task:stop',

  // Main -> Renderer
  DEVICE_UPDATE = 'device:list',
  TASK_LOG = 'task:log',
  DEVICE_FRAME = 'device:frame',
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
