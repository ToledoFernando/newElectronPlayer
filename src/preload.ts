import { IMusicUrl, IResultSearch } from "./types";
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
