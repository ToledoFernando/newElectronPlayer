export interface IFile {
  name: string;
  path: string;
}

export interface IFileResult {
  name: string;
  buffer: Buffer | ArrayBuffer | null;
}
