import { ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { IFile, IFileResult } from "./types";

interface IMusics {
  path: string;
  name: string;
}

interface IFolders {
  path: string;
  name: string;
}

export function getMusicFolder() {
  ipcMain.handle("musicFolder", async (event) => {
    let directory = `C:\\Users\\${process.env.USERNAME}\\Music\\`;
    const result = fs.readdirSync(directory);
    //############################
    let folders: IFolders[];
    let mp3Files: IMusics[];

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
        (filename): IMusics => ({ path: directory + filename, name: filename })
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
    let folders: IFolders[];
    let mp3Files: IMusics[];

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
        (filename): IMusics => ({
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
    let folders: IFolders[];
    let mp3Files: IMusics[];

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
        (filename): IMusics => ({ path: directory + filename, name: filename })
      );
    //############################
    return { files: mp3Files, folders };
  });
}
