import { app, BrowserWindow } from "electron";
import {
  getMusicFolder,
  getMusic,
  getMusicFolderName,
  backToFolder,
  searchMusicYT,
  getURLMusic,
  downloadMusicURL,
  getApiData,
} from "./event";
import path from "path";

let mainWindow: Electron.BrowserWindow | null;

let isDev = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    minWidth: 850,
    height: 650,
    minHeight: 650,
    transparent: true,
    backgroundColor: "#00000000",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname + "/preload.js"),
    },
  });

  isDev
    ? mainWindow.loadURL("http://localhost:5173")
    : mainWindow.loadFile(path.join(__dirname, "client", "index.html"));

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
