import { site } from "../config/site.ts";

export type SelectedFiles = {
  files: File[];
  ignoredCount: number;
};

export function takePdfFiles(
  fileList: FileList | File[] | null | undefined,
  max = site.maxPdfFiles,
): SelectedFiles {
  const all = fileList ? [...fileList] : [];
  return {
    files: all.slice(0, max),
    ignoredCount: Math.max(0, all.length - max),
  };
}
