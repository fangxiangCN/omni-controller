"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("omni", {
  // 基础 IPC
  send: (channel, payload) => electron.ipcRenderer.send(channel, payload),
  on: (channel, listener) => electron.ipcRenderer.on(channel, (_event, ...args) => listener(...args)),
  off: (channel, listener) => electron.ipcRenderer.off(channel, listener),
  // PlaygroundSDK IPC 调用（invoke/handle 模式用于异步请求-响应）
  playground: {
    executeAction: (actionType, value, options) => electron.ipcRenderer.invoke("playground:executeAction", actionType, value, options),
    getActionSpace: (context) => electron.ipcRenderer.invoke("playground:getActionSpace", context),
    validateParams: (value, action) => electron.ipcRenderer.invoke("playground:validateParams", value, action),
    formatErrorMessage: (error) => electron.ipcRenderer.invoke("playground:formatErrorMessage", error),
    createDisplayContent: (value, needsStructuredParams, action) => electron.ipcRenderer.invoke("playground:createDisplayContent", value, needsStructuredParams, action),
    checkStatus: () => electron.ipcRenderer.invoke("playground:checkStatus"),
    overrideConfig: (aiConfig) => electron.ipcRenderer.invoke("playground:overrideConfig", aiConfig),
    getTaskProgress: (requestId) => electron.ipcRenderer.invoke("playground:getTaskProgress", requestId),
    cancelTask: (requestId) => electron.ipcRenderer.invoke("playground:cancelTask", requestId),
    cancelExecution: (requestId) => electron.ipcRenderer.invoke("playground:cancelExecution", requestId),
    getCurrentExecutionData: () => electron.ipcRenderer.invoke("playground:getCurrentExecutionData"),
    getScreenshot: () => electron.ipcRenderer.invoke("playground:getScreenshot"),
    getInterfaceInfo: () => electron.ipcRenderer.invoke("playground:getInterfaceInfo"),
    getServiceMode: () => electron.ipcRenderer.invoke("playground:getServiceMode"),
    getId: () => electron.ipcRenderer.invoke("playground:getId"),
    // 事件监听
    onDumpUpdate: (callback) => {
      const listener = (_event, dump, executionDump) => callback(dump, executionDump);
      electron.ipcRenderer.on("playground:dumpUpdate", listener);
      return () => electron.ipcRenderer.off("playground:dumpUpdate", listener);
    },
    onProgressUpdate: (callback) => {
      const listener = (_event, tip) => callback(tip);
      electron.ipcRenderer.on("playground:progressUpdate", listener);
      return () => electron.ipcRenderer.off("playground:progressUpdate", listener);
    }
  }
});
