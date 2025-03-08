// src/types/wav-file-info.d.ts
declare module 'wav-file-info' {
    export function WavFileInfo(filePath: string): Promise<{
      fmt: {
        data_length: number;
        [key: string]: any;
      };
      [key: string]: any;
    }>;
  }