import type { IDeviceAdapter } from '@omni/drivers-interface'
import { Agent as MidsceneAgent, type AgentOpt } from '@midscene/core/agent'
import type { MidsceneAgentLike } from './types'
import { OmniDeviceInterface } from './adapter-interface'

export type CreateAgentOptions = AgentOpt

export function createAgent(adapter: IDeviceAdapter, opts?: CreateAgentOptions): MidsceneAgentLike {
  const iface = new OmniDeviceInterface(adapter)
  return new MidsceneAgent(iface, opts) as unknown as MidsceneAgentLike
}

import { NoopScheduler } from './scheduler'

export function createSchedulerFactory() {
  return () => new NoopScheduler()
}
