export enum IpcChannels {
  // Renderer -> Main
  START_TASK = 'task:start',
  STOP_TASK = 'task:stop',
  DEVICE_SELECT = 'device:select',
  DEVICE_REFRESH = 'device:refresh',
  DEVICE_DISCONNECT = 'device:disconnect',

  // Main -> Renderer
  DEVICE_UPDATE = 'device:list',
  TASK_LOG = 'task:log',
  DEVICE_FRAME = 'device:frame',
  TASK_STATE = 'task:state',
  REPORT_UPDATE = 'report:update',
  REPORT_LIST = 'report:list',
  REPORT_SELECT = 'report:select',
  REPORT_DELETE = 'report:delete',
  WINDOW_MINIMIZE = 'window:minimize',
  WINDOW_TOGGLE_MAXIMIZE = 'window:toggle-maximize',
  WINDOW_CLOSE = 'window:close',
  WINDOW_STATE = 'window:state',
}

export type TaskStartPayload = {
  instruction: string;
  deviceId: string;
};

export type TaskLogPayload = {
  type: 'thought' | 'plan' | 'action' | 'error' | 'info';
  content: string;
  taskId?: string;
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

export type ReportPayload = {
  html: string | null;
  title?: string;
  id?: string;
  path?: string;
};

export type ReportListPayload = {
  reports: Array<{
    id: string;
    title: string;
    path: string;
    createdAt: number;
  }>;
};

export const IPC_DEVICE_LIST = IpcChannels.DEVICE_UPDATE;
export const IPC_TASK_LOG = IpcChannels.TASK_LOG;
export const IPC_START_TASK = IpcChannels.START_TASK;
export const IPC_STOP_TASK = IpcChannels.STOP_TASK;
export const IPC_DEVICE_FRAME = IpcChannels.DEVICE_FRAME;
export const IPC_TASK_STATE = IpcChannels.TASK_STATE;
export const IPC_DEVICE_SELECT = IpcChannels.DEVICE_SELECT;
export const IPC_DEVICE_REFRESH = IpcChannels.DEVICE_REFRESH;
export const IPC_DEVICE_DISCONNECT = IpcChannels.DEVICE_DISCONNECT;
export const IPC_REPORT_UPDATE = IpcChannels.REPORT_UPDATE;
export const IPC_REPORT_LIST = IpcChannels.REPORT_LIST;
export const IPC_REPORT_SELECT = IpcChannels.REPORT_SELECT;
export const IPC_REPORT_DELETE = IpcChannels.REPORT_DELETE;
export const IPC_WINDOW_MINIMIZE = IpcChannels.WINDOW_MINIMIZE;
export const IPC_WINDOW_TOGGLE_MAXIMIZE = IpcChannels.WINDOW_TOGGLE_MAXIMIZE;
export const IPC_WINDOW_CLOSE = IpcChannels.WINDOW_CLOSE;
export const IPC_WINDOW_STATE = IpcChannels.WINDOW_STATE;

