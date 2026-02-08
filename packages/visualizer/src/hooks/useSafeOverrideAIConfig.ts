import { PlaygroundSDK } from '@omni/playground-client'
import { message } from 'antd'

type AiConfigRecord = Record<string, string>

export function safeOverrideAIConfig(
  newConfig: AiConfigRecord,
  _extendMode = false,
  showErrorMessage = true,
): boolean {
  try {
    const playgroundSDK = new PlaygroundSDK({ type: 'remote-execution' })
    playgroundSDK.overrideConfig(newConfig).catch((error) => {
      const err = error instanceof Error ? error : new Error(String(error))
      console.error('Failed to override AI config:', err)
      if (showErrorMessage) {
        message.error(`Failed to apply AI configuration: ${err.message}`)
      }
    })
    return true
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('Failed to override AI config:', err)

    if (showErrorMessage) {
      message.error(`Failed to apply AI configuration: ${err.message}`)
    }

    return false
  }
}

export function useSafeOverrideAIConfig() {
  const applyConfig = (
    newConfig: AiConfigRecord,
    extendMode = false,
    showErrorMessage = true,
  ) => {
    return safeOverrideAIConfig(newConfig, extendMode, showErrorMessage)
  }

  return { applyConfig }
}
