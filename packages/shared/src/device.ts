export type DeviceType = 'android' | 'ohos' | 'web';

export type DeviceInfo = {
  id: string;
  name: string;
  type: DeviceType;
};
