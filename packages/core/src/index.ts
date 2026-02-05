export * from './omni-agent'
export * from './omni-adapter-interface'
export type { AgentLike, AiActOptions, LocateResult } from './omni-types'
export type { DeviceAction } from './types'

import { z } from 'zod'
import Service from './service/index'
import { TaskRunner } from './task-runner'
import { getVersion } from './utils'

export {
  plan,
  AiLocateElement,
  getLocationSchema,
  type LocationResultType,
  PointSchema,
  SizeSchema,
  RectSchema,
  TMultimodalPromptSchema,
  TUserPromptSchema,
  type TMultimodalPrompt,
  type TUserPrompt,
} from './ai-model/index'

export { MIDSCENE_MODEL_NAME, type CreateOpenAIClientFn } from '@omni/shared/env'

export type * from './types'
export {
  ServiceError,
  ExecutionDump,
  GroupedActionDump,
  type IExecutionDump,
  type IGroupedActionDump,
} from './types'

export { z }

export default Service
export { TaskRunner, Service, getVersion }

export type {
  YamlScript,
  YamlTask,
  YamlFlowItem,
  YamlConfigResult,
  YamlConfig,
  YamlScriptWebEnv,
  YamlScriptAndroidEnv,
  YamlScriptIOSEnv,
  YamlScriptEnv,
  LocateOption,
  DetailedLocateParam,
} from './yaml'

export { Agent, type AgentOpt, createAgent } from './agent'

export {
  restoreImageReferences,
  escapeContent,
  unescapeContent,
  parseImageScripts,
  parseDumpScript,
  parseDumpScriptAttributes,
  generateImageScriptTag,
  generateDumpScriptTag,
} from './dump'

export { ScreenshotItem } from './screenshot-item'
export type { SerializedScreenshotItem } from './screenshot-item'
