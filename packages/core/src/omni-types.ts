import type { AgentOpt } from './agent'

export type AiActOptions = {
  cacheable?: boolean
  deepThink?: boolean
}

export type LocateResult = {
  rect?: { left: number; top: number; width: number; height: number }
  center?: [number, number]
}

export interface AgentLike {
  aiAct(taskPrompt: string, opt?: AiActOptions): Promise<string | undefined>
  aiTap(locatePrompt: string): Promise<unknown>
  aiInput(locatePrompt: string, opt: { value: string }): Promise<unknown>
  aiLocate(prompt: string): Promise<LocateResult>
  aiAssert(assertion: string): Promise<void>
  aiWaitFor(assertion: string): Promise<void>
  runYaml(yamlScriptContent: string): Promise<{ result: Record<string, unknown> }>
}




