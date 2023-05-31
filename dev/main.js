"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const event_1 = require("./event");
const path_1 = __importDefault(require("path"));
let mainWindow;
let tray;
let hide;
let isDev = false;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
            preload: path_1.default.join(__dirname + "/preload.js"),
        },
    });
    mainWindow.setIcon(path_1.default.join(__dirname, "ico", "icon.png"));
    isDev
        ? mainWindow.loadURL("http://localhost:5173")
        : mainWindow.loadFile(path_1.default.join(__dirname, "client", "index.html"));
    !isDev && mainWindow.setMenu(null);
    electron_1.ipcMain.handle("hide", () => {
        const xd = new electron_1.Notification({
            title: "OAIWDBOIAWBDoibWAD",
        });
        let notification = new electron_1.Notification({
            title: "ElectronPlayer",
            body: "Seguira ejecutandose en segundo plano",
            icon: path_1.default.join(__dirname, "ico", "icon.png"),
            subtitle: "olololololololo",
            urgency: "critical",
        }).show();
        hide = true;
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.hide();
    });
    tray = new electron_1.Tray(path_1.default.join(__dirname, "ico", "icon.png"));
    const contextMenu = electron_1.Menu.buildFromTemplate([
        { label: "Abrir", click: () => mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show() },
        { label: "Salir", click: () => electron_1.app.quit() },
    ]);
    tray.setContextMenu(contextMenu);
    // Abrir la ventana principal al hacer clic en el icono
    tray.on("click", () => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
    });
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
//###################### Eventos ######################//
(0, event_1.getMusicFolder)();
(0, event_1.getMusic)();
(0, event_1.getMusicFolderName)();
(0, event_1.backToFolder)();
(0, event_1.searchMusicYT)();
(0, event_1.getURLMusic)();
(0, event_1.downloadMusicURL)();
(0, event_1.getMusicYTDL)();
(0, event_1.sendNewProblemsADM)();
(0, event_1.openWebOficial)();
(0, event_1.getMusicByPlayList)();
(0, event_1.getAllPlayList)();
(0, event_1.closeApp)(electron_1.app);
(0, event_1.getApiData)();
//###################### Eventos ######################//
electron_1.app.on("ready", createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});
