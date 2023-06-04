import { Notification, ipcMain, shell, webContents } from "electron";
import fs from "fs";
import path from "path";
import {
  IFile,
  IFileResult,
  IMusicUrl,
  IResultSearch,
  ISearchAPI,
} from "./types";
import yt_search from "yt-search";
import yt_core, { videoFormat } from "ytdl-core";
import axios from "axios";
import { API, TOKEN } from "./config";

export function getMusicFolder() {
  ipcMain.handle("musicFolder", async (event) => {
    let directory = `C:\\Users\\${process.env.USERNAME}\\Music\\`;
    const result = fs.readdirSync(directory);
    //############################
    let folders: IFile[];
    let mp3Files: IFile[];

    folders = result
      .filter((file) => {
        const fullPath = path.join(directory, file);
        return fs.statSync(fullPath).isDirectory();
      })
      .map((file) => ({
        path: path.join(directory, file),
        name: file,
      }));

    mp3Files = result
      .filter((filename) => path.extname(filename) === ".mp3")
      .map(
        (filename): IFile => ({ path: directory + filename, name: filename })
      );
    //############################
    return { files: mp3Files, folders };
  });
}

export function getMusic() {
  ipcMain.handle("getMusic", async (event, file: IFile) => {
    let result: IFileResult = {
      name: file.name,
      buffer: null,
    };
    result.buffer = fs.readFileSync(file.path);

    return result;
  });
}

export function getMusicFolderName() {
  ipcMain.handle("getMusicFolderName", async (event, folder: IFile) => {
    // console.log(folder);
    let directory = folder.path;
    const result = fs.readdirSync(directory);
    //############################
    let folders: IFile[];
    let mp3Files: IFile[];

    folders = result
      .filter((file) => {
        const fullPath = path.join(directory, file);
        return fs.statSync(fullPath).isDirectory();
      })
      .map((file) => ({
        path: path.join(directory, file),
        name: file,
      }));

    mp3Files = result
      .filter((filename) => path.extname(filename) === ".mp3")
      .map(
        (filename): IFile => ({
          path: directory + "\\" + filename,
          name: filename,
        })
      );
    //############################
    return { files: mp3Files, folders };
  });
}

export function backToFolder() {
  ipcMain.handle("getBackToFolder", async (event, folder: string[]) => {
    let directory = `C:\\Users\\${process.env.USERNAME}\\Music\\${folder.join(
      "\\"
    )}`;
    const result = fs.readdirSync(directory);
    //############################
    let folders: IFile[];
    let mp3Files: IFile[];

    folders = result
      .filter((file) => {
        const fullPath = path.join(directory, file);
        return fs.statSync(fullPath).isDirectory();
      })
      .map((file) => ({
        path: path.join(directory, file),
        name: file,
      }));

    mp3Files = result
      .filter((filename) => path.extname(filename) === ".mp3")
      .map(
        (filename): IFile => ({ path: directory + filename, name: filename })
      );
    //############################
    return { files: mp3Files, folders };
  });
}

