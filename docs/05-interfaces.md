# 05 关键接口与协议

日期: 2026-02-05

IDeviceAdapter（与当前实现一致）
```ts
export interface IDeviceAdapter {
  interfaceType: string;

  // Midscene Agent 依赖
  screenshotBase64(): Promise<string>;
  size(): Promise<{ width: number; height: number; dpr?: number }>;
  actionSpace(): DeviceAction[];

  // 可选优化
  getContext?(): Promise<UIContext>;
  destroy?(): Promise<void>;
  getDeviceInfo?(): Promise<DeviceInfo>;

  // 生命周期
  connect(deviceId?: string): Promise<boolean>;
  disconnect(): Promise<void>;

  // 流与输入
  startStream(onFrame: (data: Uint8Array, format: 'h264'|'jpeg') => void): Promise<void>;
  tap(x: number, y: number): Promise<void>;
  type(text: string): Promise<void>;
  scroll(dx: number, dy: number): Promise<void>;
  back(): Promise<void>;
}
```

IPC Channels (建议)
```ts
export enum IpcChannels {
  START_TASK = 'task:start',
  STOP_TASK = 'task:stop',
  DEVICE_UPDATE = 'device:list',
  TASK_LOG = 'task:log',
  DEVICE_FRAME = 'device:frame', // { deviceId, format, data }
  DEVICE_SELECT = 'device:select',
  DEVICE_REFRESH = 'device:refresh',
  DEVICE_DISCONNECT = 'device:disconnect',
  TASK_STATE = 'task:state',
  REPORT_UPDATE = 'report:update',
  REPORT_LIST = 'report:list',
  REPORT_SELECT = 'report:select',
  WINDOW_MINIMIZE = 'window:minimize',
  WINDOW_TOGGLE_MAXIMIZE = 'window:toggle-maximize',
  WINDOW_CLOSE = 'window:close',
}
```

AI 输出
- 仅支持 Midscene 模式 (由 Agent/TaskExecutor 内部处理)
