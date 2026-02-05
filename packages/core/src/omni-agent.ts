import type { IDeviceAdapter } from '../../drivers/interface/src'
import { Agent as CoreAgent, type AgentOpt } from './agent'
import type { AgentLike } from './omni-types'
import { OmniDeviceInterface } from './omni-adapter-interface'

export type CreateAgentOptions = AgentOpt

export function createAgent(adapter: IDeviceAdapter, opts?: CreateAgentOptions): AgentLike {
  const iface = new OmniDeviceInterface(adapter)
  return new CoreAgent(iface, opts) as unknown as AgentLike
}

export function createAgentFromEnv(adapter: IDeviceAdapter): AgentLike {
  const opts: AgentOpt = {
    modelConfig: {
      MIDSCENE_MODEL_NAME: process.env.MIDSCENE_MODEL_NAME ?? '',
      MIDSCENE_OPENAI_BASE_URL: process.env.MIDSCENE_OPENAI_BASE_URL ?? '',
      MIDSCENE_OPENAI_API_KEY: process.env.MIDSCENE_OPENAI_API_KEY ?? '',
    },
  }
  return createAgent(adapter, opts)
}
