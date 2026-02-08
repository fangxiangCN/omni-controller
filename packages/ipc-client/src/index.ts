import type { IpcChannels } from '@omni/ipc-contract'

export type IpcListener<T = any> = (payload: T) => void

function getOmniBridge() {
  if (typeof window === 'undefined' || !window.omni) {
    throw new Error('IPC bridge is not available')
  }
  return window.omni
}

export function send(channel: IpcChannels | string, payload?: unknown): void {
  getOmniBridge().send(channel, payload)
}

export function on<T = any>(
  channel: IpcChannels | string,
  listener: IpcListener<T>,
): () => void {
  const bridge = getOmniBridge()
  bridge.on(channel, listener as (...args: unknown[]) => void)
  return () => bridge.off(channel, listener as (...args: unknown[]) => void)
}

export function off<T = any>(
  channel: IpcChannels | string,
  listener: IpcListener<T>,
): void {
  getOmniBridge().off(channel, listener as (...args: unknown[]) => void)
}

export function getPlaygroundBridge() {
  return getOmniBridge().playground
}

declare global {
  interface Window {
    omni?: {
      send: (channel: string, payload?: unknown) => void
      on: (channel: string, listener: (...args: unknown[]) => void) => void
      off: (channel: string, listener: (...args: unknown[]) => void) => void
      playground: {
        executeAction: (actionType: string, value: unknown, options: unknown) => Promise<unknown>
        getActionSpace: (context?: unknown) => Promise<unknown[]>
        validateParams: (value: unknown, action: unknown) => Promise<{ valid: boolean; errorMessage?: string }>
        formatErrorMessage: (error: any) => Promise<string>
        createDisplayContent: (value: unknown, needsStructuredParams: boolean, action: unknown) => Promise<string>
        checkStatus: () => Promise<boolean>
        overrideConfig: (aiConfig: any) => Promise<void>
        getTaskProgress: (requestId: string) => Promise<{ executionDump?: any }>
        cancelTask: (requestId: string) => Promise<any>
        cancelExecution: (requestId: string) => Promise<{ dump: any | null; reportHTML: string | null } | null>
        getCurrentExecutionData: () => Promise<{ dump: any | null; reportHTML: string | null }>
        getScreenshot: () => Promise<{ screenshot: string; timestamp: number } | null>
        getInterfaceInfo: () => Promise<{ type: string; description?: string } | null>
        getServiceMode: () => Promise<'In-Browser-Extension' | 'Server'>
        getId: () => Promise<string | undefined>
        onDumpUpdate: (callback: (dump: string, executionDump?: any) => void) => () => void
        onProgressUpdate: (callback: (tip: string) => void) => () => void
      }
    }
  }
}
