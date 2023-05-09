import { ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { IFile, IFileResult } from "./types";

interface IMusics {
  path: string;
  name: string;
}

export function getMusicFolder() {
  ipcMain.handle("musicFolder", async (event) => {
    let directory = `C:\\Users\\${process.env.USERNAME}\\Music\\`;
    const result = fs.readdirSync(directory);

    //############################
    let mp3Files: IMusics[];
    mp3Files = result
      .filter((filename) => path.extname(filename) === ".mp3")
      .map(
        (filename): IMusics => ({ path: directory + filename, name: filename })
      );
    //############################
    return mp3Files;
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
