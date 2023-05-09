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
