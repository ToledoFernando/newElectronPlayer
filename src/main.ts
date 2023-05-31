import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  Notification,
} from "electron";

import {
  getMusicFolder,
  getMusic,
  getMusicFolderName,
  backToFolder,
  searchMusicYT,
  getURLMusic,
  downloadMusicURL,
  getApiData,
  closeApp,
  getMusicYTDL,
  getAllPlayList,
  getMusicByPlayList,
  sendNewProblemsADM,
  openWebOficial,
} from "./event";
import path from "path";

let mainWindow: Electron.BrowserWindow | null;

let tray;

let hide;

let isDev = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    minWidth: 900,
    maxWidth: 1200,
    height: 650,
    minHeight: 650,
    maxHeight: 700,
    transparent: true,
    backgroundColor: "#00000000",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname + "/preload.js"),
    },
  });

  mainWindow.setIcon(path.join(__dirname, "ico", "icon.png"));

  isDev
    ? mainWindow.loadURL("http://localhost:5173")
    : mainWindow.loadFile(path.join(__dirname, "client", "index.html"));

  !isDev && mainWindow.setMenu(null);

  ipcMain.handle("hide", () => {
    new Notification({
      title: "ElectronPlayer",
      body: "Seguira ejecutandose en segundo plano",
      icon: path.join(__dirname, "ico", "icon.png"),
    }).show();

    hide = true;
    mainWindow?.hide();
  });

  tray = new Tray(path.join(__dirname, "ico", "icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    { label: "Abrir", click: () => mainWindow?.show() },
    { label: "Salir", click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);

  // Abrir la ventana principal al hacer clic en el icono
  tray.on("click", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
//###################### Eventos ######################//
getMusicFolder();
getMusic();
getMusicFolderName();
backToFolder();
searchMusicYT();
getURLMusic();
downloadMusicURL();
getMusicYTDL();
sendNewProblemsADM();
openWebOficial();
getMusicByPlayList();
getAllPlayList();
closeApp(app);

getApiData();
//###################### Eventos ######################//

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
