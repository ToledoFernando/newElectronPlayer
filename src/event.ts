import { Notification, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { IFile, IFileResult, IMusicUrl, IResultSearch } from "./types";
import yt_search from "yt-search";
import yt_core, { videoFormat } from "ytdl-core";
import axios from "axios";

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
    // console.log(result.videoDetails);

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
      // const totalLength = response.headers["content-length"];

      response.data.pipe(file);

      // response.data.on("data", (chunk) => {
      //   const downloaded = file.bytesWritten;
      //   const progress = Math.round((downloaded / totalLength) * 10000) / 100;
      //   webContents.getAllWebContents().forEach((webContent) => {
      //     webContent.send("newProgress", progress);
      //   });
      // });

      response.data.on("end", () => {
        new Notification({
          title: "Descarga Completa",
          body: ruta.name,
          icon: "ico/icon.png",
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
      icon: "./icon.png",
    }).show();
    Download(musica);
  });
}
