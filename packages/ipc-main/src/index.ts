import type {
  DeviceFramePayload,
  DeviceListPayload,
  ReportListPayload,
  ReportPayload,
  TaskLogPayload,
  TaskStatePayload,
} from '@omni/ipc-contract'
import {
  IPC_DEVICE_DISCONNECT,
  IPC_DEVICE_LIST,
  IPC_DEVICE_REFRESH,
  IPC_DEVICE_SELECT,
  IPC_REPORT_DELETE,
  IPC_REPORT_LIST,
  IPC_REPORT_SELECT,
  IPC_REPORT_UPDATE,
  IPC_START_TASK,
  IPC_STOP_TASK,
  IPC_TASK_LOG,
  IPC_TASK_STATE,
  IPC_WINDOW_CLOSE,
  IPC_WINDOW_MINIMIZE,
  IPC_WINDOW_TOGGLE_MAXIMIZE,
} from '@omni/ipc-contract'

export type PlaygroundSdkLike = {
  executeAction: (actionType: string, value: unknown, options: unknown) => Promise<unknown>
  getActionSpace: (context?: unknown) => Promise<unknown[]>
  validateStructuredParams: (value: unknown, action: unknown) => Promise<{ valid: boolean; errorMessage?: string }>
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
  id?: string
  onDumpUpdate: (callback: (dump: string, executionDump?: any) => void) => void
  onProgressUpdate: (callback: (tip: string) => void) => void
}

export type DeviceManagerLike = {
  selectDevice: (deviceId: string) => Promise<void>
  refreshDevices: () => Promise<void>
  disconnect: () => Promise<void>
}

export type TaskSchedulerLike = {
  run: (instruction: string) => Promise<void>
  stop: () => void
}

export type WindowController = {
  minimize: () => void
  toggleMaximize: () => void
  close: () => void
  isMaximized: () => boolean
}

export type IpcMainLike = {
  on: (channel: string, listener: (event: any, ...args: any[]) => void) => void
  handle: (channel: string, listener: (event: any, ...args: any[]) => any) => void
}

export type RegisterPlaygroundIpcOptions = {
  ipcMain: IpcMainLike
  getSdk: () => PlaygroundSdkLike
  sendToRenderer: (channel: string, ...args: unknown[]) => void
}

export function registerPlaygroundIpc({ ipcMain, getSdk, sendToRenderer }: RegisterPlaygroundIpcOptions) {
  const init = () => getSdk()

  ipcMain.handle('playground:executeAction', async (_event, actionType: string, value: unknown, options: unknown) => {
    return init().executeAction(actionType, value, options)
  })
  ipcMain.handle('playground:getActionSpace', async (_event, context?: unknown) => {
    return init().getActionSpace(context)
  })
  ipcMain.handle('playground:validateParams', async (_event, value: unknown, action: unknown) => {
    return init().validateStructuredParams(value, action)
  })
  ipcMain.handle('playground:formatErrorMessage', async (_event, error: any) => {
    return init().formatErrorMessage(error)
  })
  ipcMain.handle('playground:createDisplayContent', async (_event, value: unknown, needsStructuredParams: boolean, action: unknown) => {
    return init().createDisplayContent(value, needsStructuredParams, action)
  })
  ipcMain.handle('playground:checkStatus', async () => init().checkStatus())
  ipcMain.handle('playground:overrideConfig', async (_event, aiConfig: any) => init().overrideConfig(aiConfig))
  ipcMain.handle('playground:getTaskProgress', async (_event, requestId: string) => init().getTaskProgress(requestId))
  ipcMain.handle('playground:cancelTask', async (_event, requestId: string) => init().cancelTask(requestId))
  ipcMain.handle('playground:cancelExecution', async (_event, requestId: string) => init().cancelExecution(requestId))
  ipcMain.handle('playground:getCurrentExecutionData', async () => init().getCurrentExecutionData())
  ipcMain.handle('playground:getScreenshot', async () => init().getScreenshot())
  ipcMain.handle('playground:getInterfaceInfo', async () => init().getInterfaceInfo())
  ipcMain.handle('playground:getServiceMode', async () => init().getServiceMode())
  ipcMain.handle('playground:getId', async () => init().id)

  init().onDumpUpdate((dump: string, executionDump?: any) => {
    sendToRenderer('playground:dumpUpdate', dump, executionDump)
  })
  init().onProgressUpdate((tip: string) => {
    sendToRenderer('playground:progressUpdate', tip)
  })
}

export type RegisterDeviceTaskIpcOptions = {
  ipcMain: IpcMainLike
  deviceManager: DeviceManagerLike
  taskScheduler: TaskSchedulerLike
}

export function registerDeviceTaskIpc({ ipcMain, deviceManager, taskScheduler }: RegisterDeviceTaskIpcOptions) {
  ipcMain.on(IPC_DEVICE_SELECT, async (_event, payload: { deviceId?: string }) => {
    await deviceManager.selectDevice(payload?.deviceId || '')
  })
  ipcMain.on(IPC_START_TASK, async (_event, payload: { instruction: string; deviceId: string }) => {
    if (payload?.deviceId) {
      await deviceManager.selectDevice(payload.deviceId)
    }
    await taskScheduler.run(payload?.instruction || '')
  })
  ipcMain.on(IPC_STOP_TASK, () => {
    taskScheduler.stop()
  })
  ipcMain.on(IPC_DEVICE_REFRESH, async () => {
    await deviceManager.refreshDevices()
  })
  ipcMain.on(IPC_DEVICE_DISCONNECT, async () => {
    await deviceManager.disconnect()
  })
}

export type RegisterWindowIpcOptions = {
  ipcMain: IpcMainLike
  window: WindowController
}

export function registerWindowIpc({ ipcMain, window }: RegisterWindowIpcOptions) {
  ipcMain.on(IPC_WINDOW_MINIMIZE, () => window.minimize())
  ipcMain.on(IPC_WINDOW_TOGGLE_MAXIMIZE, () => window.toggleMaximize())
  ipcMain.on(IPC_WINDOW_CLOSE, () => window.close())
}

export type RegisterReportIpcOptions = {
  ipcMain: IpcMainLike
  readReport: (id: string) => ReportPayload | null
  deleteReport: (id: string) => { reports: ReportListPayload } | null
  sendToRenderer: (channel: string, payload: ReportPayload | ReportListPayload) => void
}

export function registerReportIpc({ ipcMain, readReport, deleteReport, sendToRenderer }: RegisterReportIpcOptions) {
  ipcMain.on(IPC_REPORT_SELECT, (_event, payload: { id?: string }) => {
    if (!payload?.id) return
    const reportPayload = readReport(payload.id)
    if (!reportPayload) return
    sendToRenderer(IPC_REPORT_UPDATE, reportPayload)
  })

  ipcMain.on(IPC_REPORT_DELETE, (_event, payload: { id?: string }) => {
    if (!payload?.id) return
    const result = deleteReport(payload.id)
    if (!result) return
    sendToRenderer(IPC_REPORT_LIST, result.reports)
    sendToRenderer(IPC_REPORT_UPDATE, { html: null, id: '', title: '', path: '' })
  })
}

export type RegisterDeviceEventForwardingOptions = {
  sendToRenderer: (channel: string, payload: DeviceListPayload | DeviceFramePayload | TaskLogPayload | TaskStatePayload) => void
}
