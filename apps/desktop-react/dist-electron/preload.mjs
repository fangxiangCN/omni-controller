"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("omni", {
  send: (channel, payload) => electron.ipcRenderer.send(channel, payload),
  on: (channel, listener) => electron.ipcRenderer.on(channel, (_event, ...args) => listener(...args)),
  off: (channel, listener) => electron.ipcRenderer.off(channel, listener)
});
