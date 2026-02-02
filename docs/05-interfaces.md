# 05 关键接口与协议

日期: 2026-02-02

IDeviceAdapter
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

  // 生命周期
  connect(): Promise<boolean>;
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
}
```

AI 输出
- 仅支持 Midscene 模式 (由 Agent/TaskExecutor 内部处理)
