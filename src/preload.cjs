const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("scheduleWindow", {
  minimize: () => ipcRenderer.invoke("window:minimize"),
  close: () => ipcRenderer.invoke("window:close"),
  toggleAlwaysOnTop: () => ipcRenderer.invoke("window:toggle-always-on-top")
});
