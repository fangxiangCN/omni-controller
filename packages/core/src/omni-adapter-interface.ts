import type { IDeviceAdapter } from '../../drivers/interface/src'
import type { DeviceAction } from './types'
import { AbstractInterface } from './device'

// Adapter -> Omni AbstractInterface
export class OmniDeviceInterface extends AbstractInterface {
  interfaceType = 'omni'

  constructor(private adapter: IDeviceAdapter) {
    super()
  }

  async screenshotBase64(): Promise<string> {
    return this.adapter.screenshotBase64()
  }

  async size(): Promise<{ width: number; height: number; dpr?: number }> {
    return this.adapter.size()
  }

  actionSpace(): DeviceAction[] {
    return (this.adapter.actionSpace?.() || []) as DeviceAction[]
  }

  async destroy(): Promise<void> {
    await this.adapter.disconnect()
  }
}