export function searchMusicYT() {
  ipcMain.handle("searchMusicYT", async (event, search: string) => {
    const result = await yt_search(search);

    const musics: IResultSearch[] = [];

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

export function getURLMusic() {
  ipcMain.handle("getURLMusic", async (event, videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    const musicInfor = await yt_core.getInfo(url);

    let musics: videoFormat[] = [];

    for (let a = 0; a < musicInfor.formats.length; a++) {
      if (
        musicInfor.formats[a].container === "webm" &&
        musicInfor.formats[a].hasVideo === false &&
        musicInfor.formats[a].hasAudio === true
      ) {
        musics.push(musicInfor.formats[a]);
      }
    }

    return musics[0];
  });
}

function Download(ruta: IMusicUrl) {
  const name = ruta.name.replace(/[^a-zA-Z0-9]/g, " ");
  const file = fs.createWriteStream(
    `C:\\Users\\${process.env.USERNAME}\\Music\\${name}.mp3`
  );

  axios({
    url: ruta.url,
    method: "GET",
    responseType: "stream",
  })
    .then((response) => {
      const totalLength = response.headers["content-length"];

      response.data.pipe(file);

      response.data.on("data", (chunk: Buffer | string) => {
        const downloaded = file.bytesWritten;
        const progress = Math.round((downloaded / totalLength) * 10000) / 100;
        webContents.getAllWebContents().forEach((webContent) => {
          webContent.send("newProgress", Math.round(progress));
        });
      });

      response.data.on("end", () => {
        webContents.getAllWebContents().forEach((webContent) => {
          webContent.send("finishProgress", ruta.name);
        });
        new Notification({
          title: "Descarga Completa",
          body: ruta.name,
          icon: path.join(__dirname, "ico", "icon.png"),
        }).show();
        console.log("Download finished");
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

export function downloadMusicURL() {
  ipcMain.on("downloadMusicURL", (event, musica: IMusicUrl) => {
    new Notification({
      title: "Descargando Musica",
      body: musica.name,
      icon: path.join(__dirname, "ico", "icon.png"),
    }).show();
    Download(musica);
  });
}

export function getApiData() {
  ipcMain.handle("getApiData", async () => {
    if (typeof TOKEN != "string") return;
    const res = await axios(`${API}/music`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    return res.data;
  });
}

export function getMusicYTDL() {
  ipcMain.handle("getMusicYTDL", async (event, videoURL: string) => {
    const musicInfor = await yt_core.getInfo(videoURL);
    let musics: videoFormat[] = [];

    for (let a = 0; a < musicInfor.formats.length; a++) {
      if (
        musicInfor.formats[a].container === "webm" &&
        musicInfor.formats[a].hasVideo === false &&
        musicInfor.formats[a].hasAudio === true
      ) {
        musics.push(musicInfor.formats[a]);
      }
    }

    return musics[0];
  });
}

export function getAllPlayList() {
  ipcMain.handle("getAllPlayList", async (event) => {
    if (typeof TOKEN != "string") return;
    const res = await axios(`${API}/playlist/get-allplaylist`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    return res.data;
  });
}

export function getMusicByPlayList() {
  ipcMain.handle("getMusicByPlayList", async (event, playlistID: string) => {
    if (typeof TOKEN != "string") return;
    const res = await axios(`${API}/playlist/byplaylist/${playlistID}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    return res.data;
  });
}

export function sendNewProblemsADM() {
  ipcMain.handle(
    "sendNewProblemsADM",
    async (
      event,
      {
        musicID,
        title,
        detalle,
      }: { musicID: string; title: string; detalle: string }
    ) => {
      if (typeof TOKEN != "string") return;
      const res = await axios.post(
        `${API}/email/new-problem`,
        {
          musicID,
          title,
          detalle,
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      return res.data;
    }
  );
}

export function openWebOficial() {
  ipcMain.handle("openWebOficial", (event) => {
    shell.openExternal("https://electronplayer.online");
    return;
  });
}

export function getGenerosAPI() {
  ipcMain.handle("getGenerosAPI", async (event) => {
    const { data } = await axios(API + "/generos/", {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    return data;
  });
}

export function searchMusicAPI() {
  ipcMain.handle("searchMusicAPI", async (event, dataSearch: ISearchAPI) => {
    const { data } = await axios.post(API + "/music/search", dataSearch, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    return data;
  });
}

export function searchMusicByGener() {
  ipcMain.handle("searchMusicByGener", async (event, gener: string) => {
    const { data } = await axios.post(
      API + "/music/getmusicgener",
      { id: gener },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );
    return data;
  });
}

export function getPlayListByName() {
  ipcMain.handle("getPlayListsByName", async (event, name: string) => {
    const { data } = await axios.post(
      API + "/playlist/getplaylist-name",
      { name },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );
    return data;
  });
}

export function closeApp(app: any) {
  ipcMain.handle("closeApp", () => {
    app.quit();
  });
}
