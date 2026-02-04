export type DeviceSize = {
  width: number;
  height: number;
  dpr?: number;
};

export type DeviceFrame = {
  data: Uint8Array;
  format: 'h264' | 'jpeg';
};

export interface IDeviceAdapter {
  interfaceType: string;

  screenshotBase64(): Promise<string>;
  size(): Promise<DeviceSize>;
  actionSpace(): unknown[];

  getContext?(): Promise<unknown>;
  destroy?(): Promise<void>;

  connect(): Promise<boolean>;
  disconnect(): Promise<void>;

  startStream(onFrame: (frame: DeviceFrame) => void): Promise<void>;
  tap(x: number, y: number): Promise<void>;
  type(text: string): Promise<void>;
  scroll(dx: number, dy: number): Promise<void>;
  back(): Promise<void>;
}
