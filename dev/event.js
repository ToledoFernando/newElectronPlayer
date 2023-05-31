"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeApp = exports.openWebOficial = exports.sendNewProblemsADM = exports.getMusicByPlayList = exports.getAllPlayList = exports.getMusicYTDL = exports.getApiData = exports.downloadMusicURL = exports.getURLMusic = exports.searchMusicYT = exports.backToFolder = exports.getMusicFolderName = exports.getMusic = exports.getMusicFolder = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yt_search_1 = __importDefault(require("yt-search"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
function getMusicFolder() {
    electron_1.ipcMain.handle("musicFolder", async (event) => {
        let directory = `C:\\Users\\${process.env.USERNAME}\\Music\\`;
        const result = fs_1.default.readdirSync(directory);
        //############################
        let folders;
        let mp3Files;
        folders = result
            .filter((file) => {
            const fullPath = path_1.default.join(directory, file);
            return fs_1.default.statSync(fullPath).isDirectory();
        })
            .map((file) => ({
            path: path_1.default.join(directory, file),
            name: file,
        }));
        mp3Files = result
            .filter((filename) => path_1.default.extname(filename) === ".mp3")
            .map((filename) => ({ path: directory + filename, name: filename }));
        //############################
        return { files: mp3Files, folders };
    });
}
exports.getMusicFolder = getMusicFolder;
function getMusic() {
    electron_1.ipcMain.handle("getMusic", async (event, file) => {
        let result = {
            name: file.name,
            buffer: null,
        };
        result.buffer = fs_1.default.readFileSync(file.path);
        return result;
    });
}
exports.getMusic = getMusic;
function getMusicFolderName() {
    electron_1.ipcMain.handle("getMusicFolderName", async (event, folder) => {
        // console.log(folder);
        let directory = folder.path;
        const result = fs_1.default.readdirSync(directory);
        //############################
        let folders;
        let mp3Files;
        folders = result
            .filter((file) => {
            const fullPath = path_1.default.join(directory, file);
            return fs_1.default.statSync(fullPath).isDirectory();
        })
            .map((file) => ({
            path: path_1.default.join(directory, file),
            name: file,
        }));
        mp3Files = result
            .filter((filename) => path_1.default.extname(filename) === ".mp3")
            .map((filename) => ({
            path: directory + "\\" + filename,
            name: filename,
        }));
        //############################
        return { files: mp3Files, folders };
    });
}
exports.getMusicFolderName = getMusicFolderName;
function backToFolder() {
    electron_1.ipcMain.handle("getBackToFolder", async (event, folder) => {
        let directory = `C:\\Users\\${process.env.USERNAME}\\Music\\${folder.join("\\")}`;
        const result = fs_1.default.readdirSync(directory);
        //############################
        let folders;
        let mp3Files;
        folders = result
            .filter((file) => {
            const fullPath = path_1.default.join(directory, file);
            return fs_1.default.statSync(fullPath).isDirectory();
        })
            .map((file) => ({
            path: path_1.default.join(directory, file),
            name: file,
        }));
        mp3Files = result
            .filter((filename) => path_1.default.extname(filename) === ".mp3")
            .map((filename) => ({ path: directory + filename, name: filename }));
        //############################
        return { files: mp3Files, folders };
    });
}
exports.backToFolder = backToFolder;
function searchMusicYT() {
    electron_1.ipcMain.handle("searchMusicYT", async (event, search) => {
        const result = await (0, yt_search_1.default)(search);
        const musics = [];
        for (let a = 0; a < result.videos.length; a++) {
            musics.push({
                videoId: result.videos[a].videoId,
                url: result.videos[a].url,
                title: result.videos[a].title,
                img: result.videos[a].image,
                thumbnail: result.videos[a].thumbnail,
                seconds: result.videos[a].seconds,
                views: result.videos[a].views,
                author: result.videos[a].author.name,
            });
        }
        return JSON.stringify(musics);
    });
}
exports.searchMusicYT = searchMusicYT;
function getURLMusic() {
    electron_1.ipcMain.handle("getURLMusic", async (event, videoId) => {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const musicInfor = await ytdl_core_1.default.getInfo(url);
        let musics = [];
        for (let a = 0; a < musicInfor.formats.length; a++) {
            if (musicInfor.formats[a].container === "webm" &&
                musicInfor.formats[a].hasVideo === false &&
                musicInfor.formats[a].hasAudio === true) {
                musics.push(musicInfor.formats[a]);
            }
        }
        return musics[0];
    });
}
exports.getURLMusic = getURLMusic;
function Download(ruta) {
    const name = ruta.name.replace(/[^a-zA-Z0-9]/g, " ");
    const file = fs_1.default.createWriteStream(`C:\\Users\\${process.env.USERNAME}\\Music\\${name}.mp3`);
    (0, axios_1.default)({
        url: ruta.url,
        method: "GET",
        responseType: "stream",
    })
        .then((response) => {
        const totalLength = response.headers["content-length"];
        response.data.pipe(file);
        response.data.on("data", (chunk) => {
            const downloaded = file.bytesWritten;
            const progress = Math.round((downloaded / totalLength) * 10000) / 100;
            electron_1.webContents.getAllWebContents().forEach((webContent) => {
                webContent.send("newProgress", Math.round(progress));
            });
        });
        response.data.on("end", () => {
            electron_1.webContents.getAllWebContents().forEach((webContent) => {
                webContent.send("finishProgress", ruta.name);
            });
            new electron_1.Notification({
                title: "Descarga Completa",
                body: ruta.name,
                icon: path_1.default.join(__dirname, "ico", "icon.png"),
            }).show();
            console.log("Download finished");
        });
    })
        .catch((error) => {
        console.log(error);
    });
}
function downloadMusicURL() {
    electron_1.ipcMain.on("downloadMusicURL", (event, musica) => {
        new electron_1.Notification({
            title: "Descargando Musica",
            body: musica.name,
            icon: path_1.default.join(__dirname, "ico", "icon.png"),
        }).show();
        Download(musica);
    });
}
exports.downloadMusicURL = downloadMusicURL;
function getApiData() {
    electron_1.ipcMain.handle("getApiData", async () => {
        if (typeof config_1.TOKEN != "string")
            return;
        const res = await (0, axios_1.default)(`${config_1.API}/music`, {
            headers: {
                Authorization: `Bearer ${config_1.TOKEN}`,
            },
        });
        return res.data;
    });
}
exports.getApiData = getApiData;
function getMusicYTDL() {
    electron_1.ipcMain.handle("getMusicYTDL", async (event, videoURL) => {
        const musicInfor = await ytdl_core_1.default.getInfo(videoURL);
        let musics = [];
        for (let a = 0; a < musicInfor.formats.length; a++) {
            if (musicInfor.formats[a].container === "webm" &&
                musicInfor.formats[a].hasVideo === false &&
                musicInfor.formats[a].hasAudio === true) {
                musics.push(musicInfor.formats[a]);
            }
        }
        return musics[0];
    });
}
exports.getMusicYTDL = getMusicYTDL;
function getAllPlayList() {
    electron_1.ipcMain.handle("getAllPlayList", async (event) => {
        if (typeof config_1.TOKEN != "string")
            return;
        const res = await (0, axios_1.default)(`${config_1.API}/playlist/get-allplaylist`, {
            headers: {
                Authorization: `Bearer ${config_1.TOKEN}`,
            },
        });
        return res.data;
    });
}
exports.getAllPlayList = getAllPlayList;
function getMusicByPlayList() {
    electron_1.ipcMain.handle("getMusicByPlayList", async (event, playlistID) => {
        if (typeof config_1.TOKEN != "string")
            return;
        const res = await (0, axios_1.default)(`${config_1.API}/playlist/byplaylist/${playlistID}`, {
            headers: {
                Authorization: `Bearer ${config_1.TOKEN}`,
            },
        });
        return res.data;
    });
}
exports.getMusicByPlayList = getMusicByPlayList;
function sendNewProblemsADM() {
    electron_1.ipcMain.handle("sendNewProblemsADM", async (event, { musicID, title, detalle, }) => {
        if (typeof config_1.TOKEN != "string")
            return;
        const res = await axios_1.default.post(`${config_1.API}/email/new-problem`, {
            musicID,
            title,
            detalle,
        }, {
            headers: {
                Authorization: `Bearer ${config_1.TOKEN}`,
            },
        });
        return res.data;
    });
}
exports.sendNewProblemsADM = sendNewProblemsADM;
function openWebOficial() {
    electron_1.ipcMain.handle("openWebOficial", (event) => {
        electron_1.shell.openExternal("https://electronplayer.online");
        return;
    });
}
exports.openWebOficial = openWebOficial;
function closeApp(app) {
    electron_1.ipcMain.handle("closeApp", () => {
        app.quit();
    });
}
exports.closeApp = closeApp;
