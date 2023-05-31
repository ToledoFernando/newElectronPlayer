import { IMusicUrl } from "./types";
import { IFile } from "./types";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("getMusicFolder", async () => {
  const music = await ipcRenderer.invoke("musicFolder");
  return music;
});

contextBridge.exposeInMainWorld("getMusic", async (file: IFile) => {
  const music = await ipcRenderer.invoke("getMusic", file);
  return music;
});

contextBridge.exposeInMainWorld("getMusicFolderName", async (folder: IFile) => {
  const music = await ipcRenderer.invoke("getMusicFolderName", folder);
  return music;
});

contextBridge.exposeInMainWorld("getBackToFolder", async (folder: string[]) => {
  const music = await ipcRenderer.invoke(
    "getBackToFolder",
    folder.slice(0, -1)
  );
  return music;
});

contextBridge.exposeInMainWorld("searchMusicYT", async (name: string) => {
  const musics = await ipcRenderer.invoke("searchMusicYT", name);
  return JSON.parse(musics);
});

contextBridge.exposeInMainWorld("getURLMusic", async (name: string) => {
  const musicURL = await ipcRenderer.invoke("getURLMusic", name);
  return musicURL;
});

contextBridge.exposeInMainWorld("send", (event: string, musica: IMusicUrl) => {
  return ipcRenderer.send(event, musica);
});

contextBridge.exposeInMainWorld(
  "received",
  (event: string, callback: (...args: any[]) => void) => {
    return ipcRenderer.on(event, callback);
  }
);

contextBridge.exposeInMainWorld("getApiData", async () => {
  const data = await ipcRenderer.invoke("getApiData");
  return data;
});

contextBridge.exposeInMainWorld("getMusicYTDL", async (videoURL: string) => {
  const data = await ipcRenderer.invoke("getMusicYTDL", videoURL);
  return data;
});

contextBridge.exposeInMainWorld("getAllPlayList", async () => {
  const data = await ipcRenderer.invoke("getAllPlayList");
  return data;
});

contextBridge.exposeInMainWorld(
  "getMusicByPlayList",
  async (playListID: string) => {
    const data = await ipcRenderer.invoke("getMusicByPlayList", playListID);
    return data;
  }
);

contextBridge.exposeInMainWorld("hide", async () => {
  await ipcRenderer.invoke("hide");
});

contextBridge.exposeInMainWorld(
  "sendNewProblemsADM",
  async ({
    musicID,
    title,
    detalle,
  }: {
    musicID: string;
    title: string;
    detalle: string;
  }) => {
    const result = await ipcRenderer.invoke("sendNewProblemsADM", {
      musicID,
      title,
      detalle,
    });
    console.log(result);
  }
);

contextBridge.exposeInMainWorld("openWebOficial", async () => {
  await ipcRenderer.invoke("openWebOficial");
  return;
});

contextBridge.exposeInMainWorld("closeApp", async () => {
  const data = await ipcRenderer.invoke("closeApp");
  return data;
});
