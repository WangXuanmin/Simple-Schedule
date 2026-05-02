const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 540,
    minWidth: 320,
    minHeight: 460,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    backgroundColor: "#00000000",
    title: "Schedule",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("window:minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle("window:close", () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle("window:toggle-always-on-top", () => {
  if (!mainWindow) return false;
  const nextValue = !mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(nextValue, "floating");
  return nextValue;
});
