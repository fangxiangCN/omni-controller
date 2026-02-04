import type { IDeviceAdapter } from '@omni/drivers-interface'
import type { DeviceAction } from '@midscene/core'
import { AbstractInterface } from '@midscene/core/device'

// Adapter -> Midscene AbstractInterface
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
