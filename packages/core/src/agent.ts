import type { IDeviceAdapter } from '@omni/drivers-interface'
import { Agent as MidsceneAgent, type AgentOpt } from '@midscene/core/agent'
import type { MidsceneAgentLike } from './types'
import { OmniDeviceInterface } from './adapter-interface'

export type CreateAgentOptions = AgentOpt

export function createAgent(adapter: IDeviceAdapter, opts?: CreateAgentOptions): MidsceneAgentLike {
  const iface = new OmniDeviceInterface(adapter)
  return new MidsceneAgent(iface, opts) as unknown as MidsceneAgentLike
}

export function createAgentFromEnv(adapter: IDeviceAdapter): MidsceneAgentLike {
  const opts: AgentOpt = {
    modelConfig: {
      MIDSCENE_MODEL_NAME: process.env.MIDSCENE_MODEL_NAME,
      MIDSCENE_OPENAI_BASE_URL: process.env.MIDSCENE_OPENAI_BASE_URL,
      MIDSCENE_OPENAI_API_KEY: process.env.MIDSCENE_OPENAI_API_KEY,
    },
  }
  return createAgent(adapter, opts)
}

import { NoopScheduler } from './scheduler'

export function createSchedulerFactory() {
  return () => new NoopScheduler()
}
