import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('omni', {
  // 基础 IPC
  send: (channel: string, payload?: unknown) => ipcRenderer.send(channel, payload),
  on: (channel: string, listener: (...args: unknown[]) => void) =>
    ipcRenderer.on(channel, (_event, ...args) => listener(...args)),
  off: (channel: string, listener: (...args: unknown[]) => void) =>
    ipcRenderer.off(channel, listener as any),

  // PlaygroundSDK IPC 调用（invoke/handle 模式用于异步请求-响应）
  playground: {
    executeAction: (actionType: string, value: unknown, options: unknown) =>
      ipcRenderer.invoke('playground:executeAction', actionType, value, options),
    getActionSpace: (context?: unknown) =>
      ipcRenderer.invoke('playground:getActionSpace', context),
    validateParams: (value: unknown, action: unknown) =>
      ipcRenderer.invoke('playground:validateParams', value, action),
    formatErrorMessage: (error: any) =>
      ipcRenderer.invoke('playground:formatErrorMessage', error),
    createDisplayContent: (value: unknown, needsStructuredParams: boolean, action: unknown) =>
      ipcRenderer.invoke('playground:createDisplayContent', value, needsStructuredParams, action),
    checkStatus: () =>
      ipcRenderer.invoke('playground:checkStatus'),
    overrideConfig: (aiConfig: any) =>
      ipcRenderer.invoke('playground:overrideConfig', aiConfig),
    getTaskProgress: (requestId: string) =>
      ipcRenderer.invoke('playground:getTaskProgress', requestId),
    cancelTask: (requestId: string) =>
      ipcRenderer.invoke('playground:cancelTask', requestId),
    cancelExecution: (requestId: string) =>
      ipcRenderer.invoke('playground:cancelExecution', requestId),
    getCurrentExecutionData: () =>
      ipcRenderer.invoke('playground:getCurrentExecutionData'),
    getScreenshot: () =>
      ipcRenderer.invoke('playground:getScreenshot'),
    getInterfaceInfo: () =>
      ipcRenderer.invoke('playground:getInterfaceInfo'),
    getServiceMode: () =>
      ipcRenderer.invoke('playground:getServiceMode'),
    getId: () =>
      ipcRenderer.invoke('playground:getId'),

    // 事件监听
    onDumpUpdate: (callback: (dump: string, executionDump?: any) => void) => {
      const listener = (_event: any, dump: string, executionDump?: any) => callback(dump, executionDump)
      ipcRenderer.on('playground:dumpUpdate', listener)
      return () => ipcRenderer.off('playground:dumpUpdate', listener)
    },
    onProgressUpdate: (callback: (tip: string) => void) => {
      const listener = (_event: any, tip: string) => callback(tip)
      ipcRenderer.on('playground:progressUpdate', listener)
      return () => ipcRenderer.off('playground:progressUpdate', listener)
    },
  },
})

// 类型声明，供渲染进程使用
declare global {
  interface Window {
    omni: {
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
